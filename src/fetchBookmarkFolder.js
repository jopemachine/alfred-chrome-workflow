const alfy = require('alfy');
const { getChromeBookmark, getExecPath, bookmarkDFS } = require('./utils');
const { addVariable } = require('./argHandler');

(async function () {
  const bookmarkRoot = await getChromeBookmark();
  const input = alfy.input ? alfy.input.normalize() : null;

  let bookmarks = bookmarkDFS(bookmarkRoot, { targets: ['folder'] });

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
    const len = item.children
      ? item.children.filter((item) => item.type === 'url').length
      : 0;

    const ret = {
      title: item.name,
      subtitle: `Include ${len} items`,
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
