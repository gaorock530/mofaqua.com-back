module.exports = function newConnectionB (socket) {
  // console.log(socket.handshake.headers);
  console.log("From PB: " + socket.id);
}