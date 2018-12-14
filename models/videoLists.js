/**
 * @description Schema of a collection for organising all the video list
 */

const mongoose = require('mongoose');

const schema = new mongoose.Schema({ 
  UID: {type: String},       // user id (this video belongs to)
  id: {type: String},         // unique id
  link: {type: String},       // list link
  title: {type: String},      // list name
  cover: {type: String},      // list cover image link url
  createDate: {type: Date},   // list create/update timestamp
  description: {type: String},// list description
  list: {type: Array},        // array of video IDs
  saved: {type: Number}       // total number of saved
});

const VideoList = mongoose.model('VideoList', schema);
module.exports = VideoList;