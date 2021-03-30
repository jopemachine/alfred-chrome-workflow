// https://dfir.blog/media-history-database-added-to-chrome/

const alfy = require('alfy');
const fsPromise = require('fs').promises;
require('./init.js');
const { getMediaHistoryDB } = require('./utils');
const {
  handleInput,
  existsAsync,
  decideTargetHistory,
  filterExcludeDomain,
} = require('./utils');
const humanizeDuration = require('humanize-duration');
const _ = require('lodash');

const conf = alfy.config.get('setting');

(async function() {
  let input = alfy.input ? alfy.input.normalize() : '';
  input = handleInput(input);
  const isDomainSearch = input.isDomainSearch;
  const isArtistSearch = input.isArtistSearch;
  const domainQuery = isDomainSearch ? input.domain : input.query;
  const artistQuery = isArtistSearch ? input.artist : input.query;
  const titleQuery = input.query;

  let whereStmt = '';

  _.cond([
    [() => isDomainSearch && isArtistSearch ,
      () => { whereStmt = `WHERE url LIKE '%${domainQuery}%' AND title LIKE '%${titleQuery}%' AND artist LIKE '%${artistQuery}%'`;}],
    [() => isDomainSearch && !isArtistSearch,
      () => { whereStmt = `WHERE url LIKE '%${domainQuery}%' AND (title LIKE '%${titleQuery}%' OR artist LIKE '%${artistQuery}%')`;}],
    [() => !isDomainSearch && isArtistSearch,
      () => { whereStmt = `WHERE (url LIKE '%${domainQuery}%' OR title LIKE '%${titleQuery}%') AND artist LIKE '%${artistQuery}%'`;}],
    [() => !isDomainSearch && !isArtistSearch,
      () => { whereStmt = `WHERE url LIKE '%${domainQuery}%' OR title LIKE '%${titleQuery}%' OR artist LIKE '%${artistQuery}%'`;}]
  ]) ();

  const mediaHistoryDB = getMediaHistoryDB();
  let historys = mediaHistoryDB
    .prepare(
      `
      SELECT position_ms, url, title, artist, source_title
        FROM playbackSession
        ${whereStmt}
        ORDER BY ${conf.chm.sort} DESC
      `
    )
    .all();

  let deletedItems;
  const wholeLogLen = historys.length;

  if (conf.chm.delete_duplicate) {
    const { targetHistory, deleted } = decideTargetHistory(
      historys,
      conf.chm.result_limit
    );
    historys = targetHistory;
    deletedItems = deleted;
  } else {
    historys = historys.slice(0, conf.chm.result_limit);
  }

  let result = await Promise.all(
    historys.map(async (item) => {
      // * source_title is domain name
      // const hostname = psl.get(extractHostname(item.url));

      // * not valid!
      // const viewTime = getLocaleString(convertChromeTimeToUnixTimestamp(item.last_updated_time_s), conf.locale);
      const hostname = item.source_title;
      const playTime = humanizeDuration(item.position_ms, { language: conf.locale });
      const artist = item.artist;
      const favCache = `cache/${hostname}.png`;
      !(await existsAsync(favCache)) &&
        (await fsPromise.writeFile(`cache/${hostname}.png`, item.image_data));

      return {
        hostname,
        title: item.title,
        subtitle: artist ? `Artist: ${artist}, Play time: ${playTime}` : `Play time: ${playTime}`,
        quicklookurl: item.url,
        arg: item.url,
        icon: {
          path: `cache/${hostname}.png`,
        },
        text: {
          copy: item.url,
          largetype: item.url,
        },
        mods: {
          cmd: {
            subtitle: 'Press Enter to copy this url to clipboard',
          },
        },
      };
    })
  );

  result = filterExcludeDomain(result);

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
