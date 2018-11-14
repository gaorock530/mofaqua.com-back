'use strict';
const {getIP, ab2str, terminate, pre} = require('../../utils');
// const ConvertUTCTimeToLocalTime = require('../../../helper/timezone');
const WebSocket = require('ws');
const {Origins, Users} = require('../../contants');
let {bytesIn} = require('../../contants');
const cuid = require('cuid');
const trackUser = Users();
const pulse = new WebSocket.Server({
  noServer: true,
  verifyClient,
  // handleProtocols
});

/**
 * @description WebSocket server connection API
 * @callback ws a connected client
 * @callback req a incoming ws request from a client
 * @prop {Timeout} ws.initial check client response time once it's connected. 
 * @prop {Hash} ws.id setup a random hash for this connection as unique identifier
 * @prop {IP address} ws.ip stores ip for this client
 * @prop {Boolean} ws.allowed if initial response is in time and correct, set to True, default to False
 * @prop {Boolean} ws.isLogin if user is logged in, set to True, default to False
 */

// ws.UID > ws.hash > ws.id
pulse.on('connection', (ws, req) => {
  ws.initial = setTimeout(terminate.bind(ws, ws, 'Response too slow{1}.'), 2000);
  ws.id = cuid();
  ws.ip = getIP(req);
  ws.allowed = false;
  ws.isLogin = false;
  
  // events handlers on each connection
  ws.on('message', onmessage.bind(ws));
  ws.on('close', onclose.bind(ws));
  ws.on('error', onerror);
});

// error handler for server
pulse.on('error', (ws, err) => {
  console.log(err);
  ws.close(4005, 'server error.');
});


const event = {
  'int': require('./event/init'),
  'act': require('./event/activity'),
  'get-code': require('./event/get_code'),
  'chk-p': require('./event/check_phone'),
  'chk-e': require('./event/check_email'),
  'chk-n': require('./event/check_name'),
  'rgt': require('./event/register'),
  'login': require('./event/login'),
  'logout': require('./event/logout'),
  'upd': require('./event/update'),
  'up-pic': require('./event/upload_pic'),
  'ch-get': require('./event/get_channel'),             // get Channel info with user's info
  'u-get': require('./event/get_user'),
  'put-id': require('./event/put_indentity'),
  // message
  'msg-g': require('./event/msg_get'),
  'msg-a': require('./event/msg_add'),
  'msg-u': require('./event/msg_update'),
  'msg-d': require('./event/msg_del'),
};
/**
 * @description message event handler, data processing API
 * @param {Response} data a Object returned from server
 */
async function onmessage (data) {
  // decode incoming data and record traffic
  if (typeof data === 'object') {
    // accumulate received bytes from client
    bytesIn += data.byteLength;
    // determine whether imcoming message is arraybuffuer or not.
    this.isBuffer = true;
    data = ab2str(data);
  } else bytesIn += data.length;
  try {data = JSON.parse(data)} catch(e) {}
  console.log('bytesIn: ', bytesIn);

  /**
   * @description process incoming message
   * @arg {Socket} this
   * @arg {Object} data
   * @arg {WS Server} pulse
   */
  if (~Object.keys(event).indexOf(data.t)) {
    console.log('[incoming data-type]: ', data.t);
    // console.log('[incoming data]: ', data);
    await event[data.t](this, data, pulse);
  } else {
    this.send(pre({t: data.t, err: 'invalid events, system shut down'}, this.isBuffer));
    this.close(4005, 'invalid events, system shut down');
  }
  
}

/**
 * @description close event handler
 * @param {Number} code close code number
 * @param {String} reason close reason
 */
function onclose (code, reason) {
  if (code >= 4000) return console.log('/pulse -> warning: ', code, reason);
  trackUser.del(this);
  console.log(trackUser.list);
  console.log('/pulse -> close: ', code, reason);
}

/**
 * @description error event handler
 * @param {Error} err 
 */
function onerror (err) {
  console.log('/pulse -> error: ', err);
}


module.exports = pulse;


function verifyClient (info, cb) {
  let result = true, code, name, headers;

  if (Origins.indexOf(info.origin) === -1) {
    result = false;
    code = 401;
    headers = { 'Error-Code': 1011 };
  };

  // const cookie = parseCookie(info.req.headers.cookie);
  // if (!cookie.token) {
  //   result = false;
  //   code = 401;
  //   headers = { 'Error-Code': 104 };
  // }
  // console.log('cookie.token: ' + cookie.token);

  return cb(result, code, name, headers);
}


