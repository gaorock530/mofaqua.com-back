const mongoose = require('mongoose');
const ConvertUTCTimeToLocalTime = require('../helper/timezone');

const schema = new mongoose.Schema({ 
  cityList: {
    list: {type: Array},  // city date
    updateAt: { type: Date, default: ConvertUTCTimeToLocalTime(true)}
  }
});

const Channel = mongoose.model('System', schema);
module.exports = Channel;