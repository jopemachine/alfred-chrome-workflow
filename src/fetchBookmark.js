const getChromeBookmark = require('chrome-bookmark-reader')
  .getChromeBookmark;

const path = require('path');
const userName = require('os').userInfo().username;
const conf = require('../conf.json');
const targetPath = conf.bookmark_path
  .replace('<user_name>', userName)
  .replace('<chrome_profile>', conf['chrome_profile']);

const bookmarks = getChromeBookmark(targetPath);

