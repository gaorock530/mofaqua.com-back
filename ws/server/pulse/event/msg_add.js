const {pre, terminate} = require('../../../utils');
const Message = require('../../../../models/message');
const _ = require('lodash');
/**
 * @description issuing a validation code on request
 * @type {msg-a} get all message from database
 * @prop {String} data.uid user id
 * @prop {String} data.msg new message
 */

 module.exports = async (socket, data, pulse) => {
  if (!socket.allowed) terminate(socket, 'Message not allowed{2}.');
  if (!data.uid || !data.msg) return terminate(socket, 'missing argument{uid/msg}');

  let res;
  let msg;
  try {
    res = await Message.findOne({UID: data.uid});
    if (!res) {
      const newMsg = new Message({
        UID: data.uid,
        message: []
      });
      msg = await newMsg.addMsg(data.msg);
    } else {
      msg = await res.addMsg(data.msg);
    }

    pulse.clients.forEach(ws => {
      if (ws.hash === socket.hash) {
        ws.send(pre({t: 'msg-a', v: _.pick(msg, ['id', 'date', 'from', 'type', 'read', 'title'])}, socket.isBuffer));
      }
    });
  }catch(e) {
    console.warn(e);
    socket.send(pre({t: 'msg-a', err: '服务器出错，请稍后重试'}, socket.isBuffer));
  }
  
  
 }