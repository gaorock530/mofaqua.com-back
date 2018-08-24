const _ = require('lodash');
const USER = require('../../../../models/users');
const {select, pre, terminate} = require('../../../utils');


module.exports = async (socket, data, pulse) => {
  if (!socket.allowed) terminate(socket, 'Message not allowed{10}.');
  if (!socket.UID) terminate(socket, 'Not login{2}.');
  if (!data.uid) return socket.send({t: 'upd', err: 'missing uid'});
  if (!data.o || typeof data.o !== 'object') return socket.send(pre({t: 'upd', err: 'wrong arguments.'}, socket.isBuffer));
  if (data.o.username) {
    try {
      const upd_n = await USER.findOne({nameForCheck: data.o.username.toUpperCase()});
      if(upd_n) return socket.send(pre({t: 'upd', err: '该用户名已被使用，请更换'}, socket.isBuffer));
      data.o.nameForCheck = data.o.username.toUpperCase();
    }catch(e) {
      console.log(e);
      return socket.send(pre({t: 'upd', err: '服务器错误，请稍后重试'}, socket.isBuffer));
    }
  }
  try {
    let upd_u = await USER.findOneAndUpdate({UID: data.uid}, data.o, {new: true});
    upd_u = select(upd_u);
    upd_u = _.pick(upd_u, Object.keys(data.o));
    // return socket.send(pre({t: 'upd', u: upd_u}));
    pulse.clients.forEach(ws => {
      if (ws.UID === socket.UID) {
        ws.user = {...ws.user, ...upd_u};
        ws.send(pre({t: 'upd', u: upd_u}, socket.isBuffer));
      }
    });
  }catch(e) {
    console.log(e);
    return socket.send(pre({t: 'upd', err: '服务器错误，请稍后重试'}, socket.isBuffer));
  }
}