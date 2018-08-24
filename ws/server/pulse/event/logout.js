const {Users} = require('../../../contants');
const USER = require('../../../../models/users');
const {pre, terminate} = require('../../../utils');
const trackUser = Users();
/**
 * @description logout event
 * @type {logout}
 * @arg {Token} data.token 
 */

module.exports = async (socket, data, pulse) => {
  if (!socket.allowed) terminate(socket, 'Message not allowed{8}.');
  if (!socket.UID) return socket.send(pre({t: 'logout', err: 'not login.'}, socket.isBuffer));
  if (!data.token) return socket.send(pre({t: 'logout', err: 'not login.'}, socket.isBuffer));
  // verify token
  const logoutUser = await USER.verifyToken(data.token, socket.ip, socket.hash);
  if (!logoutUser) return socket.send(pre({t: 'logout', err: 'no such token.'}, socket.isBuffer));
  // remove token
  await logoutUser.removeToken(data.token);
  trackUser.del(socket);
  // send responese to every connections of the same client
  pulse.clients.forEach(ws => {
    if (ws.hash === socket.hash) {
      ws.UID = undefined;
      ws.token = undefined;
      ws.user = undefined;
      ws.send(pre({t: 'logout'}, socket.isBuffer));
    }
  });
  // record and swap user info
  trackUser.add(socket);
  // console.log(trackUser.list);
}