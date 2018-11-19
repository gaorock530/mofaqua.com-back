const _ = require('lodash');
const USER = require('../../../../models/users');
const {select, pre, terminate, userType} = require('../../../utils');
/**
 * @description user login
 * @type {upd-pe} update email/phone
 * @prop {String} data.v phone number / email address
 * @prop {String} data.c secure code
 */

module.exports = async (socket, data) => {
  
  if (!socket.allowed) terminate(socket, 'Message not allowed{10}.');
  if (!socket.UID) terminate(socket, 'Not login{2}.');
  console.log('event: ---------- upd-pe ------------');
  const type = userType(data.v);
  console.log('data.v: ', data.v, 'data.c: ', data.c, 'type:', type);
  if (!data.v || !data.c) return socket.send(pre({t: 'upd-pe', err: 'wrong arguments.'}, socket.isBuffer));
  // check if socket action is allowed
  if (!socket.code || !socket.expires_time || !socket.field) return socket.send(pre({t: 'rgt', err: '请发送验证码'}, socket.isBuffer));
  // check incoming value is the pre-registered field / registration with a wrong email / phone number.
  if (socket.field !== data.v) return socket.send(pre({t: 'upd-pe', err: '验证码已作废'}, socket.isBuffer));
  // check if the code is correct
  if (data.c !== socket.code.toString()) return socket.send(pre({t: 'upd-pe', err: '验证码错误'}, socket.isBuffer));
  // check code expiration time
  if (Date.now() > socket.expires_time) return socket.send(pre({t: 'upd-pe', err: '验证码已过期'}, socket.isBuffer));
  // secure code check: pass
  try {
    const user = await USER.findOneAndUpdate({UID: socket.UID}, {[type]: data.v}, {new: true});
    console.log('update phone: ', 'success');
    const filter = select(user, true);
    // result is 'n - newValue' 'c - type' [email|phone]
    socket.send(pre({t: 'upd-pe', n: filter[type], c: type}, socket.isBuffer));
  }catch(e) {
    console.log(e);
    return socket.send(pre({t: 'upd-pe', err: '服务器错误，请稍后重试'}, socket.isBuffer));
  }
}