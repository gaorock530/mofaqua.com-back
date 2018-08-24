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
  /** @desc videos */
  video: [
    {
      id: {type: String},         // unique id 
      link: {type: String},       // video link
      title: {type: String},      // video title
      keyword: {type: Array},     // array of key words
      cover: {type: String},      // vidio cover image link url
      type: {type: Boolean},      // ture - salt water / false - fresh water
      original: {type: Boolean},  // is the video original
      description: {type: String},// video description
      duration: {type: Number},   // video duration
      upload: {type: Date},       // video upload timestamp
      views: {type: Number},      // video total view times
      like: {type: Number},       // title number of being liked
      dislike: {type: Number},    // title number of being disliked
      saved: {type: Number},      // total number of saved
      tolist: {type: String}      // playlist uid where video belong
    }
  ],
  /** @desc video lists */
  videolist: [
    {
      id: {type: String},         // unique id
      link: {type: String},       // list link
      title: {type: String},      // list name
      cover: {type: String},      // list cover image link url
      upload: {type: Date},       // list create/update timestamp
      description: {type: String},// list description
      list: {type: Array},        // array of video IDs
      saved: {type: Number}       // total number of saved
    }
  ],
  /** @desc blogs */
  blog: [
    {
      id: {type: String},         // unique id
      link: {type: String},       // blog link
      title: {type: String},      // blog name
      cover: {type: String},      // blog cover image link url
      upload: {type: Date},       // blog upload timestamp
      category: {type: String},   // '海水，生物，海葵'
      original: {type: Boolean},  // is the blog/article original
      content: {type: String},    // blog content
      views: {type: Number},      // video total view times
      like: {type: Number},       // title number of being liked
      dislike: {type: Number},    // title number of being disliked
      saved: {type: Number}       // total number of saved
    }
  ],
  /** @desc second trade list */
  second: [
    {
      id: {type: String},         // unique id
      link: {type: String},       // item link
      title: {type: String},      // item name
      place: {type: String},      // '河南，新乡，红旗区'
      amount: {type: Number},     // number of items
      intrade: {type: Boolean},   // is the item in trading
      price: {type: Number},      // item price
      shipfee: {type: Number},    // shipping cost
      cover: {type: String},      // item cover image link url
      upload: {type: Date},       // item upload timestamp
      category: {type: String},   // '海水，生物，海葵'
      content: {type: String},    // blog content
      ready: {type: Boolean},     // is ready to sale
      saved: {type: Number}       // total number of saved
    }
  ]
});

schema.methods.addVideo = function (title, link, keyword, cover, type, original, description, duration, tolist) {
  const channel = this;
  // 15 - 9 = 6
  const id = cuid();
  channel.video.push({
    id,
    upload: ConvertUTCTimeToLocalTime(true),
    views: 0,
    like: 0,
    dislike: 0,
    saved: 0,
    title, link, keyword, cover, type, original, description, duration, tolist
  });
  return channel.save().then(() => {
    return id;
  }).catch((e)=>{
    console.log(e);
    return false;
  });
}

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

schema.methods.addList = function (title, link, cover, description) {
  const channel = this;
  // 8 - 4 = 4
  const id = cuid();
  channel.videolist.push({
    id,
    upload: ConvertUTCTimeToLocalTime(true),
    list: [],
    saved: 0,
    title, link, cover, description
  });
  return channel.save().then(() => {
    return id;
  }).catch((e)=>{
    console.log(e);
    return false;
  });
}

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

schema.methods.addBlog = function (title, link, cover, original, content, category) {
  const channel = this;
  // 12 - 6 = 6
  const id = cuid();
  channel.blog.push({
    id,
    upload: ConvertUTCTimeToLocalTime(true),
    views: 0,
    like: 0,
    dislike: 0,
    saved: 0,
    title, link, cover, original, content, category
  });
  return channel.save().then(() => {
    return id;
  }).catch((e)=>{
    console.log(e);
    return false;
  });
}

schema.methods.addSecond = function (title, link, cover, price, place, shipfee, amount, ready, content, category) {
  const channel = this;
  // 14 - 10 = 4
  const id = cuid();
  channel.blog.push({
    id,
    upload: ConvertUTCTimeToLocalTime(true),
    intrade: false,
    saved: 0,
    title, link, cover, place, shipfee, amount, ready, content, category, price
  });
  return channel.save().then(() => {
    return id;
  }).catch((e)=>{
    console.log(e);
    return false;
  });
}



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