/**
 * @description Schema of a collection for organising all the videos from user uploads
 */

const mongoose = require('mongoose');

const schema = new mongoose.Schema({ 
  UID: {type: String},       // user id (this video belongs to)
  id: {type: String},         // unique id 
  link: {type: String},       // video link
  title: {type: String},      // video title
  keyword: {type: Array},     // array of key words
  cover: {type: String},      // vidio cover image link url
  waterType: {type: Boolean}, // ture - salt water / false - fresh water
  original: {type: Boolean},  // is the video original
  description: {type: String},// video description
  duration: {type: Number},   // video duration
  uploadDate: {type: Date},   // video upload timestamp
  views: {type: Number},      // video total view times
  like: {type: Number},       // title number of being liked
  dislike: {type: Number},    // title number of being disliked
  saved: {type: Number},      // total number of saved/collected
  tolist: {type: String}      // playlist uid where video belong
});

const Videos = mongoose.model('Videos', schema);
module.exports = Videos;