const {Users} = require('../../../contants');
const USER = require('../../../../models/users');
const {select, pre, terminate, userType} = require('../../../utils');
const {expiration} = require('../../../contants');
const trackUser = Users();

/**
 * @description user login
 * @type {login}
 * @arg {Username} data.user
 * @arg {Password} data.pass
 * @prop {Username} socket.username
 * @prop {Hash} socket.token JWT
 * @prop {IP} socket.ip client ip address
 * @prop {Hash} socket.hash client finger-print
 */

module.exports = async (socket, data, pulse) => {
  console.log('login')
  if (!socket.allowed) terminate(socket, 'Message not allowed{7}.');
  if (socket.UID) return socket.send(pre({err:'already logged in{2}.'}, socket.isBuffer));
  // authentication with database
  // 1. determine type and find user
  const isUserType = userType(data.user);
  let userForLogin;
  if (!isUserType) return socket.send(pre({t: 'login', err: 'user type error.'}, socket.isBuffer));
  if (isUserType === 'email') {
    userForLogin = await USER.findOne({'email': data.user.toUpperCase()});
  }else {
    userForLogin = await USER.findOne({'phone': data.user});
  }
  if (!userForLogin) return socket.send(pre({t: 'login', err: 'user not found.'}, socket.isBuffer));
  // 2. compare password
  const passRes = await userForLogin.verifyPassword(data.pass);
  if (!passRes) return socket.send(pre({t: 'login', err: 'wrong password.'}, socket.isBuffer));
  // 2.1 refresh tokens (remove all expired tokens)
  await userForLogin.refreshToken();
  // 3. generateAuthToken
  const newToken = await userForLogin.generateAuthToken(socket.ip, socket.hash, expiration);
  trackUser.del(socket);
  // send responese to every connections of the same client
  pulse.clients.forEach(ws => {
    if (ws.hash === socket.hash) {
      ws.UID = userForLogin.UID;
      ws.token = newToken;
      ws.user = select(userForLogin);
      ws.send(pre({t: 'login', u: select(userForLogin, true), token: socket.token}, socket.isBuffer));
    }
  });
  // console.log('UID: ', socket.UID);
  // record and swap user info
  trackUser.add(socket);
  // console.log(trackUser.list);
}