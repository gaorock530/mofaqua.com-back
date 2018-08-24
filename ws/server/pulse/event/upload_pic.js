const fs = require('fs');
const path = require('path');
const USER = require('../../../../models/users');
const CHANNEL = require('../../../../models/channel');
const {select, pre, fileExists} = require('../../../utils');
const _ = require('lodash');

module.exports = async (socket, data, pulse) => {
  const basePath = path.normalize(path.join(__dirname, `../../../../user-images/${socket.UID}/`));
  // stores file path;
  let write_path;
  // check params;
  if (!data.n || !data.c) return socket.send(pre({t: 'up-pic', err: '缺少必要参数，请稍后重试'}, socket.isBuffer));
  // check category
  if (data.c === 'tn') {
    write_path = path.join(basePath, 'thumbnails/');
  }else if (data.c === 'ch-cover') {
    write_path = path.join(basePath, 'channel-cover/');
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
    socket.writeFile[data.n].writeStream = fs.createWriteStream(write_path + 'thumbnail.jpeg', {
      flag: 'r+', 
      encoding: 'base64', 
      autoClose: true, 
      start: 0
    });
    socket.writeFile[data.n].writeStream.on('close', (e) => {
      if (socket.writeFile[data.n].finish) delete socket.writeFile[data.n];
      console.log('uploading done.', socket.writeFile);
    });
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
      if (data.c === 'tn') {
        out = `https://localhost:5002/images/thumbnails/${socket.UID}/${socket.writeFile[data.n].name}.thumbnail.jpeg`;
        upd_u = await USER.findOneAndUpdate({UID: socket.UID}, {pic: out}, {new: true});
        // fs.writeFileSync(path_thumbnails + data.n, socket.files[data.n].data, 'base64');
        // delete socket.files[data.n];
        // https://localhost:5002/images/thumbnails/cjl04o0j4000jq1fyr4wq91ri/cjl191xt900053h5heqaxlycw.jpeg
        upd_u = select(upd_u);
        upd_u = _.pick(upd_u, ['pic']);
      } else if (data.c === 'ch-cover') {
        out = `https://localhost:5002/images/channel-cover/${socket.UID}/${socket.writeFile[data.n].name}.thumbnail.jpeg`;
        upd_u = await CHANNEL.findOneAndUpdate({UID: socket.UID}, {cover: out}, {new: true});
        upd_u = _.pick(upd_u, ['cover']);
      }
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