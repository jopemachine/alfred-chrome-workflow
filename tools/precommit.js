const fs = require('fs');

const defaultConfig = {
  'chrome_profile': 'Default',
  'result_limit': 50,
  'locale': 'en',
  'history_sort': 'last_visit_time DESC'
};

fs.writeFileSync(
  'conf.json',
  '\ufeff' + JSON.stringify(defaultConfig, null, 2),
  { encoding: 'utf8' }
);

console.log('conf setting intialized');
