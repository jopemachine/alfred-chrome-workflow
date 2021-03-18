const alfy = require('alfy');
const conf = require('../conf.json');
const { getWebDataDB } = require('./utils');
const _ = require('lodash');

(async function() {
  let input = alfy.input ? alfy.input.normalize() : '';

  const webDataDB = getWebDataDB();
  let autofillDatas = webDataDB
    .prepare(
      `
      SELECT value, name, date_created, count
        FROM autofill
        WHERE value LIKE '%${input}%' OR name LIKE '%${input}%'
        ORDER BY value DESC
      `
    )
    .all();

  let deletedItems;
  const wholeLogLen = autofillDatas.length;

  autofillDatas = _.uniqBy(autofillDatas, 'value');
  autofillDatas = autofillDatas.slice(0, conf.cha.result_limit);

  const result = await Promise.all(
    autofillDatas.map(async (item) => {
      return {
        title: item.value,
        subtitle: `Name: [${item.name}]`,
        arg: item.value,
        icon: {
          path: 'assets/info.png',
        },
        text: {
          copy: item.value,
          largetype: item.value,
        },
        mods: {
          cmd: {
            subtitle: 'Press Enter to copy this url to clipboard',
          },
        },
      };
    })
  );

  if (result.length === 0) {
    result.push({
      valid: true,
      title: 'No data were found.',
      autocomplete: 'No data were found.',
      subtitle: '',
      text: {
        copy: 'No data were found.',
        largetype: 'No data were found.',
      },
    });
  } else {
    result.splice(0, 0, {
      valid: true,
      title: `${wholeLogLen} data were found.`,
      subtitle: `${result.length} shows up ${
        deletedItems ? `(${deletedItems} deleted due to duplication)` : ''
      }`,
    });
  }

  alfy.output(result);
}) ();