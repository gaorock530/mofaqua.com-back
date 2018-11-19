const USER = require('../../../../models/users');
const {pre, terminate, userType} = require('../../../utils');
/**
 * @description check if secure code is correct
 * @type {chk-c} for owner security check
 * @param {String} data.c secure code [6 digits]
 * @param {String} data.v email/phone value
 */


module.exports = async (socket, data) => {
  if (!socket.allowed) terminate(socket, 'Message not allowed{5}.');
  if (!socket.UID) terminate(socket, 'Not login{2}.');
  console.log('event: ---------- chk-c ------------');
  console.log('data.v: ', data.v, 'data.c: ', data.c);
  if (!data.v || !data.c) return;
  const cate = {email: '邮件地址', phone: '手机号码'};
  const type = userType(data.v);
  console.log('input type:', type);
  try {
    const user = await USER.findOne({UID: socket.UID, [type]: data.v});
    // check email/phone
    if (!user) return socket.send(pre({t: 'chk-c', err: `原${cate[type]}不正确，请慎重填写`}, socket.isBuffer));
    // check if socket action is allowed
    if (!socket.code || !socket.expires_time || !socket.field) return socket.send(pre({t: 'rgt', err: '请发送验证码'}, socket.isBuffer));
    // check incoming value is the pre-registered field / registration with a wrong email / phone number.
    if (socket.field !== data.v) return socket.send(pre({t: 'chk-c', err: '验证码已作废'}, socket.isBuffer));
    // check if the code is correct
    if (!socket.code || data.c !== socket.code.toString()) return socket.send(pre({t: 'chk-c', err: '验证码错误'}, socket.isBuffer));
    // check code expiration time
    if (Date.now() > socket.expires_time) return socket.send(pre({t: 'chk-c', err: '验证码已过期'}, socket.isBuffer));
    console.log('secure code check: pass');
    // all went through, ok
    socket.send(pre({t: 'chk-c'}, socket.isBuffer));
  } catch(e) {
    console.log(e);
    socket.send(pre({t: 'chk-c', err: '服务器错误，请稍后重试'}, socket.isBuffer));
  }
  
  

}