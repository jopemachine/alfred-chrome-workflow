const alfy = require('alfy');
const fsPromise = require('fs').promises;
const psl = require('psl');
const conf = require('../conf.json');
const { getLocaleString } = require('./utils');
const {
  handleInput,
  existsAsync,
  extractHostname,
  convertChromeTimeToUnixTimestamp,
  decideTargetHistory,
  getHistoryDB,
  getFaviconDB,
} = require('./utils');

(async function() {
  let input = alfy.input ? alfy.input.normalize() : '';
  input = handleInput(input);
  const domainQuery = input.domain !== '' ? input.domain : input.query;
  const titleQuery = input.query;

  const historyDB = getHistoryDB();
  getFaviconDB();
  historyDB.prepare('ATTACH DATABASE \'./_favicon.db\' AS favicons').run();

  let historys = historyDB
    .prepare(
      `
      SELECT urls.id, urls.title, urls.url, urls.last_visit_time, favicon_bitmaps.image_data, favicon_bitmaps.last_updated
          FROM urls
              LEFT OUTER JOIN icon_mapping ON icon_mapping.page_url = urls.url,
                  favicon_bitmaps ON favicon_bitmaps.id =
                      (SELECT id FROM favicon_bitmaps
                          WHERE favicon_bitmaps.icon_id = icon_mapping.icon_id
                          ORDER BY width DESC LIMIT 1)
          WHERE (urls.title LIKE '%${titleQuery}%' ${domainQuery !== '' ? 'AND' : 'OR' } urls.url LIKE '%${domainQuery}%')
          ORDER BY ${conf.chh.history_sort}
      `
    )
    .all();

  let deletedItems;
  const wholeLogLen = historys.length;

  if (conf.chh.delete_duplicate) {
    const { targetHistory, deleted } = decideTargetHistory(historys);
    historys = targetHistory;
    deletedItems = deleted;
  } else {
    historys = historys.slice(0, conf.chh.result_limit);
  }

  const result = await Promise.all(
    historys.map(async (item) => {
      const unixTimestamp = convertChromeTimeToUnixTimestamp(
        item.last_visit_time
      );
      const hostname = psl.get(extractHostname(item.url));
      const favCache = `cache/${hostname}.png`;
      !(await existsAsync(favCache)) &&
        (await fsPromise.writeFile(`cache/${hostname}.png`, item.image_data));

      return {
        icon: {
          path: `cache/${hostname}.png`,
        },
        title: item.title,
        subtitle: getLocaleString(unixTimestamp, conf.locale),
        arg: item.url,
        text: {
          copy: item.url,
          largetype: item.url,
        },
      };
    })
  );

  if (result.length === 0) {
    result.push({
      valid: true,
      title: 'No logs were found.',
      autocomplete: 'No logs were found.',
      subtitle: '',
      text: {
        copy: 'No logs were found.',
        largetype: 'No logs were found.',
      },
    });
  } else {
    result.splice(0, 0, {
      valid: true,
      title: `${wholeLogLen} logs were found.`,
      subtitle: `${result.length} shows up ${
        deletedItems ? `(${deletedItems} deleted due to duplication)` : ''
      }`,
    });
  }

  alfy.output(result);
}) ();
