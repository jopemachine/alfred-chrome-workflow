const fs = require('fs');

const defaultConfig = {
  history_path:
    '/Users/<user_name>/Library/Application Support/Google/Chrome/<chrome_profile>/History',
  bookmark_path:
    '/Users/<user_name>/Library/Application Support/Google/Chrome/<chrome_profile>/Bookmarks',
  chrome_profile: 'Default',
  result_limit: 200,
  locale: 'en',
};

fs.writeFileSync(
  'conf.json',
  '\ufeff' + JSON.stringify(defaultConfig, null, 2),
  { encoding: 'utf8' }
);

console.log('conf setting intialized');
