const ChromeHistoryReader = require('chrome-history-reader')
  .ChromeHistoryReader;
const path = require('path');
const alfy = require('alfy');
const userName = require('os').userInfo().username;
const conf = require('../conf.json');
const { getLocaleString } = require('./utils');
const targetPath = conf.history_path
  .replace('<user_name>', userName)
  .replace('<chrome_profile>', conf['chrome_profile']);

(async function() {
  const chromeHistoryReader = new ChromeHistoryReader({
    historyFilePath: path.normalize(targetPath),
  });
  
  const input = alfy.input ? alfy.input.normalize() : null;
  
  let historys = chromeHistoryReader.execute({
    resultLimit: conf.result_limit,
  });
  
  if (input) {
    historys = historys.filter(item => {
      const htmlTitle = item.title.toLowerCase();
      const url = item.url.toLowerCase();
      const loweredInput = input.normalize().toLowerCase();
  
      if (htmlTitle.includes(loweredInput) || url.includes(loweredInput)) {
        return true;
      }
      return false;
    });
  }
  
  const result = historys.map((item) => {
    const unixTimestamp = Math.floor(((item.lastVisitTime / 1000000) - 11644473600));
    return {
      title: item.title,
      subtitle: getLocaleString(unixTimestamp * 1000, conf.locale),
      arg: item.url,
    };
  });

  alfy.output(result);
}) ();
