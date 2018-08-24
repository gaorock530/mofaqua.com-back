const axios = require('axios');
const {hex_sha256} = require('./sha256');

module.exports = async function (number, code) {
  if (!number) return false;
  const strMobile = number; //tel 的 mobile 字段的内容
  const strAppKey = "e3e20a0443d0beef23abe0354eaceef7"; //sdkappid 对应的 appkey，需要业务方高度保密
  const strRand = (Math.random()*(9999999999-1000000001+1)+1000000001) | 0;; //url 中的 random 字段的值
  const strTime = Date.now()/1000 | 0; //unix 时间戳
  const sig = hex_sha256(`appkey=${strAppKey}&random=${strRand}&time=${strTime}&mobile=${strMobile}`);
  const post = {
    "ext": "",
    "extend": "",
    "params": [
      code,
      "10"
    ],
    "sig": sig,
    // "sign": "魔法水族",
    "tel": {
        "mobile": strMobile,
        "nationcode": "86"
    },
    "time": strTime,
    "tpl_id": 140329
  }
  const res = await axios.post(`https://yun.tim.qq.com/v5/tlssmssvr/sendsms?sdkappid=1400097002&random=${strRand}`, post);
  if (res.data.result === 0) return true;
  console.log(res.data);
  return false;
}