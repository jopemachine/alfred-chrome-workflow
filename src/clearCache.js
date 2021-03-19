const fs = require('fs');

fs.rmdirSync('./cache', { recursive: true });
fs.mkdirSync('./cache');