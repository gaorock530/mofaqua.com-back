const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const upload = require('express-fileupload');
const cuid = require('cuid');
const axios = require('axios');
// database
const System = require('../models/system');

module.exports = (app) => {
  // basic router
  app.get('/citylist', async (req, res) => {
    let list;
    try {
      const data = await System.findOne().sort({'cityList.version': -1});
      if (!data) {
        const newdata = await axios({
          method: 'get',
          url: 'https://apis.map.qq.com/ws/district/v1/list?key=BBYBZ-2A66F-UDJJ2-NSWRG-VD3TZ-VSFE2&output=jsonp&callback=cb',
          responseType: 'jsonp'
        });
        const listObj = JSON.parse(newdata.data.slice(7, newdata.data.length - 1));
        const doc = new System({'cityList.list': listObj.result, 'cityList.version': listObj.data_version});
        const saved = await doc.save();
        list = saved.cityList.list;
      } else {
        list = data.cityList.list;
      }
      res.status(200).send(list);
    }catch(e) {
      console.log(e);
      res.status(404).send(e);
    }
    

    
    // try {
    //   const saved = await doc.save();
    //   console.log(saved);
    //   res.status(200).send('ok');
    // }catch(e) {
    //   console.log(e);
    //   res.status(404).send(e);
    // }
    
  })

  // handle user icon image request
  app.get('/images/:category/:name/:file', (req, res) => {
    const name = req.params.file.split('.');
    const file = `../user-images/${req.params.name}/${req.params.category}/${name[1]}.${name[2]}`;
    const out = normal(file);
    console.log(out)
    if (fileExists(file, 'file')) {
      res.status(200).sendFile(out);
    } else {
      res.status(404).send('no');
    }
  })

  // handles video file request (out.mpd -> *.mp4)
  app.get('/videos/:dir/:quality/:file', (req, res) => {
    console.log(req.params);
    // :dir = uid + file
    // "https://localhost:5000/videos/cjon0c9d20002xnfyp5de3vh8.cjot57gvj00068faqcl2104aa/cjot57gvj00068faqcl2104aa.mpd"
    const uid = req.params.dir.split('.')[0];
    const file = req.params.dir.split('.')[1];
    const dir = `../user-channel-data/${uid}/manifest/${file}/${req.params.quality}/${req.params.file}`
    const out = normal(dir);
    if (fileExists(dir, 'file')) {
      res.status(200).sendFile(out);
    } else {
      res.status(404).send('no');
    }
  })

  // handle channel cover image request
  // app.get('/images/channel-cover/:name/:file', (req, res) => {
  //   const name = req.params.file.split('.');
  //   const file = '/user-images/' + req.params.name + '/channel-cover/' + name[1] +'.'+ name[2];
  //   if (fileExists(file, 'file')) {
  //     res.status(200).sendFile(path.join(__dirname, file));
  //   } else {
  //     res.status(404).send('no');
  //   }
  // })
// app.use(upload({
//   limits: { fileSize: 50 * 1024 * 1024 }
// }))
  app.post('/', upload({createParentPath: true}), (req, res) => {
    const file = req.files.file;
    const name = cuid();
    const nameArray = file.name.split('.');
    const extension = nameArray[nameArray.length - 1];
    const newname = `${name}.${extension}`;
    const basePath = path.normalize(path.join(__dirname, `../user-channel-data/${req.body.uid}/videos/`));
    const manifestPath = path.normalize(path.join(__dirname, `../user-channel-data/${req.body.uid}/manifest/`));
    const dest = basePath + newname;
    console.log(basePath);
    console.log(file)
    if (file.mimetype.split('/')[0] !== 'video') return res.status(200).send({uploaded: false, err: 'upload file MIMEtype error'});
    // video size control
    if (file.data.length > 200 * 1024 * 1024) return res.status(200).send({uploaded: false, err: 'video Size excceds 200Mb.'});
    file.mv(dest, async (err) => {
      if (err) res.status(200).send({uploaded: false, err});
      try {
        // when upload finished: do following things
        // 1. get original video's metadata
        const meta = await getVideoInfo(dest);
        // video duration control
        if (meta.video_duration > 600) {
          fs.unlink(dest);
          return res.status(200).send({uploaded: false, err: 'video Duration excceds 10 minutes.'});
        }
        // video bitrate control
        if (!meta.video_bitRate) {
          fs.unlink(dest);
          return res.status(200).send({uploaded: false, err: 'video Bit-Rate is invalid.'});
        }
        // 2. analyse video compare with standard
        const analysed = analyseVideo(meta);
        const converted = await convertVideo(dest, basePath, name)
        const manifestUrl = await sliceVideo(basePath, name, manifestPath, converted, req.body.uid);
        // (*optional) check video quality <= 1080p. not support 2K, 4k yet
        // if (analysed.type.length > 4) {
        //   fs.unlink(basePath);
        //   return res.status(200).send({uploaded: false, err: 'video Quality exceeds 1080P'});
        // }
        res.status(200).send({url: manifestUrl, uploaded: analysed, err: null});
      }catch(e) {
        console.log(e);
        res.status(200).send({uploaded: false, err: 'server error'});
      }
      
      
    })
  })
}



