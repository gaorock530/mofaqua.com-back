
const {Users, expiration} = require('../../../contants');
const USER = require('../../../../models/users');
const CHANNEL = require('../../../../models/channel');
const cuid = require('cuid');
const {select, pre, terminate, userType} = require('../../../utils');
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
  // check if socket action is allowed
  if (!socket.code || !socket.expires_time || !socket.field) return socket.send(pre({t: 'rgt', err: '验证码错误或已过期'}, socket.isBuffer));
  // check user is logged in
  if (socket.UID) return socket.send('already logged in{1}.');
  // check arguments
  if (!data.v || !data.s) return socket.send(pre({t: 'rgt', err: 'missing phone number / email address or password.'}, socket.isBuffer));
  if (!data.c || !data.n) return socket.send(pre({t: 'rgt', err: 'missing authentication code / nickname.'}, socket.isBuffer));
  // check if the code is correct
  if (data.c !== socket.code.toString()) return socket.send(pre({t: 'rgt', err: '验证码错误或已过期'}, socket.isBuffer));
  // check code expiration time
  if (Date.now() > socket.expires_time) return socket.send(pre({t: 'rgt', err: 'code expired!'}, socket.isBuffer));
  // check incoming value is the pre-registered field
  if (socket.field !== data.v) return socket.send(pre({t: 'rgt', err: 'registration with a wrong email / phone number.'}, socket.isBuffer));
  let user;
  // determine incoming value type
  const newUserType = userType(data.v);
  // create new user
  try {
    user  = new USER({
      UID: cuid(),
      // phone / email
      [newUserType]: data.v,
      username: data.n,
      // password contains 2 fields [secure, value]
      password: {
        secure: data.s.secure,
        value: data.s.value
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
    return socket.send(pre({t: 'rgt', err: 'user save error{2}.'}, socket.isBuffer));
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