/**
 * ------------------------------------------------------------------------
 * @description constant setup
 * ------------------------------------------------------------------------
 */

/**
 * @param {Set} Users_socket.hash stores users unique token for unique client
 */
// const Users_socket.hash = new Set();
/**
 * @param {Array} Origins stores all origins allowd to connect
 */
const Origins = [
  'https://www.panda.tv',
  'https://localhost:5002',
  'http://localhost:3000',
  'http://www.mofaqua.com',
  'https://www.mofaqua.com',
  'http://mofaqua.com',
  'https://mofaqua.com'
];

/**
 * @param {Array} WsPath stores valid path to connect
 */
const WsPath = [
  '/tunnel',           // for system
  '/pulse',            // for ping/pong
  '/com',              // for chat
  '/media',            // for media
];

/**
 * @param {Object} Users tracking every client
 */
const Users = function () {
  if (!(this instanceof Users)) return new Users();
  process.loginuser = process.loginuser || {};
  process.unknown = process.unknown || {};
  Object.defineProperty(this, 'list', {
    get: function() {
      return {login: process.loginuser, unknown: process.unknown};
    }
  });
};

Users.prototype.active = function (socket) {
  if (socket.UID) return process.loginuser[socket.UID][socket.hash].active = socket.id;
  return false;
}

Users.prototype.cons = function (socket) {
  if (socket.UID) {
    return process.loginuser[socket.UID][socket.hash].connections.length;
  }
  return process.unknown[socket.hash].connections.length;
}
Users.prototype.last = function (socket) {
  if (socket.UID) {
    return process.loginuser[socket.UID][socket.hash].connections[0];
  }
  return process.unknown[socket.hash].connections[0];
}


Users.prototype.add = function (socket) {
  if (socket.UID) {
    if (!process.loginuser[socket.UID]) process.loginuser[socket.UID] = {};
    if (!process.loginuser[socket.UID][socket.hash]) process.loginuser[socket.UID][socket.hash] = {connections: []};
    process.loginuser[socket.UID][socket.hash].active = socket.id;
    process.loginuser[socket.UID][socket.hash].connections.push(socket.id);
  } else {
    if (!process.unknown[socket.hash]) process.unknown[socket.hash] = {connections: []};
    process.unknown[socket.hash].active = socket.id;
    process.unknown[socket.hash].connections.push(socket.id);
  }
}

Users.prototype.del = function (socket) {
  if (socket.UID) {
    if (process.loginuser[socket.UID][socket.hash] && process.loginuser[socket.UID][socket.hash].connections.length <=1) delete process.loginuser[socket.UID][socket.hash];
    else process.loginuser[socket.UID][socket.hash].connections.splice(process.loginuser[socket.UID][socket.hash].connections.indexOf(socket.id), 1);
    if (Object.keys(process.loginuser[socket.UID]).length < 1) delete process.loginuser[socket.UID];
  } else {
    if (process.unknown[socket.hash] && process.unknown[socket.hash].connections.length <=1) delete process.unknown[socket.hash];
    else process.unknown[socket.hash].connections.splice(process.unknown[socket.hash].connections.indexOf(socket.id), 1);
  }
}



module.exports = {
  Origins,
  WsPath,
  Users,
  bytesOut: 0,
  bytesIn: 0,
  expiration: 60 * 24 * 7, // 7days
}

