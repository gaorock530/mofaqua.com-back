const _ = require('lodash');
const USER = require('../../../../models/users');
const {select, pre, terminate} = require('../../../utils');
/**
 * @description user login
 * @type {upd-p} update password
 * @prop {String} data.o old password
 * @prop {String} data.n new password
 */

module.exports = async (socket, data) => {
  
  if (!socket.allowed) terminate(socket, 'Message not allowed{10}.');
  if (!socket.UID) terminate(socket, 'Not login{2}.');
  console.log('event: ---------- upd-p ------------');
  console.log('data.o: ', data.o, 'data.n: ', data.n);
  if (!data.o || !data.n) return socket.send(pre({t: 'upd-p', err: 'wrong arguments.'}, socket.isBuffer));
  
  // return socket.send(pre({t: 'upd', u: data.o}, socket.isBuffer));
  try {
    const user = await USER.findOne({UID: socket.UID});
    if (!user) return socket.send(pre({t: 'upd-p', err: 'no user found, password update fail'}, socket.isBuffer));
    const valid = await user.verifyPassword(data.o);
    if (!valid) return socket.send(pre({t: 'upd-p', err: 'wrong pass'}, socket.isBuffer));
    const secure = await user.updatePassword(data.n);
    console.log(secure.password.secure);
    console.log('update password: ', 'success');
    socket.send(pre({t: 'upd-p', v: secure.password.secure}, socket.isBuffer));
  }catch(e) {
    console.log(e);
    return socket.send(pre({t: 'upd-p', err: '服务器错误，请稍后重试'}, socket.isBuffer));
  }
}