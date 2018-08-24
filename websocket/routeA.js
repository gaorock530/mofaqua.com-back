'use strict';

const useragent = require('useragent');
const jwt = require('jsonwebtoken');
const sha256 = require('../helper/sha256').hex_sha256;

/**
 * @param {socket} socket individual socket
 * @param {io} SocketServer
 */

// implement 2 routes' handlers
module.exports = function newConnectionA (socket, io) {
  // set user authencation to False by default
  socket.authentication = false;
  // set user finger-print to Null by default
  socket.fingerPrint = null;
  // console.log(socket.handshake.headers);
  // get user information
  const userInfo = {
    IP: socket.handshake.headers['x-real-ip'] || null,
    REMOTEIP: socket.handshake.headers['x-forwarded-for'] || socket.handshake.address,
    AGENT: useragent.lookup(socket.handshake.headers['user-agent']),  
  };

  userInfo.DEVICE = userInfo.AGENT.device.toString();
  userInfo.OS = userInfo.AGENT.os.toString();

  // get device sorted
  // Is mobile
  if (/(android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|phone)/ig.test(userInfo.DEVICE)) {
    if (userInfo.DEVICE in process.user.devices) {
      process.user.devices[userInfo.DEVICE]++;
      process.user.OS[userInfo.OS]++;
    }else {
      process.user.devices[userInfo.DEVICE] = 1;
      process.user.OS[userInfo.OS] = 1;
    }
  // Is desktop
  } else {
    if (userInfo.DEVICE in process.user.devices) {
      process.user.devices[userInfo.DEVICE]++;
      process.user.OS[userInfo.OS]++;
    }else {
      process.user.devices[userInfo.DEVICE] = 1;
      process.user.OS[userInfo.OS] = 1;
    }
  }


  // receive finger-print from client
  // finger-print event, occurs when user access a browser
  socket.on('fp', (message) => {
    // get client finger-print
    userInfo.FP = message;
    // generate server-side finger-print
    socket.fingerPrint = sha256(JSON.stringify(userInfo));
    // counte users && add finger-print into Object
    if (!process.user.fps[socket.fingerPrint]) {
      // counter how many client openned by the same user
      process.user.fps[socket.fingerPrint] = 1;
      // set user name
      process.user.names[socket.fingerPrint] = 'user ' + Math.round(Math.random()*100);
    }else {
      process.user.fps[socket.fingerPrint]++;
      if (process.user.fps[socket.fingerPrint] > 3) {
        // close any client connection when same user clients > 3
        socket.disconnect('Too many connection');
      }
    }
    console.log(process.user);
    // send back mixed finger-print to the client
    socket.emit('fingerprint', {name: socket.username, fp: socket.fingerPrint}); 
  });

  

  // client talk Event
  socket.on('talk', (message) => {
    if (!socket.fingerPrint) {
      // only send back to individual socket who's unauthenticated
      socket.emit('limited-talk', 'not authorized!');
    }else {
      // send to everyone include self
      // io.emit('room', {
      //   name: process.user.names[socket.fingerPrint], 
      //   msg: message
      // });
      socket.broadcast.emit('room', {
        name: process.user.names[socket.fingerPrint], 
        msg: message
      });
    }
  }); 

  // clients disconnect Event
  socket.on('disconnect', (reason) => {
    // on disconnect, check if all same users have left
    if (process.user.fps[socket.fingerPrint]) process.user.fps[socket.fingerPrint]--;
    if (process.user.fps[socket.fingerPrint] === 0){
      delete process.user.fps[socket.fingerPrint];
      console.log(`${Object.keys(process.user.fps).length} people left!`);
    }
    console.log('1 client disconnect, reason: ' + reason);
  })
}