const {pre, terminate} = require('../../../utils');
const Message = require('../../../../models/message');
const _ = require('lodash');
/**
 * @description issuing a validation code on request
 * @type {msg-g} get all message from database
 * @prop {String} data.uid user id
 * @prop {String} data.id message id
 */

 module.exports = async (socket, data) => {
  if (!socket.allowed) terminate(socket, 'Message not allowed{2}.');
  if (!data.uid) return socket.send({err: 'missing argument{uid}'});
  let res;
  let result = [];
  try {
    res = await Message.findOne({UID: data.uid});
    for (let i of res.message) {
      if (data.id) {
        if (i.id === data.id) result = i.msg;
      }else {
        result.unshift(_.pick(i, ['id', 'date', 'from', 'type', 'read', 'title']));
      }
      
    }

    socket.send(pre({t: 'msg-g', v: result}, socket.isBuffer));
  }catch(e) {
    socket.send(pre({t: 'msg-g', err: '服务器出错，请稍后重试'}, socket.isBuffer));
  }
  
  
 }