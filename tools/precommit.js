const fs = require('fs');

const defaultConfig = {
  'browser': 'Chrome',
  'locale': 'en',
  'chrome_profile': 'Default',
  'exclude_domains': [
  ],
  'chh': {
    'result_limit': 50,
    'delete_duplicate': true,
    'sort': 'last_visit_time DESC'
  },
  'chm': {
    'result_limit': 50,
    'delete_duplicate': true,
    'sort': 'last_updated_time_s'
  },
  'cha': {
    'result_limit': 50,
    'delete_duplicate': true,
    'sort': 'count'
  },
  'chs': {
    'result_limit': 50,
    'delete_duplicate': true
  },
  'chd': {
    'sort': 'DESC'
  },
  'chb': {
    'sort': 'VISIT_FREQ'
  },
};

fs.writeFileSync(
  'conf.json',
  '\ufeff' + JSON.stringify(defaultConfig, null, 2),
  { encoding: 'utf8' }
);

console.log('conf setting intialized');