/* -------------- Functions ------------------- */

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

async function convertVideo (dest, path, name) {
  const commend = [
    {
      type: '1080', 
      cmd: `-v error -y -threads 8 -i ${dest} -c:v libx264 -preset fast -b:v 8000k -c:a aac -b:a 128k -vf scale=-1:1080 ${path + name}-temp1080.mp4`
    },
    {
      type: '720', 
      cmd: `-v error -y -threads 8 -i ${dest} -c:v libx264 -preset fast -b:v 5000k -c:a aac -b:a 128k -vf scale=-1:720 ${path + name}-temp720.mp4`
    },
    {
      type: '480', 
      cmd: `-v error -y -threads 8 -i ${dest} -c:v libx264 -preset fast -b:v 2500k -c:a aac -b:a 128k -vf scale=-1:480 ${path + name}-temp480.mp4`
    },
  ]
  const backup = [
    {
      type: '1080', 
      cmd: `-v error -y -threads 8 -i ${dest} -c:v libx264 -preset fast -b:v 8000k -c:a aac -b:a 128k -vf scale=-1:1080 ${path + name}-temp1080.mp4`
    },
    {
      type: '720', 
      cmd: `-v error -y -threads 8 -i ${dest} -c:v libx264 -preset fast -b:v 5000k -c:a aac -b:a 128k -vf scale=-1:740 ${path + name}-temp720.mp4`
    },
    {
      type: '480', 
      cmd: `-v error -y -threads 8 -i ${dest} -c:v libx264 -preset fast -b:v 2500k -c:a aac -b:a 128k -vf scale=-1:460 ${path + name}-temp480.mp4`
    },
  ]
  const converted = [];
  try {
    // await excuteCommend(commend[0].cmd, commend[0].type, 0);
    // const res1 = await excuteCommend(commend[1].cmd, commend[1].type, 1);
    // converted.push(res1)
    const res2 = await excuteCommend(commend[2].cmd, commend[2].type, 2);
    converted.push(res2)
  }catch(e) {
    const back = await excuteCommend(backup[e].cmd, backup[e].type, e);
    converted.push(back)
  }
  return converted;
}


function excuteCommend (cmd, type, track) {
  // return console.log(cmd, type);
  const processVideo = spawn('ffmpeg', cmd.split(' '));
  console.log(`generating video - ${type} menifest ... ...`);
  return new Promise((resolve, reject) => {
    // processVideo.stdout.on('data', (data) => {
    //   console.log(`generating video - ${type} menifest ... ...`);
    // });
  
    processVideo.stderr.on('data', (data) => {
      console.log(`------------- Error ---------------`);
      console.log(data.toString());
      reject(track);
    });
  
    processVideo.on('exit', (code) => {
      console.log(`${type} converting ends.`);
      resolve(type);
    });
  })
}

function sliceVideo(basePath, name, destination, qualityList, uid) {
  const dest = path.join(destination, `${name}/${qualityList[0]}`);
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  const commend = `-v error -y -threads 8 -i ${basePath}${name}-temp${qualityList[0]}.mp4 -seg_duration 2 -f dash ${dest}/out.mpd`;

  console.log(commend);
  console.log(`generating video menifest for ${qualityList[0]} ... ...`);
  const processVideo = spawn('ffmpeg', commend.split(' '));
  return new Promise((resolve, reject) => {
  
    processVideo.stderr.on('data', (data) => {
      console.log(data.toString());
      reject();
    });
  
    processVideo.on('exit', (code) => {
      // /videos/:dir/:quality/:file
      console.log(`${qualityList[0]} slicing ends.`);
      console.log(`generate URL: ${process.env.HOST}/videos/${uid}.${name}/${qualityList[0]}/out.mpd`)
      resolve(`${process.env.HOST}/videos/${uid}.${name}/${qualityList[0]}/out.mpd`)
    });
  })
}


function fileExists(filePath, type = 'dir') {
  filePath = path.normalize(path.join(__dirname, filePath));
  // console.log(filePath, type);
  try{
    if (type === 'dir') return fs.statSync(filePath).isDirectory();
    if (type === 'file') return fs.statSync(filePath).isFile();
  }catch (err){
    return false;
  }
}

function normal (filePath) {
  return path.normalize(path.join(__dirname, filePath));
}