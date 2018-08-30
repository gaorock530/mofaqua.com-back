const USER = require('../../../../models/users');
const _ = require('lodash');
const {pre} = require('../../../utils');

module.exports = async (socket, data) => {
  console.log(socket.code);
  console.log(data);
  setTimeout(() => {
    socket.send(pre(data, socket.isBuffer));
  }, 3000);
  
}