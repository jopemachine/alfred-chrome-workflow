const alfy = require('alfy');

(async function () {
  const path = alfy.config.path;
  alfy.output([{ 
    title: 'Open config file',
    arg: path 
  }]);
} ());