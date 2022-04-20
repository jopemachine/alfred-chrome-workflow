const alfy = require('alfy');
const path = require('path');
const byteSize = require('byte-size');
const psl = require('psl');
require('./init.js');
const {
	existsAsync,
	getHistoryDB,
	extractHostname,
	convertChromeTimeToUnixTimestamp,
	getLocaleString
} = require('./utils.js');
const userName = require('os').userInfo().username;

const conf = alfy.config.get('setting');

(async function () {
	let downloadInfos = getHistoryDB()
		.prepare(`SELECT * FROM downloads ORDER BY start_time ${conf.chd.sort}`)
		.all();
	const input = alfy.input ? alfy.input.normalize() : null;

	if (input) {
		downloadInfos = downloadInfos.filter(item => {
			const fileFileName = item.current_path.split(path.sep).pop();
			const name = item.current_path.toLowerCase();
			const referrer = item.referrer.toLowerCase();
			const loweredInput = input.normalize().toLowerCase();

			if (fileFileName.trim() === '') {
				return false;
			}

			if (name.includes(loweredInput) || referrer.includes(loweredInput)) {
				return true;
			}

			return false;
		});
	}

	const result = await Promise.all(
		downloadInfos.map(async item => {
			const fileFileName = item.current_path.split(path.sep).pop();
			const hostname = psl.get(extractHostname(item.referrer));
			const downloadStart = convertChromeTimeToUnixTimestamp(item.start_time);
			const fileSize = byteSize(item.total_bytes);
			let subtitle = (await existsAsync(item.current_path)) ? '[O]' : '[X]';
			subtitle += ` Downloaded in ${getLocaleString(
				downloadStart,
				conf.locale
			)}, From '${hostname}'`;

			const returnValue = {
				title: fileFileName,
				subtitle,
				arg: item.current_path,
				quicklookurl: item.current_path,
				mods: {
					shift: {
						subtitle: `File size: ${fileSize.value}${fileSize.unit}`
					}
				}
			};

			if (await existsAsync(`cache/${hostname}.png`)) {
				returnValue.icon = {
					path: `cache/${hostname}.png`
				};
			}

			return returnValue;
		})
	);

	if (result.length === 0) {
		result.push({
			valid: true,
			title: 'No download logs were found.',
			autocomplete: 'No download logs were found.',
			subtitle: '',
			text: {
				copy: 'No download logs were found.',
				largetype: 'No download logs were found.'
			}
		});
	} else {
		result.splice(0, 0, {
			valid: true,
			title: `${result.length} download logs were found.`,
			arg: `/Users/${userName}/Downloads/`
		});
	}

	alfy.output(result);
})();
