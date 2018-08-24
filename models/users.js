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
  username: { 
    type: String,
  },
  nameForCheck: { type: String },
  password: { type: String, required: true },
  birthday: {type: Date, default: null},
  gender: {type: Boolean, default: null},
  email: {type: String, unique: false},
  phone: { 
    type: String,
  },
  pic: {type: String, default: null},
  address: [
    {
      recent: {type: Boolean, default: true},
      country: {type: String},
      state: {type: String},
      city: {type: String},
      district: {type: String},
      street: {type: String},
      detail: {type: String},
      zip: {type: String}
    }
  ],
  
  /*-----------------------------------------------
    show other public feilds
  -------------------------------------------------*/ 
  seller: { type: Boolean, default: false },
  useableBalance: {type: Number, default: 0},
  depositBalance: {type: Number, default: 0},
  /*-----------------------------------------------
    System feilds
  -------------------------------------------------*/ 
  registedDate: { type: Date, default: ConvertUTCTimeToLocalTime(true) },
  registerClient: { type: String, default: '' },
  lastVisit: {
    client: { type: String, default: '' },
    time: { type: Date, default: ConvertUTCTimeToLocalTime(true) }
  },
  
  /**
   * @param {Number} authLevel 
   *   (0 - SELF)
   *    1 - USER
   *    2 - ADMIN
   *    3 - SUPER
   *    4 - OWNER
   */
  authLevel: { type: String, default: 1 },
  records: [
    { //{register, update, upgrade, downgrade, upSeller, downSeller}
      event: { type: String, required: true },
      log: { type: String, required: true },
      date: { type: Date, required: true },
      by: { type: String, required: true }
    }
  ],
  tokens: [
    {
      access: { type: String, required: true },
      token: { type: String, required: true },
      expires: { type: Number, required: true }
    }
  ],
  buyerLevel: {type: Number, default: 1},
  buyerPoints: {type: Number, default: 0},
  sellerLevel: {type: Number, default: 1},
  sellerPoints: {type: Number, default: 0},
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
  const access = user.authLevel;
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
  user.tokens.push({access, token, expires});
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
  const user = this;
  user.username = user.username || cuid();
  user.phone = user.phone || cuid();
  // Capitalize username for checking unique
  user.nameForCheck = user.username?user.username.toUpperCase():cuid();
  // Capitalize email for checking unique
  user.email = user.email?user.email.toUpperCase():cuid();
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