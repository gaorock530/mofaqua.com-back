const {Users, frezzeTime} = require('../../../contants');
const USER = require('../../../../models/users');
const md5 = require('../../../../helper/md5').hex_md5;
const {select, pre, terminate} = require('../../../utils');
const trackUser = Users();

/**
 * @description initial handshake and check the client authentication
 * @type {int}
 * @argument {Hash} data.h client finger print
 * @argument {Hash} data.token token for authentication
 * @property {Hash} socket.hash set finger-print as hash
 * @property {Boolean} socket.allowed whether the connection is allowed
 * @property {String} socket.username set a username if client is logged in
 * @private {Users} Users['unknown'][socket.hash].isLogin = false / Users[socket.username][socket.hash]
 * @private {Users} Users['unknown'][socket.hash].active = socket.id / Users[socket.username][socket.hash]
 * @private {Users} Users['unknown'][socket.hash].connections.push(socket.id) / Users[socket.username][socket.hash]
 * @returns {Object} {t:'int', v:1, u: socket.username}
 *                   {t:'int', v:0}
 */
module.exports = async (socket, data, pulse) => {
  console.log(socket.ip)
  console.log(socket.agent);
  let userRes;
  if (data.h) { // hash
    socket.hash = md5(socket.ip + data.h);
    // if (trackUser)
    console.log(trackUser.list.denger[socket.hash]);
    if (trackUser.list.denger[socket.hash] && trackUser.list.denger[socket.hash].frezze) {
      if (Date.now() - trackUser.list.denger[socket.hash].date > frezzeTime) {
        trackUser.dengerDel(socket.hash);
      } else {
        socket.allowed = false;
        return terminate(socket, `denger login actions: ${socket.ip}`);
      }
      
    }
    clearTimeout(socket.initial);
    socket.allowed = true;
    if (data.token) {
      console.log('has Token: ', data.token);
      // verify client 'isLogin'
      userRes = await USER.verifyToken(data.token, socket.ip, socket.hash);
      if (userRes) {
        socket.UID = userRes.UID;
        socket.user = select(userRes, false);
      }
    } 
    //initial user info for records
    trackUser.add(socket);
   
    // limit connection concurrency on the same client
    if (trackUser.cons(socket) > 3) {
      pulse.clients.forEach(client => {
        if (client.UID === socket.UID && client.hash === socket.hash && client.id === trackUser.last(socket)){
          return terminate(client, 'too many connections{1}.');
        } else if (client.hash === socket.hash && client.id === trackUser.last(socket)){
          return terminate(client, 'too many connections{1}.');
        }
      })
    }
   
    // send response to the client
    if (socket.UID) {
      socket.send(pre({t: 'int', v:1, u: select(userRes, true), a: socket.agent}, socket.isBuffer));
    }else {
      socket.send(pre({t: 'int', v:0, a: socket.agent}, socket.isBuffer));
    }
    console.log(trackUser.list);
  } else return terminate(socket, 'Invalid data value{1}.');
}
