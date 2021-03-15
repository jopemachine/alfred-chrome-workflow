const alfy = require('alfy');
const fs = require('fs');
const open = require('open');

(async function() {
  if (fs.existsSync(alfy.input)) {
    await open(alfy.input, { wait: true });
  } else {
    console.log('error');
  }
}) ();