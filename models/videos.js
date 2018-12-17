/**
 * @description Schema of a collection for organising all the videos from user uploads
 */

const mongoose = require('mongoose');

const schema = new mongoose.Schema({ 
  UID: {type: String, required: true},        // user id (this video belongs to)
  hash: {type: String, required: true, unique: true},       // unique hash for file
  // link: {type: String, required: true},       // video link
  title: {  // video title
    type: String, 
    required: true,
    maxlength: 100, 
    minlength: 3
  },      
  // cover: {type: String, required: true},      // vidio cover image link url
  keyword: {type: Array, required: true},     // all categories and key words
  original: {type: Boolean, required: true},  // is the video original
  description: {  // video description
    type: String, 
    required: true, 
    maxlength: 500, 
    minlength: 10
  },
  duration: {type: Number, required: true},   // video duration
  quality: {type: Array, required: true},     // all qualities avaliable for the video
  uploadDate: {type: Date, required: true},   // video upload timestamp
  views: {type: Number, required: true},      // video total view times
  like: {type: Number, required: true},       // title number of being liked
  dislike: {type: Number, required: true},    // title number of being disliked
  saved: {type: Number, required: true},      // total number of saved/collected
  tolist: {type: String, required: true},     // playlist uid where video belong
  checkStatus: {type: Number, required: true},// 0 - new, 1 - ok, 2 - content warning 
  task_id: {type: Number},
  transcodeStatus: {type: Number, required: true} // 0 - in-transcoding, 1 - error, 2 - ok
});

const Videos = mongoose.model('Videos', schema);
module.exports = Videos;