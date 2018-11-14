const USER = require('../../../../models/users');
const _ = require('lodash');
const {pre} = require('../../../utils');
const ConvertUTCTimeToLocalTime = require('../../../../helper/timezone');
/**
 * @param {Object} data.v incoming identity data
 * @exports t:'put-id'
 */

module.exports = async (socket, data) => {
  console.log(socket.code);
  console.log(data);
  if (!data.v.name || !data.v.phone || !data.v.code || !data.v.no) {
    return socket.send(pre({t: 'put-id', err: '缺少必要参数'}, socket.isBuffer));
  }
  if (!socket.code || data.v.code.toString() !== socket.code.toString()) {
    return socket.send(pre({t: 'put-id', err: '手机验证码错误'}, socket.isBuffer));
  }
  try {
    // make sure identity to be updated has not been submitted.
    const user = await USER.findOne({UID: socket.UID});
    if (user.verification.verified > 0) {
      return socket.send(pre({t: 'put-id', err: '认证已经提交'}, socket.isBuffer));
    }

    await USER.findOneAndUpdate({UID: socket.UID}, {
      'verification.name': data.v.name,
      'verification.phone': data.v.phone,
      'verification.idno': data.v.no,
      'verification.verified': 1,
      'verification.submit': ConvertUTCTimeToLocalTime(true),
    });

    socket.send(pre({t: 'put-id'}, socket.isBuffer));
  }catch(e) {
    socket.send(pre({t: 'put-id', err: '服务器错误{verification}'}, socket.isBuffer));
  }
  
}