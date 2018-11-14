const {pre, terminate} = require('../../../utils');
const Message = require('../../../../models/message');
const _ = require('lodash');
/**
 * @description issuing a validation code on request
 * @type {msg-d} get all message from database
 * @prop {String} data.uid user id
 * @prop {String} data.msg new message
 */

 module.exports = async (socket, data, pulse) => {
  if (!socket.allowed) terminate(socket, 'Message not allowed{2}.');
  if (!data.uid || !data.ids) return terminate(socket, 'missing argument{uid/msg}');

  let res;
  let msg;
  try {
    res = await Message.findOne({UID: data.uid});
    if (!res) {
      console.log('no result.')
    } else {
      msg = await res.deleteMsg(data.ids);
    }

    
    pulse.clients.forEach(ws => {
      if (ws.hash === socket.hash) {
        ws.send(pre({t: 'msg-d', v: data.ids}, socket.isBuffer));
      }
    });

  }catch(e) {
    console.warn(e);
    socket.send(pre({t: 'msg-d', err: '服务器出错，请稍后重试'}, socket.isBuffer));
  }
  
  
 }