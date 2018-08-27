const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
//jwt.sign / jwt.verify
const cuid = require('cuid');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const {hex_md5} = require('../helper/md5');
const {b64_sha256} = require('../helper/sha256');
const _ = require('lodash');
const ConvertUTCTimeToLocalTime = require('../helper/timezone');
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true });
const schema = new mongoose.Schema({
  /*-----------------------------------------------
    Basic feilds
  -------------------------------------------------*/ 
  UID: {
    type: String,
    unique: true,
    required: true
  },
  username: { type: String, trim: true},
  nameForCheck: { type: String, uppercase: true, trim: true},
  password: { type: String, required: true },
  email: {
    use: {type: Boolean, defalut: false},
    value: {type: String, defalut: '', uppercase: true, trim: true}
  },
  phone: {
    use: {type: Boolean, defalut: false},
    value: {type: Number, defalut: 0, get: v => Math.floor(v)}
  },
  pic: {type: String, default: null},
  address: [
    {
      recent: {type: Boolean, default: false},
      country: {type: String},
      state: {type: String},
      city: {type: String},
      district: {type: String},
      detail: {type: String},
      zip: {type: String}
    }
  ],
  verification: {
    verified: {type: Boolean, defualt: false},
    class: {type: String, defalut: 'id'},
    name: {type: String, defualt: null},
    no: {type: String, defalut: null},
    gender: {type: Boolean, default: null},
    dob: {type: Date, default: null},
    location: {type: String, defalut: null},
    phone: {type: String, defalut: null},
    expires: {type: Date, defalut: null},
  },
  /*-----------------------------------------------
    show other public feilds
  -------------------------------------------------*/ 
  /**
   * @param {Number} auth
   *   (0 - SELF)
   *    1 - USER
   *    2 - ADMIN
   *    3 - SUPER
   *    4 - OWNER
   */
  person: {
    auth: { type: String, default: 1 },
    level: {type: Number, defalut: 1, get: v => Math.floor(v)},
    exp: {type: Number, defalut: 0, get: v => Math.floor(v)}
  },
  buyer: {
    is: {type: Boolean, default: true},
    level: {type: Number, defalut: 1, get: v => Math.floor(v)},
    exp: {type: Number, defalut: 0, get: v => Math.floor(v)},
    credit: {type: Number, defalut: 0, get: v => Math.floor(v)},
  },
  seller: {
    is: {type: Boolean, default: false},
    shopID: {type: String, default: ''}, 
    level: {type: Number, defalut: 1, get: v => Math.floor(v)},
    exp: {type: Number, defalut: 0, get: v => Math.floor(v)},
    credit: {type: Number, defalut: 0, get: v => Math.floor(v)},
  },
  balance: {
    total: {type: Number, defalut: 0},
    usable: {type: Number, defalut: 0}
  },
  /*-----------------------------------------------
    System feilds
  -------------------------------------------------*/ 
  registerDetails: { 
    ip: {type: String},
    client: {type: String},
    time: {type: Date, default: ConvertUTCTimeToLocalTime(true)}
  },
  lastVisit: {
    ip: {type: String},
    client: {type: String},
    time: {type: Date, default: ConvertUTCTimeToLocalTime(true)}
  },
  records: [
    { //{register, update, upgrade, downgrade, upSeller, downSeller}
      event: { type: String, required: true },
      log: { type: String, required: true },
      date: { type: Date, required: true },
      by: { type: String, required: true }
    }
  ],
  /*-----------------------------------------------
    login tokens
  -------------------------------------------------*/   
  tokens: [
    {
      loginTime: { type: Date, defalut: ConvertUTCTimeToLocalTime(true)},
      location: {type: String, defalut: ''},
      access: { type: String, required: true },
      token: { type: String, required: true },
      expires: { type: Date, required: true }
    }
  ],
  
  /*-----------------------------------------------
    Optional feilds
  -------------------------------------------------*/   
  // transactions: [
  //   { //{paid, cancelled, transport, received, done}
  //     status: {type: String},
  //     items: [
  //       {
  //         id: {type: String},
  //         amount: {type: Number},
  //         price: {type: Number}
  //       }
  //     ],
  //     date: {type: Date},
  //     transport: {
  //       company: {type: String},
  //       serialNo: {type: String}
  //     },
  //     feedback: {
  //       stars: {type: Number},
  //       message: {type: String}
  //     }
  //   }
  // ]
}); 


