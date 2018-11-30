const cuid = require('cuid');
const {pre} = require('../../../utils');
/**
 * @exports t:'g-p' generate permit for video upload
 */

process.videoUploadList = {
  'uid': {
    process: 0,               // 0 - no work, 1 - uploading, 2 - converting, 3 - making manifest
    inProcess: false,         // true - in process, false - no work
    working: false,           // true - uploading started, false - all done
    fileUrl: '',
    manifestUrl: '',
  }
}

module.exports = async (socket) => {
  const permit = cuid();
  if (!process.videoUploadList[socket.user.UID]) process.videoUploadList[socket.user.UID] = {
    process: 0,               // 0 - no work, 1 - uploading, 2 - converting, 3 - making manifest
    inProcess: false,         // true - in process, false - no work
    working: false,           // true - uploading started, false - all done
    uploadUrl: '',
    convertedUrl: [],
    manifestUrl: {dash: [], hls: []},
    hash: '',
    permit
  } 
  process.videoUploadList[socket.user.UID].permit = permit;
  process.videoUploadList[socket.user.UID].process = 0;
  console.log('permit', permit);
  socket.send(pre({t: 'g-p', p: permit}, socket.isBuffer));
}