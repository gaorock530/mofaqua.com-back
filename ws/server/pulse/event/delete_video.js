const VIDEOS = require('../../../../models/videos');
const {pre, terminate} = require('../../../utils');
const USER = require('../../../../models/users');
/**
 * @description publish videos and save to the database
 * @type {del-vod} publish videos
 */

module.exports = async (socket, data) => {
  if (!socket.allowed) terminate(socket, 'Message not allowed{2}.');
  if (!socket.UID) terminate(socket, 'Not login{2}.');
  
  try {
    if (!data.video)
      await USER.findOneAndUpdate({UID: socket.UID}, { $pull: { upload : {hash: data.hash}}});
    else 
      await VIDEOS.findOneAndDelete({UID: socket.UID, hash: data.hash});
    socket.send(pre({t: 'del-vod'}, socket.isBuffer));
  }catch(e) {
    console.log(e)
    socket.send(pre({t: 'del-vod', err: '服务器出错'}, socket.isBuffer));
  }
 }