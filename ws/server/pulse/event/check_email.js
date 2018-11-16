const USER = require('../../../../models/users');
const {pre, terminate} = require('../../../utils');
/**
 * @description check email availability when register
 * @type {chk-e}
 */
module.exports = async (socket, data) => {
  if (!socket.allowed) terminate(socket, 'Message not allowed{3}.');
  try {
    const chk_e = await USER.findOne({'email': data.v.toUpperCase()});
    if(!chk_e) socket.send(pre({t: 'chk'}, socket.isBuffer));
    else socket.send(pre({t: 'chk', err: '该邮箱已被注册，请更换'}, socket.isBuffer));
  }catch(e) {
    console.log(e);
    return socket.send(pre({t: 'chk', err: '服务器错误，请稍后重试'}, socket.isBuffer));
  }
}