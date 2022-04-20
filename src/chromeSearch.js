const _ = require('lodash');
const alfy = require('alfy');
const psl = require('psl');
require('./init.js');

const conf = alfy.config.get('setting');

const {
	handleInput,
	decideTargetHistory,
	existsAsync,
	extractHostname,
	getHistoryDB,
	filterExcludeDomain,
	getLocaleString,
	convertChromeTimeToUnixTimestamp
} = require('./utils.js');

(async function () {
	let input = alfy.input ? alfy.input.normalize() : '';
	input = handleInput(input);
	const {isDomainSearch} = input;
	const domainQuery = isDomainSearch ? input.domain : input.query;
	const titleQuery = input.query;

	const historyDB = getHistoryDB();
	const historys = historyDB
		.prepare(
			`
      SELECT urls.url, urls.last_visit_time, keyword_search_terms.term
          FROM keyword_search_terms
          JOIN urls ON urls.id = keyword_search_terms.url_id
          ${isDomainSearch ? `WHERE urls.url LIKE '%${domainQuery}%' AND keyword_search_terms.term LIKE '%${titleQuery}%'` :
		`WHERE keyword_search_terms.term LIKE '%${titleQuery}%'`}
          ORDER BY last_visit_time DESC
      `
		)
		.all();
	const wholeLogLength = historys.length;

	let result = await Promise.all(
		_.map(historys, async item => {
			const queryWord = item.term;
			const hostname = psl.get(extractHostname(item.url));
			const unixTimestamp = convertChromeTimeToUnixTimestamp(
				item.last_visit_time
			);

			const returnValue = {
				hostname,
				title: queryWord,
				subtitle: `From '${hostname}', In '${getLocaleString(unixTimestamp, conf.locale)}'`,
				quicklookurl: item.url,
				mods: {
					cmd: {
						subtitle: 'Press Enter to copy this url to clipboard'
					}
				},
				text: {
					copy: item.url,
					largetype: item.url
				},
				variables: {
					type: 'url',
					url: item.url
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

	let deletedItems;
	if (conf.chh.delete_duplicate) {
		const {targetHistory, deleted} = decideTargetHistory(result, conf.chs.result_limit);
		result = targetHistory;
		deletedItems = deleted;
	} else {
		result = historys.slice(0, conf.chs.result_limit);
	}

	result = filterExcludeDomain(result);

	result.splice(0, 0, {
		valid: true,
		title: `${wholeLogLength} logs were found.`,
		subtitle: `${result.length} shows up ${
			deletedItems ? `(${deletedItems} deleted due to duplication)` : ''
		}`,
		variables: {
			type: 'query',
			query: titleQuery
		},
		mods: {
			cmd: {
				subtitle: `Press Enter to copy this https://www.google.com/search?q=${input} to clipboard`
			},
			ctrl: {
				subtitle: `Press Enter to search "${titleQuery}" on Google`
			}
		}
	});

	alfy.output(result);
})();
