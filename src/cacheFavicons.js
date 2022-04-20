const fsPromise = require('fs').promises;
const psl = require('psl');
const outdent = require('outdent');
const {
	existsAsync,
	extractHostname,
	getHistoryDB,
	getFaviconDB
} = require('./utils.js');
const {FAVICON_DB} = require('./constant.js');

(async function () {
	const historyDB = getHistoryDB();
	getFaviconDB();
	historyDB.prepare(`ATTACH DATABASE './${FAVICON_DB}' AS favicons`).run();

	const historys = historyDB
		.prepare(
			outdent`
				SELECT urls.url, favicon_bitmaps.image_data, favicon_bitmaps.last_updated
					FROM urls
						LEFT OUTER JOIN icon_mapping ON icon_mapping.page_url = urls.url,
							favicon_bitmaps ON favicon_bitmaps.id =
								(SELECT id FROM favicon_bitmaps
									WHERE favicon_bitmaps.icon_id = icon_mapping.icon_id
									ORDER BY width DESC LIMIT 1)
					WHERE (urls.title LIKE '%%' OR urls.url LIKE '%%')
				`
		)
		.all();

	await Promise.all(
		historys.map(async item => {
			const hostname = psl.get(extractHostname(item.url));
			const favCache = `cache/${hostname}.png`;
			if (!(await existsAsync(favCache))) {
				await fsPromise.writeFile(`cache/${hostname}.png`, item.image_data);
			}
		})
	);

	// To receive message
	console.log('');
})();
