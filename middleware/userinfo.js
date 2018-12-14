const useragent = require('useragent');


module.exports = (req) => {
  const agent = useragent.parse(req.headers['user-agent']);
  return agent;
}

