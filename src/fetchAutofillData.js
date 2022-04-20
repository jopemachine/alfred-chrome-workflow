const alfy = require('alfy');
require('./init.js');
const {
	getWebDataDB,
	getLocaleString
} = require('./utils.js');
const _ = require('lodash');
const outdent = require('outdent');
const conf = alfy.config.get('setting');

(async function () {
	const input = alfy.input ? alfy.input.normalize() : '';

	const webDataDB = getWebDataDB();
	let autofillDatas = webDataDB
		.prepare(
			outdent`
				SELECT value, name, date_created, count
					FROM autofill
					WHERE value LIKE '%${input}%' OR name LIKE '%${input}%'
					ORDER BY ${conf.cha.sort} DESC
				`
		)
		.all();

	let deletedItems;
	const wholeLogLength = autofillDatas.length;

	autofillDatas = _.uniqBy(autofillDatas, 'value');
	autofillDatas = autofillDatas.slice(0, conf.cha.result_limit);

	const result = await Promise.all(
		autofillDatas.map(async item => {
			const createdDate = getLocaleString((item.date_created * 1000), conf.locale);
			return {
				title: item.value,
				subtitle: `Group: "${item.name}", Created Date: ${createdDate}`,
				arg: item.value,
				icon: {
					path: 'assets/info.png'
				},
				text: {
					copy: item.value,
					largetype: item.value
				},
				mods: {
					cmd: {
						subtitle: 'Press Enter to copy this url to clipboard'
					}
				}
			};
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
