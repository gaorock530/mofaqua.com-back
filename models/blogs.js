/**
 * @description Schema of a collection for organising all the blogs
 */

const mongoose = require('mongoose');

const schema = new mongoose.Schema({ 
  UID: {type: String},       // user id (this video belongs to)
  id: {type: String},         // unique id
  link: {type: String},       // blog link
  title: {type: String},      // blog name
  cover: {type: String},      // blog cover image link url
  createDate: {type: Date},   // blog upload timestamp
  category: {type: String},   // '海水，生物，海葵'
  original: {type: Boolean},  // is the blog/article original
  content: {type: String},    // blog content
  views: {type: Number},      // video total view times
  like: {type: Number},       // title number of being liked
  dislike: {type: Number},    // title number of being disliked
  saved: {type: Number}       // total number of saved
});

module.exports = mongoose.model('Blog', schema);;