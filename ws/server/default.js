'use strict';
const WebSocket = require('ws');
const {getIP, ab2str, str2ab} = require('../utils');
const {Origins, Users} = require('../contants');
const md5 = require('../../helper/md5').hex_md5;


const Default = new WebSocket.Server({
  noServer: true,
  handleProtocols,
  verifyClient: verifyClient,
});

Default.on('connection', (ws, req) => {
  if (!Boolean(req.protocols === 'pulse' || ~req.protocols.indexOf('pulse'))) ws.close(4002, 'wrong protocol');
  console.log('connected. \'/\'');
  ws.hash = md5(getIP(req) + req.headers['user-agent']);

  ws.on('message', (e) => {
    if (typeof e === 'string') {
      console.log(e);
    }else {
      console.log(ab2str(e));
    }
    // console.log(ws.hash);
    // console.log(Users);
    // console.log(Object.keys(Users[ws.hash].connections));
    ws.send(e);
  });

  ws.on('close', (code, reason)=> {
    console.log(code, reason);
  })
})

module.exports = Default;

function verifyClient (info, cb) {
  let result = true, code, name, headers;

  if (Origins.indexOf(info.origin) === -1) {
    result = false;
    code = 401;
    headers = { 'Error-Code': 101 };
  };

  return cb(result, code, name, headers);
}

function handleProtocols (protocols, request) {
  request.protocols = protocols;
  return protocols;
}