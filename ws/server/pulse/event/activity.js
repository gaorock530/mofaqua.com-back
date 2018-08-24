const {terminate} = require('../../../utils');
const {Users} = require('../../../contants');
const trackUser = Users();
/**
 * @description determine activity
 * @type {act} 
 * @argument {1} data.v set this connection to active
 * @private {Users} Users[socket.username][socket.hash].active = socket.id
 */

module.exports = (socket, data) => {
  if (!socket.allowed) terminate(socket, 'Message not allowed{1}.');
  if (socket.UID) {
    if (data.v === 1) trackUser.active(socket);
  }
}