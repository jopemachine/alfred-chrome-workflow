function parseArgv (argv) {
  let input = '';
  const options = {};
  argv = argv.slice(2, argv.length);

  for (const args of argv) {
    const argArr = args.split(' ');

    for (const arg of argArr) {
      if (/--[a-zA-Z0-9]*=[a-zA-Z0-9]*/g.test(arg)) {
        const key = arg.split('--')[1].split('=')[0];
        const value = arg.split('=')[1];
        options[key] = value;
      } else {
        input += (arg + ' ');
      }
    }
  }

  input = input.normalize();
  input.endsWith(' ') && (input = input.substr(0, input.length - 1));

  return {
    options, input
  };
}

function addVariable (key, value) {
  return `--${key}=${value}`;
}

module.exports = {
  addVariable,
  parseArgv,
};