let {bytesOut} = require('./contants');
const validator = require('validator');
const fs = require('fs');
const _ = require('lodash');

/**
 * @description get ip address
 * @param {WebSocket.req} req 
 * @returns {IP}
 */

function getIP (req) {
  return req.connection.remoteAddress || req.headers['x-forwarded-for'].split(/\s*,\s*/)[0];
}


/**
 * @description convert Buffer to String
 * @param {ArrayBuffer} buf input arraybuffer
 * @returns {String} 
 */
function ab2str (buf) {
  buf = Buffer.from(buf);
  return buf.toString('utf16le');
}

/**
 * @description convert String to Buffer
 * @param {String} str input string
 * @returns {ArrayBuffer} buf
 */
function str2ab (str) {
  var buf = new ArrayBuffer(str.length*2); // 2 bytes for each char
  var bufView = new Uint16Array(buf);
  for (var i=0, strLen=str.length; i<strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}

/**
 * @description Parse request cookies into object
 * @param {String} string cookie string
 * @returns {Object} cookie object
 */
function parseCookie (string) {
  if (!string) return {};
  const cookie = {};
  string.split('; ').map(i => {
    const pair = i.split('=');
    cookie[pair[0]] = pair[1];
  });
  return cookie;
}

function select (obj, isHide) {
  const target = JSON.parse(JSON.stringify(obj));
  target.secure = target.password.secure;
  const hide = (v) => {
    const idx = v.match(/@/)? v.match(/@/).index: null;
    let out = '';
    if (!idx) { // phone
      out = v.slice(0, 3) + '*****' + v.slice(8);
    } else { //email
      // const f = v.length - idx;
      const s = Math.ceil(idx/2);  
      out = v.slice(0, s) + v.slice(s, idx).replace(/./g, '*') + v.slice(idx);
    }
    return out;
  }

  if (isHide) {
    if (target.email) target.email = hide(target.email);
    if (target.phone) target.phone = hide(target.phone);
  }
  
  return _.pick(target, ['UID', 'username', 'email', 'phone', 'pic', 'person', 'secure']);
}

function userType (value) {
  if (validator.isEmail(value)) return 'email';
  else if (validator.isMobilePhone(value, ['zh-CN'])) return 'phone';
  return false;
}

function fileExists(filePath) {
  return fs.existsSync(filePath)
}

function normal (filePath) {
  return path.normalize(filePath);
}

/**
 * @function terminate custom close function
 * @param {WebSocket} ws 
 * @param {String} reason custom reason for close
 */
function terminate (ws, reason) {
  ws.close(4002, reason);
}

/**
 * @function talk send messages between users
 * @param {WS} client a client/user to talk to
 * @param {String} msg a message to be sent
 */
function talk (client, msg) {
  pulse.clients.forEach(ws => {
    if (ws.username === client) ws.send(pre(msg));
  })
}

/**
 * @description encode data and accumulate outgoning bytes to the client
 * @param {Object} data a object ready to be encoded 
 * @returns {String/Buffer} encoded data to be sent 
 */
function pre (data, isBuffer) {
  let d;
  if (isBuffer) {
    d = str2ab(JSON.stringify(data));
    bytesOut += d.byteLength;
  } else {
    d = JSON.stringify(data);
    bytesOut += d.length;
  }
  console.log('bytesOut: ', bytesOut);
  return d;
}



module.exports = {
  parseCookie,
  ab2str,
  str2ab,
  getIP,
  fileExists,
  normal,
  terminate,
  talk,
  select,
  userType,
  pre
}