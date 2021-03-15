const getChromeBookmark = require('chrome-bookmark-reader')
  .getChromeBookmark;
const alfy = require('alfy');
const userName = require('os').userInfo().username;
const conf = require('../conf.json');
const targetPath = `/Users/${userName}/Library/Application Support/Google/Chrome/${conf['chrome_profile']}/Bookmarks`;
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

  result.sort((a, b) => a.title > b.title ? 1 : -1);
  alfy.output(result);
}) ();
