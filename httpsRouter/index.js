const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const upload = require('express-fileupload');
const cuid = require('cuid');
const axios = require('axios');
// database
const System = require('../models/system');

module.exports = (app) => {
  // basic router
  app.get('/citylist', async (req, res) => {
    let list;
    try {
      const data = await System.findOne().sort({'cityList.version': -1});
      if (!data) {
        const newdata = await axios({
          method: 'get',
          url: 'https://apis.map.qq.com/ws/district/v1/list?key=BBYBZ-2A66F-UDJJ2-NSWRG-VD3TZ-VSFE2&output=jsonp&callback=cb',
          responseType: 'jsonp'
        });
        const listObj = JSON.parse(newdata.data.slice(7, newdata.data.length - 1));
        const doc = new System({'cityList.list': listObj.result, 'cityList.version': listObj.data_version});
        const saved = await doc.save();
        list = saved.cityList.list;
      } else {
        list = data.cityList.list;
      }
      res.status(200).send(list);
    }catch(e) {
      console.log(e);
      res.status(404).send(e);
    }
    

    
    // try {
    //   const saved = await doc.save();
    //   console.log(saved);
    //   res.status(200).send('ok');
    // }catch(e) {
    //   console.log(e);
    //   res.status(404).send(e);
    // }
    
  })

  // handle user icon image request
  app.get('/images/:category/:name/:file', (req, res) => {
    const name = req.params.file.split('.');
    const file = `../user-images/${req.params.name}/${req.params.category}/${name[1]}.${name[2]}`;
    const out = normal(file);
    console.log(out)
    if (fileExists(file, 'file')) {
      res.status(200).sendFile(out);
    } else {
      res.status(404).send('no');
    }
  })

  // handles video file request (out.mpd -> *.mp4)
  app.get('/videos/:dir/:quality/:file', (req, res) => {
    console.log(req.params);
    // :dir = uid + file
    // "https://localhost:5000/videos/cjon0c9d20002xnfyp5de3vh8.cjot57gvj00068faqcl2104aa/cjot57gvj00068faqcl2104aa.mpd"
    const uid = req.params.dir.split('.')[0];
    const file = req.params.dir.split('.')[1];
    const type = req.params.dir.split('.')[2];
    const dir = `../user-channel-data/${uid}/manifest/${file}/${type}/${req.params.quality}/${req.params.file}`
    const out = normal(dir);
    if (fileExists(dir, 'file')) {
      res.status(200).sendFile(out);
    } else {
      res.status(404).send('no');
    }
  })

  // handle channel cover image request
  // app.get('/images/channel-cover/:name/:file', (req, res) => {
  //   const name = req.params.file.split('.');
  //   const file = '/user-images/' + req.params.name + '/channel-cover/' + name[1] +'.'+ name[2];
  //   if (fileExists(file, 'file')) {
  //     res.status(200).sendFile(path.join(__dirname, file));
  //   } else {
  //     res.status(404).send('no');
  //   }
  // })
// app.use(upload({
//   limits: { fileSize: 50 * 1024 * 1024 }
// }))
require('./upload-video')(app);
}  


/* -------------- Functions ------------------- */




function fileExists(filePath, type = 'dir') {
  filePath = path.normalize(path.join(__dirname, filePath));
  // console.log(filePath, type);
  try{
    if (type === 'dir') return fs.statSync(filePath).isDirectory();
    if (type === 'file') return fs.statSync(filePath).isFile();
  }catch (err){
    return false;
  }
}

function normal (filePath) {
  return path.normalize(path.join(__dirname, filePath));
}