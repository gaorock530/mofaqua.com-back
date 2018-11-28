'use strict';
/**
 * @name ReefMagic a fish club app
 * @author Magic
 * @description the main entry file, starts server
 * @version 0.0.1
 */
// load config.json
require('./config');



// load main frameworks
const express = require('express');
// load helper utils
// const http = require('http');
const path = require('path');
const https = require('https');
const fs = require('fs');
const bodyParser = require('body-parser');
// const cookieParser = require('cookie-parser');
const cors = require('cors');

// pre-configurations
const PORT = process.env.PORT || 5005;
const WS_PATH = '/ws';
const USER_IMAGE_FOLDER = path.join(__dirname, 'user-images');
const SYSTEM_IMAGE_FOLDER = path.join(__dirname, 'sys-images');

// assign apps
// create express app
const app = express();
// create http server using Express app
// const server = http.createServer(app);
// create a Https server with options
const options = {
  key: fs.readFileSync(path.join(__dirname, 'keys', 'key.pem')),
  cert: fs.readFileSync(path.join(__dirname, 'keys', 'cert.pem'))
}

// WebSocket Plugin
const serverS = https.createServer(options, app);
// Start webwocket server
require('./ws')(serverS);

console.log(process.env.HOST, process.env.PORT);
// configuration
app.disable('etag').disable('x-powered-by');

// middlewares
app.use(express.static(path.join(__dirname, 'static')));
// solve cross origin control
app.use(cors());
// parse post body
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
// set custom HTTP Headers
app.use((req, res, next) => {
  res.setHeader('Server', 'MagicBox');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  next();
});

// check basic folders for images, if not exist, create one at server start
if (!fs.existsSync(USER_IMAGE_FOLDER)) fs.mkdirSync(USER_IMAGE_FOLDER);
if (!fs.existsSync(SYSTEM_IMAGE_FOLDER)) fs.mkdirSync(SYSTEM_IMAGE_FOLDER);

// https Router
require('./httpsRouter')(app);

// app.get('/images/:category/:name/:file', (req, res) => {
//   const name = req.params.file.split('.');
//   const file = `/user-images/${req.params.name}/${req.params.category}/${name[1]}.${name[2]}`;
//   const filePath = path.normalize(path.join(__dirname, file));
//   // const out = normal(file);
//   console.log(filePath)
//   if (fileExists(filePath, 'file')) {
//     res.status(200).sendFile(filePath);
//   } else {
//     res.status(404).send('no');
//   }
// })



console.log(USER_IMAGE_FOLDER);
console.log(SYSTEM_IMAGE_FOLDER);

// start https server
serverS.listen(PORT, (err) => {
  console.log(err || `The HTTPS server is running on PORT: ${PORT}\nThe WebSocket server is running on PORT: ${PORT} with route '${WS_PATH}'`);
});



// function fileExists(filePath, type = 'dir') {
//   // console.log(filePath, type);
//   try{
//     if (type === 'dir') return fs.statSync(filePath).isDirectory();
//     if (type === 'file') return fs.statSync(filePath).isFile();
//   }catch (err){
//     return false;
//   }
// }

// sudo brew install ffmpeg --with-chromaprint --with-fdk-aac --with-fontconfig --with-freetype --with-frei0r --with-game-music-emu --with-libass --with-libbluray --with-libbs2b --with-libcaca --with-libgsm --with-libmodplug --with-librsvg --with-libsoxr --with-libssh --with-libvidstab --with-libvorbis --with-libvpx --with-opencore-amr --with-openh264 --with-openjpeg --with-openssl --with-opus --with-rtmpdump --with-rubberband --with-sdl2 --with-snappy --with-speex --with-srt --with-tesseract --with-theora --with-tools --with-two-lame --with-wavpack --with-webp --with-x265 --with-xz --with-zeromq --with-zimg --HEAD
// export NODE_ENV=production
