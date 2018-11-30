const path = require('path');
const fs = require('fs');
const cuid = require('cuid');
const { spawn } = require('child_process');
const md5 = require('../../helper/md5').hex_md5;
// restrictions
const mimeType = ['video'];
const maxDuration = 10 * 60;
const maxSize = 200 * 1024 * 1024;

module.exports = (req, res, uid) => {
  console.log('-------------------UPloading---------------------');
  const file = req.files.file;
  if (!~mimeType.indexOf(file.mimetype.split('/')[0])) return res.status(200).send({err: 'upload file MIMEtype error'});
  // video size control
  if (file.data.length > maxSize ) return res.status(200).send({err: 'video Size excceds 200Mb.'});
  const name = cuid();
  const nameArray = file.name.split('.');
  const extension = nameArray[nameArray.length - 1];
  const newname = `${name}.${extension}`;
  const basePath = path.normalize(path.join(process.USER_VIDEO_FOLDER, `${req.body.uid}/videos/`));
  if (!fs.existsSync(basePath)) fs.mkdirSync(basePath, { recursive: true });
  const dest = basePath + newname;
  const hash = md5(file.data.slice(0,1000).toString());


  // check if upload the same video
  if (process.videoUploadList[uid].hash === hash) return res.status(200).send({err: '重复上传'});
  

  file.mv(dest, async (err) => {
    if (err) return res.status(200).send({err});
    
    // 1. get original video's metadata
    const meta = await getVideoInfo(dest);
    console.log(meta);
    // video duration control
    if (meta.video_duration > maxDuration) {
      fs.unlink(dest, () => {});
      return res.status(200).send({err: 'video Duration excceds 10 minutes.'});
    }
    // video bitrate control
    if (!meta.video_bitRate) {
      fs.unlink(dest, () => {});
      return res.status(200).send({err: 'video Bit-Rate is invalid.'});
    }
    const analysed = analyseVideo(meta);
    // (*optional) check video quality <= 1080p. not support 2K, 4k yet
    // if (analysed.support.length > 4) {
    //   fs.unlink(dest, () => {});
    //   return res.status(200).send({uploaded: false, err: 'video Quality exceeds 1080P'});
    // }
    process.videoUploadList[uid].process = 1;
    process.videoUploadList[uid].uploadUrl = dest;
    process.videoUploadList[uid].hash = hash;
    process.videoUploadList[uid].basePath = basePath;
    process.videoUploadList[uid].name = name;
    process.videoUploadList[uid].analysed = analysed;
    console.log(process.videoUploadList);
    return res.status(200).send({analysed, process: 1});
  })
}

async function getVideoInfo (path) {
  let output = '';
  return new Promise((resolve, reject) => {
    const commend = `-v error -show_streams -of json ${path}`;
    const analyse = spawn('ffprobe', commend.split(' '));
    const index = {}
    
    analyse.stdout.on('data', (data) => {
      output += data.toString();
    });
  
    analyse.stderr.on('data', (data) => {
      reject(data.toString());
    });
  
    analyse.on('exit', (code) => {
      const video = JSON.parse(output);
      if (Object.keys(video).length === 0) reject();
      for (let stream of video.streams) {
          index[stream.codec_type] = stream.index;
      }
      const meta = {
        video_codec: video.streams[index.video].codec_name,
        video_width: video.streams[index.video].width,
        video_height: video.streams[index.video].height,
        video_duration: video.streams[index.video].duration,
        video_frame_rate: video.streams[index.video].r_frame_rate,
        video_display_aspect_ratio: video.streams[index.video].display_aspect_ratio,
        video_bitRate: video.streams[index.video].bit_rate || null,
        audio_codec: video.streams[index.audio].codec_name,
        audio_bitRate: video.streams[index.audio].bit_rate || null,
        audio_sample_rate: video.streams[index.audio].sample_rate,
      }
      resolve(meta);
    });
  })
}

function analyseVideo (data) {
  const encodeingGuide = {
    '2160p': {
      pixel: 3840 * 2160,
      bitrate: 35 // [35, 45]
    },
    '1440p': {
      pixel: 2560 * 1440,
      bitrate: 16
    },
    '1080p': {
      pixel: 1920 * 1080,
      bitrate: 8
    },
    '720p': {
      pixel: 1280 * 720,
      bitrate: 5
    },
    '480p': {
      pixel: 854 * 480,
      bitrate: 2.5
    },
    '360p': {
      pixel: 426 * 240,
      bitrate: 1
    },
  }
  const size = data.video_width * data.video_height;
  let support = [], type, diff;
  for (let t in encodeingGuide) {
    const temp = Math.abs(encodeingGuide[t].pixel - size);
    if (typeof diff === 'undefined') {
      diff = temp;
      type = t;
    } else if (temp < diff) {
      diff = temp;
      type = t;
    }
    if (size >= encodeingGuide[t].pixel) support.push(t);
  }
  const bitrateDiff = (parseInt(data.video_bitRate, 10) / 1000000) - encodeingGuide[type].bitrate;
  return {type, support, bitrateDiff}
}