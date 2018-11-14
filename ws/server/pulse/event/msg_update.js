const {pre, terminate} = require('../../../utils');
const Message = require('../../../../models/message');
/**
 * @description issuing a validation code on request
 * @type {msg-u} update message and save to database
 * @prop {String} data.uid user id
 * @prop {Array} data.ids message array received from client
 */

 module.exports = async (socket, data) => {
  if (!socket.allowed) terminate(socket, 'Message not allowed{2}.');
  if (!data.uid || !data.ids) return terminate(socket, 'missing argument{uid/ids}');
  let res;
  try {
    res = await Message.findOne({UID: data.uid}); //, {$set: {'message.read': true}}
    if (res) await res.updateMsg(data.ids)
    socket.send(pre({t: 'msg-u'}, socket.isBuffer));
  }catch(e) {
    console.log(e);
    socket.send(pre({t: 'msg-u', err: '服务器出错，请稍后重试'}, socket.isBuffer));
  }

  socket.send(pre({t: 'msg-u'}, socket.isBuffer));
  
 }