// Class method for generate Token
schema.methods.generateAuthToken = function (ip, client, expires) {
  const user = this;
  // user access level - {USER, ADMIN(trade, topics), SUPER, OWNER}
  const access = user.person.auth;
  expires = expires?ConvertUTCTimeToLocalTime(true, false, expires):ConvertUTCTimeToLocalTime(true, false);
  if (!ip || !client) throw 'Missing....{ip, client}';
  // make hash value of IP + Client
  const hash = b64_sha256(hex_md5(ip + client));
  let token = jwt.sign({
    _id: user._id.toHexString(),  // user_id: 5ad63292c1bedd0c9378af0a
    access,                       // access level: 2
    hash,                         // hash contains IP + Client: pKDcCf+HJX+vJLStdNPPgJp1RtVSiDLN3JM0KL7hSKQ
    expires                       // token expires timestamp: 1524618158943
  }, process.env.JWT_SECRET);

  // push Token with something into user Tokens Array
  user.tokens.push({
    loginTime: ConvertUTCTimeToLocalTime(true),
    location: '',
    access, token, expires
  });
  // save user
  return user.save().then(() => {
    return token
  }).catch((e)=>{
    throw e
  });
}

schema.methods.removeToken = function (token) {
  const user = this;
  return user.update({
    $pull: {
      tokens: {token}
    }
  });
}

schema.methods.refreshToken = function () {
  const user = this;
  return user.update(
    { $pull: {tokens: { expires: { $lte: ConvertUTCTimeToLocalTime(true) } } } },
    { multi: true }
  )
}

schema.methods.recordEvent = function (event, log, by) {
  let user = this;
  user.records.push({event, log, date: ConvertUTCTimeToLocalTime(true), by});
  return user.save().then().catch(e => {throw e});
}


schema.methods.verifyPassword = async function (password) {
  console.log('verifyPassword 1.',this.password);
  try {
    const pass = await bcrypt.compare(password, this.password);
    console.log('verifyPassword 2.',pass);
    if (!pass) return false;
    return true;
  }catch(e) {
    console.log('verifyPassword 3.',e);
    return false;
  }
}

schema.statics.verifyToken = async function (token, ip, client) {
  const users = this;
  try {
    // decode token into payload
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // use payload info find user
    const user = await users.findOne({
      '_id': payload._id,
      'tokens.token': token,
      'tokens.access': payload.access 
    });
    // check if user exists
    if (!user) {
      console.log('user not found || token removed');
      return false;
    }
    // check if token expires
    if (payload.expires < ConvertUTCTimeToLocalTime(true)) {
      //remove expired token
      const cb = await user.update({ $pull: { tokens: {token} } });
      console.log({cb ,msg: 'token expired and will be removed'})
      return false; 
    }
    // check if this token is generated by the same client (IP + Client)
    const hash = b64_sha256(hex_md5(ip + client));
    if (hash !== payload.hash) {
      console.log('not same client');
      return false;
    }
    return user;
  }catch(e) {
    console.log(e)
    return false;
  }
}


// Pre 'save' middleware
schema.pre('save', function (next) {
  console.log('saving document');
  const user = this;
  if (user.isNew) {
    if (!user.phone) user.phone = {use: false, value: 0};
    if (!user.email) user.email = {use: false, value: ''};
    user.verification.verified = false;
    user.person = {level: 1, exp: 0};
    user.buyer = {level: 1, exp: 0, credit: 1000};
    user.seller = {level: 1, exp: 0, credit: 1000};
    user.balance = {total: 0, usable: 0};
    user.nameForCheck = user.username;
  }
  if (user.isModified('username')) {
    // Capitalize username for checking unique
    user.nameForCheck = user.username;
  }
  // only save password when it's created or changed
  if (user.isModified('password')) {
    // hashing password using bcrypt with 10 rounds of salting (~10 hashes / sec)
    const salt = bcrypt.genSaltSync(10);
      // actual hashing 
    const hash = bcrypt.hashSync(user.password, salt);
    user.password = hash;
  }
  next();
});

const User = mongoose.model('User', schema);

module.exports = User;