const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const upload = require('express-fileupload');

const stage1 = require('./processVideo/uploading');
const stage2 = require('./processVideo/converting');
const stage3 = require('./processVideo/manifest');

/**
 * @description process uploading videos via FFmpeg
 * @version 1.1 use this ONLY when server is good enough for transcoding videos (graphic card)
 */
// for tracking user video upload;
process.videoUploadList = {}

module.exports = (app) => {
  app.post('/videoupload', upload({createParentPath: true}), (req, res) => {
    console.log('post /videoupload')
    console.log(process.videoUploadList);
    console.log(req.body);
    if (!req.body.uid || !req.body.permit || !req.body.process) return res.status(200).send({err: 'arguments not provide correctly.'});
    if (!process.videoUploadList[req.body.uid] || process.videoUploadList[req.body.uid].permit !== req.body.permit) return res.status(200).send({err: 'attack warning!'});
    switch (req.body.process.toString()) {
      case '1':
        if (process.videoUploadList[req.body.uid].process !== 0) return res.send({err: 'processign stage not provide correctly.'})
        return stage1(req, res, req.body.uid);
      case '2':
        if (process.videoUploadList[req.body.uid].process !== 1) return res.send({err: 'processign stage not provide correctly.'})
        return stage2(req, res, req.body.uid);
      case '3':
        if (process.videoUploadList[req.body.uid].process !== 2) return res.send({err: 'processign stage not provide correctly.'})
        return stage3(req, res, req.body.uid);
      default:
        return res.status(200).send({err: 'process stage not provide correctly.'});
    }
  })
}











