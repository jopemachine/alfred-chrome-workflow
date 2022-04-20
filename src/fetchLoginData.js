const alfy = require('alfy');
require('./init.js');
const {parseArgv} = require('./argHandler.js');
const psl = require('psl');
const outdent = require('outdent');
const {
	getLoginDataDB,
	existsAsync,
	extractHostname
} = require('./utils.js');

const conf = alfy.config.get('setting');

(async function () {
	const {options, input} = parseArgv(process.argv);

	const loginDataDB = getLoginDataDB();

	let loginDatas;
	if (options.type === 'userId') {
		loginDatas = loginDataDB
			.prepare(
				outdent`
					SELECT username_element, username_value, origin_url
						FROM logins
						WHERE origin_url LIKE '%${input}%' OR username_element LIKE '%${input}%' OR username_value LIKE '%${input}%'
						ORDER BY date_last_used
					`
			)
			.all();
	} else {
		// Password value seems to be crypted
	}

	loginDatas = loginDatas.filter(item => {
		return item.origin_url && item.username_value && item.username_element;
	});

	let deletedItems;
	const wholeLogLength = loginDatas.length;

	loginDatas = loginDatas.slice(0, conf.cha.result_limit);

	const result = await Promise.all(
		loginDatas.map(async item => {
			const hostname = psl.get(extractHostname(item.origin_url));
			const favCache = `cache/${hostname}.png`;

			const returnValue = {
				title: item.username_value,
				subtitle: `Group: "${item.username_element}", Used by "${hostname}"`,
				arg: item.username_value,
				text: {
					copy: item.username_value,
					largetype: item.username_value
				},
				mods: {
					cmd: {
						subtitle: 'Press Enter to copy this url to clipboard'
					}
				}
			};

			if (hostname && await existsAsync(favCache)) {
				returnValue.icon = {
					path: favCache
				};
			} else {
				returnValue.icon = {
					path: 'assets/info.png'
				};
			}

			return returnValue;
		})
	);

	if (result.length === 0) {
		result.push({
			valid: true,
			title: 'No data were found.',
			autocomplete: 'No data were found.',
			subtitle: '',
			text: {
				copy: 'No data were found.',
				largetype: 'No data were found.'
			}
		});
	} else {
		result.splice(0, 0, {
			valid: true,
			title: `${wholeLogLength} data were found.`,
			subtitle: `${result.length} shows up ${
				deletedItems ? `(${deletedItems} deleted due to duplication)` : ''
			}`
		});
	}

	alfy.output(result);
})();
