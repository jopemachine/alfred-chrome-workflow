const _ = require('lodash');
const alfy = require('alfy');
const psl = require('psl');
const conf = require('../conf.json');
const { distance } = require('fastest-levenshtein');
const {
  handleInput,
  decideTargetHistory,
  existsAsync,
  extractHostname,
  getHistoryDB,
} = require('./utils');

(async function () {
  let input = alfy.input ? alfy.input.normalize() : '';
  input = handleInput(input);
  const isDomainSearch = input.isDomainSearch;
  const domainQuery = isDomainSearch ? input.domain : input.query;
  const titleQuery = input.query;

  const historyDB = getHistoryDB();
  const historys = historyDB
    .prepare(
      `
      SELECT urls.url, keyword_search_terms.term 
          FROM keyword_search_terms
          JOIN urls ON urls.id = keyword_search_terms.url_id
          ${isDomainSearch ? `WHERE urls.url LIKE '%${domainQuery}%' AND keyword_search_terms.term LIKE '%${titleQuery}%'` :
    `WHERE keyword_search_terms.term LIKE '%${titleQuery}%'`}
          ORDER BY last_visit_time DESC
      `
    )
    .all();
  const wholeLogLen = historys.length;

  let result = await Promise.all(
    _.map(historys, async (item) => {
      const queryWord = item.term;
      const hostname = psl.get(extractHostname(item.url));
      const ret = {
        title: queryWord,
        subtitle: item.url,
        distance: input ? distance(titleQuery, queryWord) : 0,
        quicklookurl: item.url,
        mods: {
          cmd: {
            subtitle: 'Press Enter to copy this url to clipboard',
          },
        },
        text: {
          copy: item.url,
          largetype: item.url,
        },
        variables: {
          type: 'url',
          url: item.url
        },
      };

      (await existsAsync(`cache/${hostname}.png`)) &&
        (ret.icon = {
          path: `cache/${hostname}.png`,
        });

      return ret;
    })
  );

  result.sort((a, b) => {
    return a.distance - b.distance;
  });

  let deletedItems;
  if (conf.chh.delete_duplicate) {
    const { targetHistory, deleted } = decideTargetHistory(result, conf.chs.result_limit);
    result = targetHistory;
    deletedItems = deleted;
  } else {
    result = historys.slice(0, conf.chs.result_limit);
  }

  result.splice(0, 0, {
    valid: true,
    title: `${wholeLogLen} logs were found.`,
    subtitle: `${result.length} shows up ${
      deletedItems ? `(${deletedItems} deleted due to duplication)` : ''
    }`,
    variables: {
      type: 'query',
      query: input
    },
    mods: {
      cmd: {
        subtitle: `Press Enter to copy this https://www.google.com/search?q=${input} to clipboard`,
      },
    },
  });

  alfy.output(result);
})();
