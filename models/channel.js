const mongoose = require('mongoose');
const cuid = require('cuid');
const ConvertUTCTimeToLocalTime = require('../helper/timezone');

// mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true });

const schema = new mongoose.Schema({ 
  // Unique ID, same across same user
  UID: {
    type: String,
    unique: true,
    required: true
  },
  // total subscriber number
  subscriber: {
    type: Number,
    default: 0
  },
  // channel cover image url
  cover: {type: String, default: null},
  /** @desc videos 
   *  implemented in videos.js
  */
  
  /** @desc video lists 
   *  implemented in videoLists.js
  */
  
  /** @desc blogs 
   *  implemented in blogs.js
  */
  
  /** @desc second trade list 
   *  implemented in secondHandStuff.js
  */
  
});

// schema.methods.addVideo = function (title, link, keyword, cover, type, original, description, duration, tolist) {
//   const channel = this;
//   // 15 - 9 = 6
//   const id = cuid();
//   channel.video.push({
//     id,
//     upload: ConvertUTCTimeToLocalTime(true),
//     views: 0,
//     like: 0,
//     dislike: 0,
//     saved: 0,
//     title, link, keyword, cover, type, original, description, duration, tolist
//   });
//   return channel.save().then(() => {
//     return id;
//   }).catch((e)=>{
//     console.log(e);
//     return false;
//   });
// }

// schema.methods.delVideo = function (id) {
//   const channel = this;
//   return new Promise((resolve, reject) => {
//     channel.update({
//       $pull: {
//         video: {id}
//       }
//     }).then(() => {
//       resolve(true);
//     }).catch(e => {
//       console.log(e);
//       reject(false);
//     });
//   })
// }

// schema.methods.addList = function (title, link, cover, description) {
//   const channel = this;
//   // 8 - 4 = 4
//   const id = cuid();
//   channel.videolist.push({
//     id,
//     upload: ConvertUTCTimeToLocalTime(true),
//     list: [],
//     saved: 0,
//     title, link, cover, description
//   });
//   return channel.save().then(() => {
//     return id;
//   }).catch((e)=>{
//     console.log(e);
//     return false;
//   });
// }

// schema.methods.delList = function (id) {
//   const channel = this;
//   return new Promise((resolve, reject) => {
//     channel.update({
//       $pull: {
//         videolist: {id}
//       }
//     }).then(() => {
//       resolve(true);
//     }).catch(e => {
//       console.log(e);
//       reject(false);
//     });
//   })
// }

// schema.methods.addBlog = function (title, link, cover, original, content, category) {
//   const channel = this;
//   // 12 - 6 = 6
//   const id = cuid();
//   channel.blog.push({
//     id,
//     upload: ConvertUTCTimeToLocalTime(true),
//     views: 0,
//     like: 0,
//     dislike: 0,
//     saved: 0,
//     title, link, cover, original, content, category
//   });
//   return channel.save().then(() => {
//     return id;
//   }).catch((e)=>{
//     console.log(e);
//     return false;
//   });
// }

// schema.methods.addSecond = function (title, link, cover, price, place, shipfee, amount, ready, content, category) {
//   const channel = this;
//   // 14 - 10 = 4
//   const id = cuid();
//   channel.blog.push({
//     id,
//     upload: ConvertUTCTimeToLocalTime(true),
//     intrade: false,
//     saved: 0,
//     title, link, cover, place, shipfee, amount, ready, content, category, price
//   });
//   return channel.save().then(() => {
//     return id;
//   }).catch((e)=>{
//     console.log(e);
//     return false;
//   });
// }



schema.methods.delField = function (id, field) {
  const channel = this;
  return new Promise((resolve, reject) => {
    channel.update({
      $pull: {
        [field]: {id}
      }
    }).then(() => {
      resolve(true);
    }).catch(e => {
      console.log(e);
      reject(false);
    });
  })
}


const Channel = mongoose.model('Channel', schema);
module.exports = Channel;