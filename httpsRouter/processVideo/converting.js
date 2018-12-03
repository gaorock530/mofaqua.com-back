
const { spawn } = require('child_process');

const convertingType = ['1080p', '720p', '480p'];
let index;
module.exports = async (req, res, uid) => {
  console.log('-------------------Converting---------------------');
  // if (!process.videoUploadList[uid])
  try {
    index = convertingType.indexOf(process.videoUploadList[uid].analysed.type);
    if (!~index) index = 0;
    // 3. convert video to its nearset format
    const converted = await convertVideo(
      process.videoUploadList[uid].uploadUrl, 
      process.videoUploadList[uid].basePath, 
      process.videoUploadList[uid].name
    )
    process.videoUploadList[uid].process = 2;
    process.videoUploadList[uid].convertedUrl = converted;
    console.log(process.videoUploadList);
    res.status(200).send({process: 2, converted});
  }catch(e) {
    console.log(e);
    res.status(200).send({err: 'server error'});
  }
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
    const res2 = await excuteCommend(commend[index].cmd, commend[index].type, index);
    converted.push(`${path + name}-temp${res2}.mp4`)
  }catch(e) {
    console.log('err', e)
    const back = await excuteCommend(backup[e].cmd, backup[e].type, e);
    converted.push(`${path + name}-temp${back}.mp4`)
  }
  return converted;
}

function excuteCommend (cmd, type, track) {
  // return console.log(cmd, type);
  const processVideo = spawn('ffmpeg', cmd.split(' '));
  console.log(`converting video - ${type} ... ...`);
  return new Promise((resolve, reject) => {
  
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
