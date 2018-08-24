const newConnectionA = require('./routeA');
const newConnectionB = require('./routeB');
process.user = {
  // device counter
  devices: {},
  OS: {},
  // finger prints and counter for unique client
  // fps: new Set(),
  fps: {},
  names: {}
};

/**
 * @name webSocket-module
 * @param {Object} io 
 */

module.exports = (io) => {
  // setup 2 WS routes
  const PA = io.of('/pa');
  const PB = io.of('/pb');
  // listen to 2 routes
  PA.on('connection', (socket) => {
    newConnectionA(socket, PA);
    console.log(process.user);
  });
  PB.on('connection', newConnectionB);
}

// a helper function to parse cookie string
function CookiePaser(cookies) {
  const ck = {};
  cookies = cookies.split('; ');
  cookies.map((cookie) => {
    const items = cookie.split('=');
    ck[items[0]] = items[1];
  })
  return ck;
}