const alfy = require('alfy');
const path = require('path');
const { getHistoryDB } = require('./utils');

(async function() {
  let downloadInfos = getHistoryDB().prepare('SELECT * FROM downloads').all();
  const input = alfy.input ? alfy.input.normalize() : null;

  if (input) {
    downloadInfos = downloadInfos.filter(item => {
      const name = item.current_path.toLowerCase();
      const referrer = item.referrer.toLowerCase();
      const loweredInput = input.normalize().toLowerCase();

      if (name.includes(loweredInput) || referrer.includes(loweredInput)) {
        return true;
      }
      return false;
    });
  }

  const result = downloadInfos.map((item) => {
    const fileFileName = item.current_path.split(path.sep).pop(); 

    return {
      title: fileFileName,
      subtitle: `Downloaded from '${item.referrer}'`,
      arg: item.current_path,
    };
  });

  alfy.output(result);
}) ();
