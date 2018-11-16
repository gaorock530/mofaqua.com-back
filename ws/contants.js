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
  'http://192.168.1.104:3000',
  'http://localhost:3000',
  'http://localhost:5001',
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

const frezzeTime = 1000*60*60*24; // 1 day

/**
 * @param {Object} Users tracking every client
 */
const Users = function () {
  if (!(this instanceof Users)) return new Users();
  process.loginuser = process.loginuser || {};
  process.unknown = process.unknown || {};
  process.denger = process.denger || {};
  return Object.defineProperty(this, 'list', {
    get: function() {
      return {
        login: process.loginuser, 
        unknown: process.unknown, 
        denger: process.denger
      };
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

Users.prototype.dengerAdd = function (UID, hash) {
  if (!process.denger[hash]) process.denger[hash] = {wrongTime: 0, type: 'hash', date: Date.now()};
  if (UID && !process.denger[UID]) process.denger[UID] = {wrongTime: 0, type: 'UID', date: Date.now()};
  if (process.denger[hash].wrongTime > 19) process.denger[hash].frezze = true;
  return {UID: UID?++process.denger[UID].wrongTime:null, hash: ++process.denger[hash].wrongTime};
}

Users.prototype.dengerDel = function (hash) { // hash means UID|hash
  if (process.denger[hash]) delete process.denger[hash];
}



module.exports = {
  Origins,
  WsPath,
  frezzeTime,
  Users,
  bytesOut: 0,
  bytesIn: 0,
  expiration: 60 * 24 * 7, // 7days
}

