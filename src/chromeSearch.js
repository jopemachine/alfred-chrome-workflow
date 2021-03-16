const _ = require('lodash');
const url = require('url');
const alfy = require('alfy');
const psl = require('psl');
const conf = require('../conf.json');
const { distance } = require('fastest-levenshtein');
const { existsAsync, extractHostname, getHistoryDB } = require('./utils');

(async function () {
  const input = alfy.input ? alfy.input.normalize() : null;
  const loweredInput = input ? input.normalize().toLowerCase() : '';

  const historyDB = getHistoryDB();
  let historys = historyDB.prepare('SELECT url FROM urls').all();

  let querys = new Set();
  for (const history of historys) {
    const urlParts = url.parse(history.url, true);
    const query = urlParts.query;

    // Including google, youtube...
    const isQueryStmt = ['q', 'search_query', 'query'];

    for (const q of isQueryStmt) {
      const queryWord = query[q];
      // If url is kind of query..
      if (queryWord) {
        const item = {
          queryWord,
          url: history.url,
          distance: input ? distance(input, queryWord) : 0,
        };

        if (queryWord.includes(loweredInput)) {
          querys.add(item);
        }
      }
    }
  }

  const result = await Promise.all(
    _.map(Array.from(querys.values()), async (item) => {
      const hostname = psl.get(extractHostname(item.url));
      const ret = {
        title: item.queryWord,
        subtitle: item.url,
        distance: item.distance,
        quicklook: item.url,
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

  result.splice(0, 0, {
    valid: true,
    title: `Search with ${input ? '"' + input + '"' : '(null)'}`,
    subtitle: `${result.length} logs were found.`,
    variables: {
      type: 'query',
      query: input
    }
  });

  alfy.output(result.slice(0, conf.chs.result_limit));
})();
