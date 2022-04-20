function parseArgv(argv) {
	let input = '';
	const options = {};
	argv = argv.slice(2, argv.length);

	for (const args of argv) {
		const argArray = args.split(' ');

		for (const arg of argArray) {
			if (/--[a-zA-Z\d]*=[a-zA-Z\d]*/g.test(arg)) {
				const key = arg.split('--')[1].split('=')[0];
				const value = arg.split('=')[1];
				options[key] = value;
			} else {
				input += (arg + ' ');
			}
		}
	}

	input = input.normalize();
	if (input.endsWith(' ')) {
		input = input.slice(0, Math.max(0, input.length - 1));
	}

	return {
		options, input
	};
}

function addVariable(key, value) {
	return `--${key}=${value}`;
}

module.exports = {
	addVariable,
	parseArgv
};
