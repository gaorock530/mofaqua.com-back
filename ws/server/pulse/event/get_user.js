const USER = require('../../../../models/users');
const _ = require('lodash');
const {pre} = require('../../../utils');

module.exports = async (socket, data) => {
  console.log('-------------use u-get---------------');
  try{
    let user = await USER.findOne({UID: data.id});
    user = _.pick(user, ['verification', 'buyer', 'seller', 'balance']);
    socket.send(pre({t: 'u-get', v: user}, socket.isBuffer));
    console.log(user);
  }catch(e) {
    console.log(e);
    socket.send(pre({t: 'u-get', err: 'server error.{ch-get}'}, socket.isBuffer))
  }
}