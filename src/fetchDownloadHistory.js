const alfy = require('alfy');
const path = require('path');
const byteSize = require('byte-size');
const psl = require('psl');
const conf = require('../conf.json');
const {
  existsAsync,
  getHistoryDB,
  extractHostname,
  convertChromeTimeToUnixTimestamp,
  getLocaleString,
} = require('./utils');

(async function() {
  let downloadInfos = getHistoryDB()
    .prepare(`SELECT * FROM downloads ORDER BY start_time ${conf.chd.sort}`)
    .all();
  const input = alfy.input ? alfy.input.normalize() : null;

  if (input) {
    downloadInfos = downloadInfos.filter(item => {
      const fileFileName = item.current_path.split(path.sep).pop(); 
      const name = item.current_path.toLowerCase();
      const referrer = item.referrer.toLowerCase();
      const loweredInput = input.normalize().toLowerCase();

      if (fileFileName.trim() === '') return false;
      if (name.includes(loweredInput) || referrer.includes(loweredInput)) {
        return true;
      }
      return false;
    });
  }

  const result = await Promise.all(
    downloadInfos.map(async (item) => {
      const fileFileName = item.current_path.split(path.sep).pop();
      const hostname = psl.get(extractHostname(item.referrer));
      const downloadStart = convertChromeTimeToUnixTimestamp(item.start_time);
      const fileSize = byteSize(item.total_bytes);
      let subtitle = (await existsAsync(item.current_path)) ? '[O]' : '[X]';
      subtitle += ` Downloaded in ${getLocaleString(
        downloadStart,
        conf.locale
      )}, From '${hostname}'`;

      const ret = {
        title: fileFileName,
        subtitle,
        arg: item.current_path,
        quicklookurl: item.current_path,
        mods: {
          cmd: {
            subtitle: 'Press enter to delete this file',
          },
          shift: {
            subtitle: `${fileSize.value}${fileSize.unit}`,
          },
        },
      };

      (await existsAsync(`cache/${hostname}.png`)) &&
        (ret.icon = {
          path: `cache/${hostname}.png`,
        });

      return ret;
    })
  );

  if (result.length === 0) {
    result.push({
      valid: true,
      title: 'No download logs were found.',
      autocomplete: 'No download logs were found.',
      subtitle: '',
      text: {
        copy: 'No download logs were found.',
        largetype: 'No download logs were found.',
      },
    });
  } else {
    result.splice(0, 0, {
      valid: true,
      title: `${result.length} download logs were found.`,
    });
  }

  alfy.output(result);
}) ();
