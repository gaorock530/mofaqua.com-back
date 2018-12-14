const cuid = require('cuid');
const {pre} = require('../../../utils');
const USER = require('../../../../models/users');
/**
 * @description generate permit for video upload
 * @type {g-p}
 */

module.exports = async (socket) => {
  try {
    const user = await USER.findOne({UID: socket.user.UID});
    const permit = await user.generatePermit();

    console.log('permit', permit);
    socket.send(pre({t: 'g-p', p: permit}, socket.isBuffer));
  }catch(e) {
    console.log(e);
    socket.send(pre({t: 'g-p', err: e}, socket.isBuffer));
  }
  
}