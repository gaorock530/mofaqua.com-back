/**
 * @description Schema of a collection for organising all the senond-hand stuff
 */

const mongoose = require('mongoose');

const schema = new mongoose.Schema({ 
  UID: {type: String},       // user id (this video belongs to)
  id: {type: String},         // unique id
  link: {type: String},       // item link
  title: {type: String},      // item name
  place: {type: String},      // '河南，新乡，红旗区'
  amount: {type: Number},     // number of items
  intrade: {type: Boolean},   // is the item in trading
  price: {type: Number},      // item price
  shipfee: {type: Number},    // shipping cost
  cover: {type: String},      // item cover image link url
  createDate: {type: Date},   // item upload timestamp
  category: {type: String},   // '海水，生物，海葵'
  content: {type: String},    // description content
  ready: {type: Boolean},     // is ready to sale
  saved: {type: Number}       // total number of saved
});

module.exports = mongoose.model('Second', schema);;