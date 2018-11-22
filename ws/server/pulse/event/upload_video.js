const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
// const USER = require('../../../../models/users');
const CHANNEL = require('../../../../models/channel');
const {select, pre} = require('../../../utils');
const cuid = require('cuid');
const _ = require('lodash');
/**
 * @description handle uploading videos, ALL incoming image file is in BASE64 encoding
 * @type {up-vod}
 * @external data.t imcoming data type: [up-vod]
 * @external data.d imcoming [base64] data 
 * @external data.i data index 0,1,2... [-1] indicates finish
 * @external data.h video hash [md5] ! required in first transfer - index[0];
 * @external data.e video extension ! required in first transfer - index[0];
 */


let basePath, write_path, manifestDir, write_name, ext, hash, fullname;

module.exports = async (socket, data, pulse) => {
  // console.log(data.i, data.h, data.e);
  if (!socket.allowed) terminate(socket, 'Message not allowed{10}.');
  if (!socket.UID) terminate(socket, 'Not login{2}.');
  // check params;
  if (typeof data.i !=='number' || !data.d) return socket.send(pre({t: 'up-vod', err: '缺少必要参数，请稍后重试{1}'}, socket.isBuffer));
  // initial data in first run
  if (data.i === 0) {
    if (!data.h || !data.e) return socket.send(pre({t: 'up-vod', err: '缺少必要参数，请稍后重试{2}'}, socket.isBuffer));
    basePath = path.normalize(path.join(__dirname, `../../../../user-channel-data/${socket.UID}/`));
    write_path = path.join(basePath, 'videos/');
    manifestDir = path.join(basePath, `manifest/`);
    write_name = cuid();
    ext = data.e;
    fullname = write_name + '.' + ext;
    hash = data.h; // store hash
    // make directory
    if (!fs.existsSync(basePath)) fs.mkdirSync(basePath);
    if (!fs.existsSync(write_path)) fs.mkdirSync(write_path);
    if (!fs.existsSync(manifestDir)) fs.mkdirSync(manifestDir);
    // create obj
    if (!socket.writeFile) socket.writeFile = {};
    // check if user is uploading the same video
    if (!socket.writeFile[hash]) {
      socket.writeFile[hash] = {};
      socket.writeFile[hash].finish = false;
      // socket.writeFile[data.n].frags = data.v;
      socket.writeFile[hash].name = fullname;
      socket.writeFile[hash].index = 0;
      socket.writeFile[hash].writeStream = fs.createWriteStream(write_path + fullname, {
        flag: 'r+', 
        encoding: 'base64', 
        autoClose: true, 
        start: 0
      });
      socket.writeFile[hash].writeStream.on('close', async (e) => {
        const file = write_path + fullname; // without file extension
        console.log('uploading done.');
        console.log(file);
        try {
          // when upload finished: do following things
          // 1. get original video's metadata
          const meta = await getVideoInfo(file);
          // 2. analyse video compare with standard
          const analysed = analyseVideo(meta);
          // 2.1 prepare new directory (use write_name as folder name)
          const dir = path.join(manifestDir, write_name);
          if (!fs.existsSync(dir)) fs.mkdirSync(dir);
          // 3. process video according to analysed info
          const processed = await processVideo(socket.UID, write_name, analysed, file, dir);
          // 4. save everything to database

          // 5. if all done with no error, send out url to client
          socket.send(pre({t:'up-vod', l: processed}, socket.isBuffer));
        }catch(e) {
          // if error
          console.log(e)
          socket.send(pre({t:'up-vod', err: '视频已损坏'}, socket.isBuffer));
        }
        // clear tracking object
        if (socket.writeFile[hash].finish) delete socket.writeFile[hash];
      });

      // in case user is over uploading the same video twice
    } else {
      socket.send(pre({t:'up-vod', err: '视频已经上传'}, socket.isBuffer));
    }
  }
  
  
  

  // runs when transfer not finished AND incoming index equals internal counter;
  if (data.i !== -1 && socket.writeFile[hash].index === data.i) {
    // socket.writeFile[data.h].frags = data.d;
    if (data.i === 0) { // first frag
      socket.writeFile[hash].writeStream.on('open', (e) => {
        socket.writeFile[hash].open = true;
        socket.writeFile[hash].writeStream.write(data.d);
        socket.send(pre({t:'up-vod'}, socket.isBuffer));
      });
    } else {  // rest frags
      socket.writeFile[hash].writeStream.write(data.d);
      socket.send(pre({t:'up-vod'}, socket.isBuffer));
    }
    socket.writeFile[hash].index++;
  // runs when transfer finished
  } else if (data.i === -1) {
    socket.writeFile[hash].writeStream.write(data.d);
    socket.writeFile[hash].finish = true;
    socket.writeFile[hash].writeStream.end();
  }
}


