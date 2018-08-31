
const USER = require('../../../../models/users');
const CHANNEL = require('../../../../models/channel');
const _ = require('lodash');
const {pre} = require('../../../utils');

/**
 * @param {UID} data.id
 */

module.exports = async (socket, data) => {
  console.log('-------------use ch-get---------------');
  try{
    let user = await USER.findOne({UID: data.id});
    let channel = await CHANNEL.findOne({UID: data.id});
    user = {pic: user.pic, name: user.username};
    channel = _.pick(channel, ['cover', 'subscriber']);
    const out = {...channel, ...user};
    socket.send(pre({t: 'ch-get', v: out}, socket.isBuffer));
  }catch(e) {
    console.log(e);
    socket.send(pre({t: 'ch-get', err: 'server error.{ch-get}'}, socket.isBuffer))
  }
}