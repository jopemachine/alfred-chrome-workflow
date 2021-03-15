const alfy = require('alfy');
const fs = require('fs');

if (fs.existsSync(alfy.input)) {
  fs.unlinkSync(alfy.input);
  console.log('');
} else {
  console.log('error');
}