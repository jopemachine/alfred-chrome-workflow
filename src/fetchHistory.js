// const path = require('path');
const alfy = require('alfy');
const fsPromise = require('fs').promises;
const conf = require('../conf.json');
const { getLocaleString } = require('./utils');
const { getHistoryDB, getFaviconDB } = require('./utils');

(async function() {
  const input = alfy.input ? alfy.input.normalize() : '';

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
          WHERE (urls.title LIKE '%${input}%' OR urls.url LIKE '%${input}%')
          ORDER BY ${conf.history_sort}
      `
    )
    .all();

  const wholeLogLen = historys.length;
  historys = historys.slice(0, 20);

  if (input) {
    historys = historys.filter(item => {
      const htmlTitle = item.title.toLowerCase();
      const url = item.url.toLowerCase();
      const loweredInput = input.normalize().toLowerCase();

      if (htmlTitle === '') return false;
      if (htmlTitle.includes(loweredInput) || url.includes(loweredInput)) {
        return true;
      }
      return false;
    });
  }

  const result = await Promise.all(
    historys.map(async (item) => {
      const unixTimestamp = Math.floor(
        item.last_visit_time / 1000000 - 11644473600
      );

      await fsPromise.writeFile(`cache/${item.id}.png`, item.image_data);

      return {
        icon: {
          path: `cache/${item.id}.png`
        },
        title: item.title,
        subtitle: getLocaleString(unixTimestamp * 1000, conf.locale),
        arg: item.url,
      };
    })
  );

  if (result === 0) {
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
      subtitle: `${result.length} shows up`,
    });
  }

  alfy.output(result);
}) ();
