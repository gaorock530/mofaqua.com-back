const USER = require('../../../../models/users');
const {pre, terminate} = require('../../../utils');
/**
 * @description check phone availability when register
 * @type {chk-p}
 */

 module.exports = async (socket, data) => {
  if (!socket.allowed) terminate(socket, 'Message not allowed{4}.');
  // determine value type [email|phone]
  try {
    const chk_p = await USER.findOne({'phone': data.v});
    if(!chk_p) socket.send(pre({t: 'chk'}, socket.isBuffer));
    else socket.send(pre({t: 'chk', err: '该手机号已被注册，请更换'}, socket.isBuffer));
  }catch(e) {
    console.log(e);
    return socket.send(pre({t: 'chk', err: '服务器错误，请稍后重试'}, socket.isBuffer));
  }
 }
