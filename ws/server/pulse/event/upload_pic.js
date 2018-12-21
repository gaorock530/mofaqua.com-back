const fs = require('fs');
const path = require('path');
const USER = require('../../../../models/users');
const CHANNEL = require('../../../../models/channel');
const {select, pre} = require('../../../utils');
const _ = require('lodash');
const obs = require('../../../../helper/obs');

/**
 * @description handle uploading images, ALL incoming image file is in BASE64 encoding
 * @type {up-pic}
 * @external data.t imcoming data type: [up-pic]
 * @external data.c image category [tn] user icon, [ch-cover] channel cover 
 * @external data.n image name
 * @external data.i data index 0,1,2... [-1] indicates finish
 * @fires ['up-pic'] only for the connection
 * @fires ['upd'] updates all other connections for the same user
 */

module.exports = async (socket, data, pulse) => {
  const basePath = path.normalize(path.join(__dirname, `../../../../user-images/`));
  // check params;
  if (!data.n || !data.c) return socket.send(pre({t: 'up-pic', err: '缺少必要参数，请稍后重试'}, socket.isBuffer));
  // stores file path;
  let write_path;
  let write_name = `${socket.UID}.jpg`;
  // check category
  if (data.c === 'tn') {  // for user icon thumbnails
    write_path = path.join(basePath, 'icon/');
  }else if (data.c === 'ch-cover') { // for channel banner cover
    write_path = path.join(basePath, 'channel-cover/');
  }else if (data.c.match(/^id.+/)) { // for user indentity images
    // make sure identity to be updated has not been submitted.
    const user = await USER.findOne({UID: socket.UID});
    if (user.verification.verified > 0) {
      return socket.send(pre({t: 'up-pic', err: '认证已经提交，更改无效'}, socket.isBuffer));
    }
    write_path = path.join(basePath, 'identity/');
    write_name = data.c +'.'+ write_name;
  }else {
    return console.warn('wrong value of data.c');
  }
  // make directory
  if (!fs.existsSync(basePath)) fs.mkdirSync(basePath);
  if (!fs.existsSync(write_path)) fs.mkdirSync(write_path);
  // create obj
  if (!socket.writeFile) socket.writeFile = {};
  if (!socket.writeFile[data.n]) {
    socket.writeFile[data.n] = {};
    socket.writeFile[data.n].finish = false;
    // socket.writeFile[data.n].frags = data.v;
    socket.writeFile[data.n].name = data.n;
    socket.writeFile[data.n].index = 0;
    socket.writeFile[data.n].writeStream = fs.createWriteStream(write_path + write_name, {
      flag: 'r+', 
      encoding: 'base64', 
      autoClose: true, 
      start: 0
    });
    // socket.writeFile[data.n].writeStream.on('close', (e) => {
    //   // console.log('uploading done.', socket.writeFile);
    // });
  }

  if (data.i !== -1 && socket.writeFile[data.n].index === data.i) {
    socket.writeFile[data.n].frags = data.v;
    if (data.i !== 0) {
      socket.writeFile[data.n].writeStream.write(socket.writeFile[data.n].frags);
      socket.send(pre({t:'up-pic'}, socket.isBuffer));
    } else {
      socket.writeFile[data.n].writeStream.on('open', (e) => {
        socket.writeFile[data.n].open = true;
        socket.writeFile[data.n].writeStream.write(socket.writeFile[data.n].frags);
        socket.send(pre({t:'up-pic'}, socket.isBuffer));
      });
    }
    socket.writeFile[data.n].index++;
  } else if (data.i === -1) {
    socket.writeFile[data.n].finish = true;
    socket.writeFile[data.n].writeStream.end();
    let upd_u, out;
    try {
      switch (data.c) {
        case 'tn':
          out = socket.UID;
          upd_u = await USER.findOneAndUpdate({UID: socket.UID}, {pic: socket.UID}, {new: true});
          upd_u = select(upd_u);
          upd_u = _.pick(upd_u, ['pic']);
          // save pic to OBS
          await obs.saveFile(`personal/thumbnail/${write_name}`, write_path + write_name);
          // fs.unlink(write_path + write_name, () => {});
          break;
        case 'ch-cover':
          out = `/images/channel-cover/${socket.UID}/${socket.writeFile[data.n].name}.${write_name}`;
          upd_u = await CHANNEL.findOneAndUpdate({UID: socket.UID}, {cover: out}, {new: true});
          upd_u = _.pick(upd_u, ['cover']);
          break;
        case 'id-a':
        case 'id-b':
          out = `${data.c}.${socket.UID}`;
          const cate = 'verification.idPhoto' + data.c.match(/(?<=id-).+/)[0].toUpperCase();
          upd_u = await USER.findOneAndUpdate({UID: socket.UID}, {[cate]: out}, {new: true});
          upd_u = _.pick(upd_u, ['verification']);
          break;
        case 'vod':
        default:

      }
      if (socket.writeFile[data.n].finish) delete socket.writeFile[data.n];
      // if (data.c === 'tn') {
      //   out = `/images/icon/${socket.UID}/${socket.writeFile[data.n].name}.${write_name}`;
      //   upd_u = await USER.findOneAndUpdate({UID: socket.UID}, {pic: out}, {new: true});
      //   // https://localhost:5002/images/thumbnails/cjl04o0j4000jq1fyr4wq91ri/cjl191xt900053h5heqaxlycw.jpeg
      //   upd_u = select(upd_u);
      //   upd_u = _.pick(upd_u, ['pic']);
      // } else if (data.c === 'ch-cover') {
      //   out = `/images/channel-cover/${socket.UID}/${socket.writeFile[data.n].name}.${write_name}`;
      //   upd_u = await CHANNEL.findOneAndUpdate({UID: socket.UID}, {cover: out}, {new: true});
      //   upd_u = _.pick(upd_u, ['cover']);
      // } else if (data.c.match(/^id.+/)) {
      //   out = `/images/identity/${socket.UID}/${socket.writeFile[data.n].name}.${write_name}`;
      //   const cate = 'verification.idPhoto' + data.c.match(/(?<=id-).+/)[0].toUpperCase();
      //   upd_u = await USER.findOneAndUpdate({UID: socket.UID}, {[cate]: out}, {new: true});
      //   upd_u = _.pick(upd_u, ['verification']);
      // }
      // update every connection for the same client
      pulse.clients.forEach(ws => {
        if (ws.UID === socket.UID) {
          ws.user = {...ws.user, ...upd_u};
          if (ws.id === socket.id) {
            ws.send(pre({t:'up-pic', l: out, c: data.c}, socket.isBuffer));
          }else {
            ws.send(pre({t:'upd', u: upd_u, c: data.c}, socket.isBuffer));
          } 
        }
      });
    }catch(e) {
      console.log(e);
      return socket.send(pre({t: 'up-pic', err: '服务器错误，请稍后重试'}, socket.isBuffer));
    }
    
  }
}