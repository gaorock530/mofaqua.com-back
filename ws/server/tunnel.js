'use strict';
const {ab2str, str2ab, parseCookie} = require('../utils');
const WebSocket = require('ws');
// const {Users_Hash} = require('../contants');
const md5 = require('../../helper/md5').hex_md5;
const cuid = require('cuid');
const {URL} = require('url');
const {Origins, WsPath} = require('../contants');

const Users_Hash = new Set();

const tunnel = new WebSocket.Server({
  // server: server,
  noServer: true,
  clientTracking: true,             // wss.clients enable
  verifyClient: verifyClient,
  handleProtocols: handleProtocols,
  perMessageDeflate: {
    zlibDeflateOptions: { // See zlib defaults.
      chunkSize: 1024,
      memLevel: 7,
      level: 3,
    },
    zlibInflateOptions: {
      chunkSize: 10 * 1024
    },
    // Other options settable:
    clientNoContextTakeover: true, // Defaults to negotiated value.
    serverNoContextTakeover: true, // Defaults to negotiated value.
    clientMaxWindowBits: 10,       // Defaults to negotiated value.
    serverMaxWindowBits: 10,       // Defaults to negotiated value.
    // Below options specified as default values.
    concurrencyLimit: 10,          // Limits zlib concurrency for perf.
    threshold: 1024,               // Size (in bytes) below which messages
                                  // should not be compressed.
  }
});

/**
 * ------------------------------------------------------------------------
 * @description implement new method to WebSocket Server instence
 * ------------------------------------------------------------------------
 */

tunnel.broadcast = (data, room = null) => {
  tunnel.clients.forEach(client => {
    if (!room) {
      if (client.readyState === WebSocket.OPEN) client.send(data);
    } else {
      if (client.readyState === WebSocket.OPEN && client.User.room === room) client.send(data);
    }
  });
}

tunnel.disconnect = (hash, uid) => {
  tunnel.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN && client.User.hash === hash && client.User.uid !== uid) client.close(4002, 'duplicate user.');
  });
}

/**
 * ------------------------------------------------------------------------
 * @description implement all WSS Events
 * ------------------------------------------------------------------------
 */

/**
 * @description handle websocket connection
 * @description custom close CODE:   (4000–4999	 	Available for use by applications.)
 *              4002 - duplicate user.
 */
tunnel.on('connection', (ws, req) => {
  console.log('connected.');
  ws.send(str2ab('connected to WS server. /magictunnel'));
  // create User Object on Wss
  const User = {
    isLogin: false,                                      // login status
    ip: req.connection.remoteAddress,                    // get client IP
    hash: md5(req.connection.remoteAddress + req.headers['user-agent']), // generate unique hash for the same client
    time: Date.now(),                                    // timestamp on connect
    uid: cuid(),                                         // unique id for this connection
    tunnel: ''
  }
  // attach User object to socket
  ws.User = User;
  // check for unique client
  if (Users_Hash.has(User.hash)) tunnel.disconnect(User.hash, User.uid);
  else Users_Hash.add(User.hash);
  console.log(Users_Hash);    
  console.log(tunnel.clients.size + ' sockets is connected');
  console.log(ws.protocol);

  ws.on('message', (e) => {

    if (ws.readyState !== 1) return;
    const data = JSON.parse(ab2str(e));
    console.log('form ws: ', data);
    switch (data.type) {
      case 'handshake':
        if (data.room) ws.User.room = data.room;
        console.log(ws.User.room);
        ws.send(str2ab('connected to WS server.'));
        console.log('--handshake--');
        break;
      case 'chat':
        tunnel.broadcast(str2ab(data.content), ws.User.room);
        console.log('--room--');
        break;
      default:
        console.log('web socket is receveing message: ');
        tunnel.broadcast(str2ab(data.content));
    }
  });

  ws.on('close', (code) => {
    // delete only when Close Code is not 4002 (duplication)
    if (code !== 4002) Users_Hash.delete(User.hash);
    console.log(Users_Hash.size + ' sockets is remaining');
  })

});

/**
 * @description Emitted before the response headers are written to the socket as part of the handshake.
 */
tunnel.on('headers', (headers, req) => {
  // console.log('---------------headers---------------------')
  // console.log(headers);
  // console.log('---------------request---------------------')
  // console.log(req);
  // console.log('---------------end---------------------')
  // inspect/modify the headers before they are sent
  // headers.push('asd: 12321');
  headers.push('Server: MagicTunnel');
  headers.push('Set-Cookie: token=self; Secure; HttpOnly');
});

/**
 * @description Emitted when the underlying server has been bound.
 */
tunnel.on('listening', () => {
  console.log('--WebSocket is listening--')
});

/**
 * @description Emitted when an error occurs on the underlying server.
 */
tunnel.on('error', (e) => {
  console.log(e);
});


module.exports = tunnel;

/**
 * @description Error Code: 
 *                  101: origin not allowed
 *                  102: wrong request path
 *                  103: query token not authorized
 *                  104: request cookies not allowed
 * @param {Object} info 
 *    @param {String} origin The value in the Origin header indicated by the client.
 *    @param {http.IncomingMessage} req The client HTTP GET request.
 *    @param {Boolean} secure true if req.connection.authorized or req.connection.encrypted is set.
 * @param {Function} cb A callback that must be called by the user upon inspection of the info fields.
 *    @param {Boolean} result Whether or not to accept the handshake.
 *    @param {Number} code When result is false this field determines the HTTP error status code to be sent to the client.
 *    @param {String} name When result is false this field determines the HTTP reason phrase.
 *    @param {Object} headers When result is false this field determines additional HTTP headers to be sent to the client. For example, { 'Retry-After': 120 }.
 * @returns {Boolean} determines whether or not to accept the handshake.
 */
function verifyClient (info, cb) {
  let result = true, code, name, headers;

  // check request origin
  if (Origins.indexOf(info.origin) === -1) {
    result = false;
    code = 401;
    headers = { 'Error-Code': 101 };
  };
  // /* Check Url && Parse Url */
  const parsedUrl = new URL(info.origin + info.req.url);
  // if (WsPath.indexOf(parsedUrl.pathname) === -1) {
  //   result = false;
  //   code = 404;
  //   headers = { 'Error-Code': 102 };
  // }
  /* Check Token */
  const token = parsedUrl.searchParams.get('token');
  if (!token) {
    result = false;
    code = 401;
    headers = { 'Error-Code': 103 };
  }
  /* Parse Cookies */
  const cookie = parseCookie(info.req.headers.cookie);
  if (!cookie.name) {
    result = false;
    code = 401;
    headers = { 'Error-Code': 104 };
  }
  /* Check duplication */
  // const hash = md5(info.req.connection.remoteAddress + info.req.headers['user-agent']);
  // console.log(hash);

  return cb(result, code, name, headers);
}

/**
 * @description handle WebSocket subprotocols
 * @param {Array} protocols The list of WebSocket subprotocols indicated by the client in the Sec-WebSocket-Protocol header.
 * @param {http.IncomingMessage} request The client HTTP GET request.
 * @returns The returned value sets the value of the Sec-WebSocket-Protocol header in the HTTP 101 response. 
 *          If returned value is false the header is not added in the response.
 */

function handleProtocols (protocols, request) {
  return protocols;
}