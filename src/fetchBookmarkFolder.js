const getChromeBookmark = require('chrome-bookmark-reader').getChromeBookmark;
const alfy = require('alfy');
const userName = require('os').userInfo().username;
const conf = require('../conf.json');
const targetPath = `/Users/${userName}/Library/Application Support/Google/Chrome/${conf['chrome_profile']}/Bookmarks`;
const { getExecPath } = require('./utils');
const { addVariable } = require('./argHandler');

(async function () {
  let bookmarks = getChromeBookmark(targetPath, { shouldIncludeFolders: true });
  const input = alfy.input ? alfy.input.normalize() : null;

  bookmarks = bookmarks.filter((item) => item.type === 'folder');

  if (input) {
    bookmarks = bookmarks.filter((item) => {
      const name = item.name.toLowerCase();
      const loweredInput = input.normalize().toLowerCase();

      if (name.includes(loweredInput)) {
        return true;
      }
      return false;
    });
  }

  const result = bookmarks.map((item) => {
    const ret = {
      title: item.name,
      subtitle: `Include ${item.children.length} items`,
      arg: item.id,
      icon: {
        path: `${getExecPath()}/assets/folder.png`,
      },
      variables: {
        folder: addVariable('folderId', item.id)
      }
    };

    return ret;
  });
  

  result.sort((a, b) => (a.title > b.title ? 1 : -1));

  if (result.length === 0) {
    result.push({
      valid: true,
      title: 'No folder were found.',
      autocomplete: 'No folder were found.',
      subtitle: '',
      text: {
        copy: 'No folder were found.',
        largetype: 'No folder were found.',
      },
    });
  } else {
    result.splice(0, 0, {
      valid: true,
      title: `${result.length} folder were found.`,
    });
  }

  alfy.output(result);
})();
