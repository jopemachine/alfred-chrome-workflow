const fs = require('fs');

const defaultConfig = {
  'locale': 'en',
  'chrome_profile': 'Default',
  'chh': {
    'result_limit': 50,
    'delete_duplicate': true,
    'history_sort': 'last_visit_time DESC'
  },
  'chd': {
    'sort': 'DESC'
  },
  'chb': {
    'sort': 'VISIT_FREQ'
  },
  'chs': {
    'result_limit': 50,
    'delete_duplicate': true
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
  }
};

fs.writeFileSync(
  'conf.json',
  '\ufeff' + JSON.stringify(defaultConfig, null, 2),
  { encoding: 'utf8' }
);

console.log('conf setting intialized');
