
const {Users, expiration} = require('../../../contants');
const USER = require('../../../../models/users');
const CHANNEL = require('../../../../models/channel');
const cuid = require('cuid');
const {select, pre, terminate, userType} = require('../../../utils');
const {checkPass} = require('../../../../helper/utils');
const trackUser = Users();
/**
 * @description user registration
 * @type {rgt}
 * @prop {Number} socket.code stores 6-digits verify code
 * @prop {TimeStamp} socket.expires_time stores code expiration time
 * @prop {String} socket.field stores a string[email/phone] map to the code
 * @prop {UID} socket.uid unique ID for user
 * @arg {String} data.v value of a email or phone
 * @arg {String} data.s password
 * @arg {Number} data.c code
 * @arg {String} data.n username
 */

 module.exports = async (socket, data, pulse) => {
   console.log('--------------register event ------------');
   console.log('socket.expires_time', socket.expires_time);
   console.log('socket.code', socket.code);
   console.log('socket.field', socket.field);
  if (!socket.allowed) terminate(socket, 'Message not allowed{6}.');
  // check user is logged in
  if (socket.UID) terminate(socket, 'already logged in{1}.');
  // check if socket action is allowed
  if (!socket.code || !socket.expires_time || !socket.field) return socket.send(pre({t: 'rgt', err: '请发送验证码'}, socket.isBuffer));
  // check arguments / 'missing authentication code / nickname.' / 'missing phone number / email address or password.'
  if (!data.o) return socket.send(pre({t: 'rgt', err: 'missing arguments'}, socket.isBuffer));
  console.log(data.o);
  // check if the code is correct
  if (data.o.code !== socket.code.toString()) return socket.send(pre({t: 'rgt', err: '验证码错误'}, socket.isBuffer));
  // check code expiration time
  if (Date.now() > socket.expires_time) return socket.send(pre({t: 'rgt', err: '验证码已过期'}, socket.isBuffer));
  // check incoming value is the pre-registered field / registration with a wrong email / phone number.
  if (socket.field !== data.o.name.value) return socket.send(pre({t: 'rgt', err: '验证码已作废'}, socket.isBuffer));
  let user;
  // determine incoming value type
  const newUserType = userType(data.o.name.value);
  // create new user
  try {
    user  = new USER({
      UID: cuid(),
      // phone / email
      [newUserType]: data.o.name.value,
      username: data.o.nick,
      // password contains 2 fields [secure, value]
      password: {
        value: data.o.pass,
        secure: checkPass(data.o.pass)
      },
      registerDetails: {
        ip: '123.123.123.123',
        client: 'mac pro'
      },
      lastVisit: {
        ip: '123.123.123.123',
        client: 'mac pro'
      }
    });
  }catch(e) {
    // error
    console.log(e);
    return socket.send(pre({t: 'rgt', err: '服务器错误，请稍后重试'}, socket.isBuffer));
  }

  // create channel
  try {
    // create Channel
    const newChannel = await new CHANNEL({
      UID: user.UID,
      name: user.username
    })
    // save Channel
    await newChannel.save();
  }catch(e) {
    // error
    console.log(e);
    return socket.send(pre({t: 'rgt', err: 'user save error{create channel}.'}, socket.isBuffer));
  }
  
  // generate token for new user login
  const token = await user.generateAuthToken(socket.ip, socket.hash, expiration);
  // record and swap user info
  trackUser.del(socket);
  // send responese to every connections of the same client
  pulse.clients.forEach(ws => {
    if (ws.hash === socket.hash) {
      ws.UID = user.UID;
      ws.token = token;
      ws.user = select(user, true);
      ws.send(pre({t: 'rgt', u: ws.user, token}, socket.isBuffer));
    }
  });
  // record and swap user info
  trackUser.add(socket);
 }