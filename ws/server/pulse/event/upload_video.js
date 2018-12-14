const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
// const USER = require('../../../../models/users');
const CHANNEL = require('../../../../models/channel');
const {select, pre} = require('../../../utils');
const cuid = require('cuid');
const _ = require('lodash');
/**
 * @description handle uploading videos, record and track video upload status
 * @type {up-vod}
 */



module.exports = async (socket, data) => {
  console.log('------------------writing record to Video database------------------');
  console.log('HOST', process.env.HOST)
  // console.log(data.i, data.h, data.e);
  if (!socket.allowed) terminate(socket, 'Message not allowed{10}.');
  if (!socket.UID) terminate(socket, 'Not login{2}.');
  // check params;
  if (typeof data.i !=='number' || !data.d) return socket.send(pre({t: 'up-vod', err: '缺少必要参数，请稍后重试{1}'}, socket.isBuffer));
  

}




// -g GOP size (group of pictures) the smaller the easier to seek and edit, !*multiple of frame rate*!

// ffmpeg -re -y -i /Users/magic/Documents/nodejs/reef-magic-API/user-channel-data/cjon0c9d20002xnfyp5de3vh8/videos/cjot041cc0001gqaqv83me4f6.mp4 -time_shift_buffer_depth 0 -g 60 -use_timeline 1 -use_template 1 -use_wallclock_as_timestamps 1 -min_seg_duration 2000 -init_seg_name init-$RepresentationID$.mp4 -media_seg_name chunk-stream$RepresentationID$-$Number%05d$.$ext$ -f dash /Users/magic/Documents/nodejs/reef-magic-API/user-channel-data/cjon0c9d20002xnfyp5de3vh8/manifest/18e7a45014db340c08a2e9f0b8051641/out.mpd
//ok! ffmpeg -re -y -i /Users/magic/Downloads/1.mp4 -seg_duration 3 -f dash /Users/magic/Documents/nodejs/reef-magic-API/user-channel-data/cjon0c9d20002xnfyp5de3vh8/manifest/3a20e1df9259ee0aa63f306bc7810f88/out.mpd 

// ffmpeg -hide_banner -y -threads 0 -i INPUT_VIDEO -filter_complex 'split=2[s0][s1];[s0]scale=480:-2[480s];[s1]scale=360:-2[360s]' -map '[480s]' -c:v:0 libx264 -crf 25 -preset veryslow -map '[360s]' -c:v:1 libx264 -crf 27 -preset veryslow -map a -c:a:0 libfdk_aac -ar:a:0 22050 -map a -c:a:1 libfdk_aac -ar:a:1 44100 -g 150 -sc_threshold 0 -b_strategy 0 -min_seg_duration 5000 -use_timeline 0 -use_template 1 -single_file  1 -window_size 5 -adaptation_sets "id=0,streams=v id=1,streams=a" -f dash OUTPUT.mpd
// ffmpeg -i /Users/magic/Documents/nodejs/reef-magic-API/user-channel-data/cjon0c9d20002xnfyp5de3vh8/videos/cjosjxa4v00023eaqa2l7h82z.mp4 -min_seg_duration 3000 -f dash /Users/magic/Documents/nodejs/reef-magic-API/user-channel-data/cjon0c9d20002xnfyp5de3vh8/manifest/18e7a45014db340c08a2e9f0b8051641/out.mpd
