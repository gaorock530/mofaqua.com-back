const {pre, terminate} = require('../../../utils');
const USER = require('../../../../models/users');
/**
 * @description get a list of unfinished videos
 * @type {uv-get} un-finished videos
 */

 module.exports = async (socket, data) => {
  if (!socket.allowed) terminate(socket, 'Message not allowed{2}.');
  if (!socket.UID) terminate(socket, 'Not login{2}.');
  
  try {
    const res = await USER.findOne({UID: socket.UID}, 'upload');
    socket.send(pre({t: 'uv-get', v: res.upload}, socket.isBuffer));
  }catch(e) {
    socket.send(pre({t: 'uv-get', err: '服务器出错'}, socket.isBuffer));
  }
 }