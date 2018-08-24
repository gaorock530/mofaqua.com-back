const USER = require('../../../../models/users');
const {pre, terminate} = require('../../../utils');
/**
 * @description check username availability when register
 * @type {chk-n}
 */


module.exports = async (socket, data) => {
  if (!socket.allowed) terminate(socket, 'Message not allowed{5}.');
  try {
    const chk_p = await USER.findOne({nameForCheck: data.v.toUpperCase()});
    if(!chk_p) socket.send(pre({t: 'chk'}, socket.isBuffer));
    else socket.send(pre({t: 'chk', err: '该用户名已被使用，请更换'}, socket.isBuffer));
  }catch(e) {
    console.log(e);
    return socket.send(pre({t: 'chk', err: '服务器错误，请稍后重试'}, socket.isBuffer));
  }
}
