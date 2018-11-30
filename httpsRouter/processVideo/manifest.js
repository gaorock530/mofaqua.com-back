const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');


module.exports = async (req, res, uid) => {
  console.log('-------------------Generating manifest---------------------');
  // 4. make Dash/Hls manifest
  const manifestPath = path.normalize(path.join(process.USER_VIDEO_FOLDER, `${uid}/manifest/`));
  try {

    console.log(`In process: ${1}/${process.videoUploadList[uid].convertedUrl.length}`);
    const dash_manifest = await sliceDash(
      process.videoUploadList[uid].convertedUrl[0],   // originPath
      manifestPath,                                   // destination
      process.videoUploadList[uid].analysed.type,     // quality
      uid,                                            // uid
      process.videoUploadList[uid].name               // name
    )
    process.videoUploadList[uid].manifestUrl.dash.push(dash_manifest);
    const hls_manifest = await sliceHLS(
      process.videoUploadList[uid].convertedUrl[0],   // originPath
      manifestPath,                                   // destination
      process.videoUploadList[uid].analysed.type,     // quality
      uid,                                            // uid
      process.videoUploadList[uid].name               // name
    )
    process.videoUploadList[uid].manifestUrl.hls.push(hls_manifest);

    fs.unlink(process.videoUploadList[uid].uploadUrl, () => {});
    fs.unlink(process.videoUploadList[uid].convertedUrl[0], () => {});
    
    console.log(process.videoUploadList);
    res.status(200).send({url: process.videoUploadList[uid].manifestUrl});
    delete process.videoUploadList[uid];
  }catch(e){
    console.log(e);
    res.status(200).send({err: 'generating manifest err'});
  }
  
}

function sliceDash(originPath, destination, quality, uid, name) {
  const dest = path.join(destination, `${name}/dash/${quality}`);
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  const commend = `-v error -y -threads 8 -i ${originPath} -seg_duration 2 -f dash ${dest}/out.mpd`;
  console.log(commend);
  console.log(`generating video DASH menifest for ${quality} ... ...`);
  const processVideo = spawn('ffmpeg', commend.split(' '));
  return new Promise((resolve, reject) => {
  
    processVideo.stderr.on('data', (data) => {
      console.log(data.toString());
      reject();
    });
  
    processVideo.on('exit', (code) => {
      // /videos/:dir/:quality/:file
      console.log(`${quality} slicing ends.`);
      console.log(`generate URL: ${process.env.HOST}/videos/${uid}.${name}.dash/${quality}/out.mpd`)
      resolve(`${process.env.HOST}/videos/${uid}.${name}.dash/${quality}/out.mpd`)
    });
  })
}

function sliceHLS(originPath, destination, quality, uid, name) {
  const dest = path.join(destination, `${name}/hls/${quality}`);
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  //ffmpeg -y -threads 8 -i /Users/magic/Downloads/video/Chasing.coral-1080.mp4 -hls_time 2 -hls_playlist_type vod -hls_list_size 0 -master_pl_name master.m3u8 -f hls /Users/magic/Documents/nodejs/reef-magic-API/user-channel-data/ChasingCoral/manifest/1080-hls/out.m3u8
  const commend = `-v error -y -threads 8 -i ${originPath} -hls_time 2 -hls_playlist_type vod -hls_list_size 0 -master_pl_name master.m3u8 -f hls ${dest}/out.m3u8`;
  console.log(commend);
  console.log(`generating video HLS menifest for ${quality} ... ...`);
  const processVideo = spawn('ffmpeg', commend.split(' '));
  return new Promise((resolve, reject) => {
  
    processVideo.stderr.on('data', (data) => {
      const err = data.toString();
      console.log(err);
      if (err.match(/[hls @ 0x7fe6f982d400]/g)) {
        resolve(`${process.env.HOST}/videos/${uid}.${name}.hls/${quality}/master.m3u8`)
      }
      reject();
    });
  
    processVideo.on('exit', (code) => {
      // /videos/:dir/:quality/:file
      console.log(`${quality} slicing ends.`);
      console.log(`generate URL: ${process.env.HOST}/videos/${uid}.${name}.hls/${quality}/master.m3u8`)
      resolve(`${process.env.HOST}/videos/${uid}.${name}.hls/${quality}/master.m3u8`)
    });
  })
}