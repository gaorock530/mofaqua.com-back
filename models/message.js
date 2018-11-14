const mongoose = require('mongoose');
const ConvertUTCTimeToLocalTime = require('../helper/timezone');
const cuid = require('cuid');

const schema = new mongoose.Schema({ 
  UID: {
    type: String,
    unique: true,
    required: true
  },
  message: [
    {
      id: { type: String},
      date: {type: Date},
      from: {type: String},   // where this message come from / UID
      type: {type: Boolean},  // true=system notice false=user request
      read: {type: Boolean},
      title: {type: String},
      msg: {type: String}
    }
  ]
});



schema.methods.addMsg = function (data) {
  const msg = this;

  const message = {
    id: cuid(),
    date: ConvertUTCTimeToLocalTime(true),
    from: data.from, 
    type: data.type,  
    read: false,
    title: data.title,
    msg: data.msg
  }
  
  // push Token with something into user Tokens Array
  msg.message.push(message);
  // save user
  return msg.save().then(() => {
    return message;
  }).catch((e)=>{
    console.warn(e);
    return false;
  });
}

schema.methods.updateMsg = function (ids) {
  const msg = this;
  const n = [];
  for (let i of msg.message) {
    if (~ids.indexOf(i.id)) i.read = true;
    n.push(i);
  }
  msg.message = n;
  return msg.save().then(() => {
    return true;
  }).catch((e)=>{
    console.warn(e);
    return false;
  });
}

schema.methods.deleteMsg = function (ids) {
  const msg = this;
  const n = [];
  for (let i of msg.message) {
    if (!~ids.indexOf(i.id)) n.push(i);
  }
  msg.message = n;
  return msg.save().then(() => {
    return true;
  }).catch((e)=>{
    console.warn(e);
    return false;
  });
}


const Message = mongoose.model('Message', schema);
module.exports = Message;