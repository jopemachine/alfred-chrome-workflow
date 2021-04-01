const alfy = require('alfy');
const fs = require('fs');

(async function () {
  const path = alfy.config.path;
  if (!fs.existsSync(path)) {
    require('./init.js');
  }

  alfy.output([{ 
    title: 'Open config file',
    arg: path 
  }]);
} ());