async function getVideoInfo (path) {
  let output = '';
  return new Promise((resolve, reject) => {
    const commend = `-v error -show_streams -of json ${write_path + fullname}`;
    const analyse = spawn('ffprobe', commend.split(' '));
    
    analyse.stdout.on('data', (data) => {
      console.log('analysing video info ... ...');
      console.log(data.toString());
      output += data.toString();
    });
  
    analyse.stderr.on('data', (data) => {
      console.log(data.toString());
      reject();
    });
  
    analyse.on('exit', (code) => {
      console.log(`Child exited with code ${code}`);
      const video = JSON.parse(output);
      const meta = {
        video_codec: video.streams[0].codec_name,
        video_width: video.streams[0].width,
        video_height: video.streams[0].height,
        video_duration: video.streams[0].duration,
        video_frame_rate: video.streams[0].r_frame_rate,
        video_display_aspect_ratio: video.streams[0].display_aspect_ratio,
        video_bitRate: video.streams[0].bit_rate,
        audio_codec: video.streams[1].codec_name,
        audio_bitRate: video.streams[1].bit_rate,
        audio_sample_rate: video.streams[1].sample_rate
      }
      resolve(meta);
    });
  })
}


function analyseVideo (data) {
  console.log(data);
  const encodeingGuide = {
    '2160p': {
      pixel: 3840 * 2160,
      bitrate: [35, 45]
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
  let type, diff;
  for (let t in encodeingGuide) {
    const temp = Math.abs(encodeingGuide[t].pixel - size);
    if (typeof diff === 'undefined') {
      diff = temp;
      type = t;
    } else if (temp < diff) {
      diff = temp;
      type = t;
    }
  }
  const bitrateDiff = (data.video_bitRate / 1000000) - encodeingGuide[type].bitrate;
  return {type, bitrateDiff}
}



// Type	          Video Bitrate,Standard Frame Rate(24, 25, 30)             Video Bitrate, High Frame Rate(48, 50, 60)
// 2160p (4k)	    35-45 Mbps	                                              53-68 Mbps
// 1440p (2k)	    16 Mbps	                                                  24 Mbps
// 1080p	        8 Mbps	                                                  12 Mbps
// 720p	          5 Mbps	                                                  7.5 Mbps
// 480p	          2.5 Mbps	                                                4 Mbps
// 360p	          1 Mbps	                                                  1.5 Mbps

// 2160p: 3840x2160
// 1440p: 2560x1440
// 1080p: 1920x1080
// 720p: 1280x720
// 480p: 854x480
// 360p: 640x360
// 240p: 426x240

function processVideo(UID, filename, analysed, source, destination) {
  const commend = `-re -y -i ${source} -seg_duration 2 -f dash ${destination}/${filename}.mpd`;
  // return console.log(commend);
  const process = spawn('ffmpeg', commend.split(' '));
  console.log(analysed);
  return new Promise((resolve, reject) => {
    process.stdout.on('data', (data) => {
      console.log('generating video menifest ... ...');
    });
  
    process.stderr.on('data', (data) => {
      console.log(data.toString());
      // reject();
    });
  
    process.on('exit', (code) => {
      console.log(`Video menifest in Directory: ${destination}/${filename}.mpd`);
      resolve({
        local: `${destination}/${filename}.mpd`,
        server: `https://localhost:5000/videos/${UID}.${write_name}/${filename}.mpd`
      });
    });
  })
}

// -g GOP size (group of pictures) the smaller the easier to seek and edit, !*multiple of frame rate*!

// ffmpeg -re -y -i /Users/magic/Documents/nodejs/reef-magic-API/user-channel-data/cjon0c9d20002xnfyp5de3vh8/videos/cjot041cc0001gqaqv83me4f6.mp4 -time_shift_buffer_depth 0 -g 60 -use_timeline 1 -use_template 1 -use_wallclock_as_timestamps 1 -min_seg_duration 2000 -init_seg_name init-$RepresentationID$.mp4 -media_seg_name chunk-stream$RepresentationID$-$Number%05d$.$ext$ -f dash /Users/magic/Documents/nodejs/reef-magic-API/user-channel-data/cjon0c9d20002xnfyp5de3vh8/manifest/18e7a45014db340c08a2e9f0b8051641/out.mpd
//ok! ffmpeg -re -y -i /Users/magic/Downloads/1.mp4 -seg_duration 3 -f dash /Users/magic/Documents/nodejs/reef-magic-API/user-channel-data/cjon0c9d20002xnfyp5de3vh8/manifest/3a20e1df9259ee0aa63f306bc7810f88/out.mpd 

// ffmpeg -hide_banner -y -threads 0 -i INPUT_VIDEO -filter_complex 'split=2[s0][s1];[s0]scale=480:-2[480s];[s1]scale=360:-2[360s]' -map '[480s]' -c:v:0 libx264 -crf 25 -preset veryslow -map '[360s]' -c:v:1 libx264 -crf 27 -preset veryslow -map a -c:a:0 libfdk_aac -ar:a:0 22050 -map a -c:a:1 libfdk_aac -ar:a:1 44100 -g 150 -sc_threshold 0 -b_strategy 0 -min_seg_duration 5000 -use_timeline 0 -use_template 1 -single_file  1 -window_size 5 -adaptation_sets "id=0,streams=v id=1,streams=a" -f dash OUTPUT.mpd
// ffmpeg -i /Users/magic/Documents/nodejs/reef-magic-API/user-channel-data/cjon0c9d20002xnfyp5de3vh8/videos/cjosjxa4v00023eaqa2l7h82z.mp4 -min_seg_duration 3000 -f dash /Users/magic/Documents/nodejs/reef-magic-API/user-channel-data/cjon0c9d20002xnfyp5de3vh8/manifest/18e7a45014db340c08a2e9f0b8051641/out.mpd
