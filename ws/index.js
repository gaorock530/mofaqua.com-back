const {URL} = require('url');
const Default = require('./server/default');
const tunnel = require('./server/tunnel');
const pulse = require('./server/pulse/index');
/**
 * ------------------------------------------------------------------------
 * @description Setup WebSocket Server
 * ------------------------------------------------------------------------
 */

module.exports = (server) => {
  server.on('upgrade', (request, socket, head) => {
    const pathname = new URL(request.headers.origin + request.url).pathname;
    if (pathname === '/tunnel') {
      tunnel.handleUpgrade(request, socket, head, (ws) => {
        tunnel.emit('connection', ws, request);
      });
    } else if (pathname === '/pulse') {
      pulse.handleUpgrade(request, socket, head, (ws) => {
        pulse.emit('connection', ws, request);
      });
    } else if (pathname === '/') {
      Default.handleUpgrade(request, socket, head, (ws) => {
        Default.emit('connection', ws, request);
      });
    } else {
      socket.destroy();
    }
  });
}

