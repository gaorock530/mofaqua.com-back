const {pre, terminate} = require('../../../utils');
const mail = require('../../../../helper/mail');
const text = require('../../../../helper/text');
/**
 * @description issuing a validation code on request
 * @type {get-code}
 * @prop {String} data.p phone number
 * @prop {String} data.e email
 * @property {Number} socket.code generate a random number [6 digits] for validation
 * @property {TimeStamp} socket.expires_time set a expiration time [10 mins] to the code above 
 * @property {String} socket.field stores a string of request field [email/phone] for preventing a different namespace
 */

 module.exports = async (socket, data) => {
  if (!socket.allowed) terminate(socket, 'Message not allowed{2}.');
  if (!data.e && !data.p) return socket.send({err: 'missing argument{e/p}'});
  // random 6 digits validation number
  socket.code = (Math.random()*(999999-100001+1)+100001) | 0;
  // set expiration
  let timeNow = new Date();
  timeNow.setMinutes(timeNow.getMinutes() + 10);
  socket.expires_time = timeNow.getTime();
  // set register field (phone / email)
  socket.field = data.e || data.p;
  if (data.e) {        
    const res = await mail(data.e, socket.code);
    if (!res) return socket.send(pre({t: 'code', err: '请检查邮箱是否填写正确'}, socket.isBuffer));
  }else if (data.p) {
    const res = await text(data.p, socket.code);
    if (!res) return socket.send(pre({t: 'code', err: '请检查手机号是否填写正确, 或者验证码发送过于频繁, 请再1个小时后重试'}, socket.isBuffer));
  }
  socket.send(pre({t: 'code'}, socket.isBuffer));
 }