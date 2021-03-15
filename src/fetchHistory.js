// const path = require('path');
const alfy = require('alfy');
const conf = require('../conf.json');
const { getLocaleString } = require('./utils');
const { getHistoryDB } = require('./utils');

(async function() {
  const input = alfy.input ? alfy.input.normalize() : null;

  let historys = getHistoryDB()
    .prepare(
      `SELECT url, title, last_visit_time FROM urls ORDER BY last_visit_time DESC LIMIT ${conf.result_limit}`
    )
    .all();

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

  const result = historys.map((item) => {
    const unixTimestamp = Math.floor(((item.last_visit_time / 1000000) - 11644473600));
    return {
      title: item.title,
      subtitle: getLocaleString(unixTimestamp * 1000, conf.locale),
      arg: item.url,
    };
  });

  alfy.output(result);
}) ();
