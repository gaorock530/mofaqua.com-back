const VIDEOS = require('../../../../models/videos');
const {pre, terminate} = require('../../../utils');
const USER = require('../../../../models/users');
/**
 * @description publish videos and save to the database
 * @type {pub-vod} publish videos
 */

module.exports = async (socket, data) => {
  if (!socket.allowed) terminate(socket, 'Message not allowed{2}.');
  if (!socket.UID) terminate(socket, 'Not login{2}.');
  if (!data.video) return socket.send(pre({t: 'pub-vod', err: '还未选择要上传的视频'}, socket.isBuffer));
  console.log(data);
  
  try {
    // checking file is already existed;
    const exist = await VIDEOS.findOne({hash: data.video});
    if (exist) return socket.send(pre({t: 'pub-vod', err: '重复上传视频'}, socket.isBuffer));

    // get video info from user upload records
    let query;
    const user = await USER.findOne({UID: socket.UID}).select('upload').lean();
    for (upload of user.upload) {
      if (upload.hash === data.video) {
        query = upload;
        break;
      }
    }
    if (typeof query === 'undefined') return socket.send(pre({t: 'pub-vod', err: '数据出错，上传视频不存在'}, socket.isBuffer));

    // construct new Video record
    const newVideo = {
      UID: socket.UID,
      hash: query.hash,
      title: data.title,
      keyword: [data.type.cate1, data.type.cate2, data.type.cate3], 
      original: data.origin,
      description: data.note,
      duration: query.info.duration,
      quality: [query.info.quality],
      uploadDate: query.uploadDate,
      views: 0,      
      like: 0,       
      dislike: 0,    
      saved: 0,      
      tolist: data.list,    
      checkStatus: 0,     // 0 - new, 1 - ok, 2 - content warning 
      transcodeStatus: 0,
      task_id: query.task_id
    }

    // save video to Video model
    await new VIDEOS(newVideo).save()
    // delete video from User model
    // await USER.updateOne({ $pull: { upload: {hash: data.video} } });


    socket.send(pre({t: 'pub-vod'}, socket.isBuffer));
  }catch(e) {
    console.log(e)
    socket.send(pre({t: 'pub-vod', err: '检查填写内容，重新尝试发布'}, socket.isBuffer));
  }
 }