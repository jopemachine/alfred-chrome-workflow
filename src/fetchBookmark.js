const getChromeBookmark = require('chrome-bookmark-reader').getChromeBookmark;
const alfy = require('alfy');
const psl = require('psl');
const userName = require('os').userInfo().username;
const { extractHostname, existsAsync, getHistoryDB } = require('./utils');
const conf = require('../conf.json');
const targetPath = `/Users/${userName}/Library/Application Support/Google/Chrome/${conf['chrome_profile']}/Bookmarks`;

const options = {};
if (process.argv[3]) {
  options[process.argv[3].split('--')[1]] = true;
}

(async function () {
  let bookmarks = getChromeBookmark(targetPath);
  const input = alfy.input ? alfy.input.normalize() : null;

  if (input) {
    bookmarks = bookmarks.filter((item) => {
      const name = item.name.toLowerCase();
      const url = item.url.toLowerCase();
      const loweredInput = input.normalize().toLowerCase();

      if (name.includes(loweredInput) || url.includes(loweredInput)) {
        return true;
      }
      return false;
    });
  }

  const result = await Promise.all(
    bookmarks.map(async (item) => {
      const hostname = psl.get(extractHostname(item.url));
      const ret = {
        title: item.name,
        subtitle: item.url,
        arg: item.url,
        quicklookurl: item.url
      };

      (await existsAsync(`cache/${hostname}.png`)) &&
        (ret.icon = {
          path: `cache/${hostname}.png`,
        });

      return ret;
    })
  );

  if (conf.chb.sort === 'VISIT_FREQ') {
    const historyDB = getHistoryDB();
    let visitHistorys = historyDB.prepare('SELECT url FROM urls').all();

    const freqs = {};
    for (const history of visitHistorys) {
      const key = history.url;
      if (freqs[key]) {
        freqs[key] = freqs[key] + 1;
      } else {
        freqs[key] = 1;
      }
    }

    result.sort((a, b) => {
      const key1 = a.subtitle;
      const key2 = b.subtitle;

      if (freqs[key1] && freqs[key2]) return freqs[key2] - freqs[key1];
      else if (freqs[key1]) return -1;
      else if (freqs[key2]) return 1;
      else a.title > b.title ? 1 : -1;
    });
  } else {
    result.sort((a, b) => (a.title > b.title ? 1 : -1));
  }

  if (result.length === 0) {
    result.push({
      valid: true,
      title: 'No bookmarks were found.',
      autocomplete: 'No bookmarks were found.',
      subtitle: '',
      text: {
        copy: 'No bookmarks were found.',
        largetype: 'No bookmarks were found.',
      },
    });
  } else {
    result.splice(0, 0, {
      valid: true,
      title: `${result.length} bookmarks were found.`,
    });
  }

  alfy.output(result);
})();
