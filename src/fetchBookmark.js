const getChromeBookmark = require('chrome-bookmark-reader')
  .getChromeBookmark;
const alfy = require('alfy');
const userName = require('os').userInfo().username;
const conf = require('../conf.json');
const targetPath = conf.bookmark_path
  .replace('<user_name>', userName)
  .replace('<chrome_profile>', conf['chrome_profile']);
// const { getLocaleString } = require('./utils');

(async function() {
  let bookmarks = getChromeBookmark(targetPath);

  const input = alfy.input ? alfy.input.normalize() : null;
  
  if (input) {
    bookmarks = bookmarks.filter(item => {
      const name = item.name.toLowerCase();
      const url = item.url.toLowerCase();
      const loweredInput = input.normalize().toLowerCase();
  
      if (name.includes(loweredInput) || url.includes(loweredInput)) {
        return true;
      }
      return false;
    });
  }
  
  const result = bookmarks.map((item) => {
    return {
      title: item.name,
      subtitle: item.url,
      arg: item.url,
    };
  });

  alfy.output(result);
}) ();
