const userName = require('os').userInfo().username;
require('./init.js');
const sqliteOptions = {readonly: true, fileMustExist: true};
const sqlite = require('better-sqlite3');
const _ = require('lodash');
const path = require('path');
const fs = require('fs-extra');
const alfy = require('alfy');
const pathExists = require('path-exists');

const {
	HISTORY_DB,
	FAVICON_DB,
	MEDIA_HISTORY_DB,
	WEB_DATA_DB,
	LOGIN_DATA_DB
} = require('./constant.js');

const conf = alfy.config.get('setting');

const filterExcludeDomain = datas => {
	return datas.filter(item => {
		return !conf.exclude_domains.includes(item.hostname);
	});
};

const getExecPath = () => {
	return (__dirname.split(path.sep).slice(0, -1)).join(path.sep);
};

const bookmarkDFS = (item, options) => {
	options = {targets: ['url'], depth: 99, ...options};

	if (options.depth <= -1) {
		return [];
	}

	if (item.type === 'url') {
		if (!options.targets || options.targets.includes('url')) {
			return [item];
		}

		return [];
	}

	// 'folder' or 'root'
	const target = item.type === 'folder' ? item.children : item;
	const initialArray = options.targets.includes('folder') ? [item] : [];

	return _.reduce(target, (result, child) => {
		return [
			...result,
			..._.flatten(bookmarkDFS(child, {targets: options.targets, depth: options.depth - 1}))
		];
	}, initialArray);
};

const handleInput = string => {
	let query = '';
	let domain = '';
	let artist = '';
	let isDomainSearch = false;
	let isArtistSearch = false;

	if (string.includes('#') || string.includes('@')) {
		const words = string.split(' ');
		for (const word of words) {
			if (word.startsWith('#')) {
				isDomainSearch = true;
				domain = word.substr(1, word.length - 1);
			} else if (word.startsWith('@')) {
				isArtistSearch = true;
				artist = word.substr(1, word.length - 1);
			} else {
				query += (query === '' ? word : ' ' + word);
			}
		}
	} else {
		query = string;
	}

	return {
		query,
		domain,
		artist,
		isArtistSearch,
		isDomainSearch
	};
};

const getDBFilePathWithConf = DBFile => {
	return getDBFilePath(conf.chrome_profile, DBFile);
};

const getDBFilePath = (chromeProfilePath, DBFile) => {
	let browserDir = conf.browser_dir;
	if (typeof browserDir === 'string' && browserDir.trim()) {
		browserDir = browserDir.trim().replace(/\/$/, '');
		return `${browserDir}/${chromeProfilePath}/${DBFile}`;
	}

	switch (conf.browser) {
		case 'Chrome Canary':
			return `/Users/${userName}/Library/Application Support/Google/Chrome Canary/${chromeProfilePath}/${DBFile}`;
		case 'Edge':
			return `/Users/${userName}/Library/Application Support/Microsoft Edge/${chromeProfilePath}/${DBFile}`;
		case 'Chromium':
			// 'Chrome Cloud Enrollment' could be wrong (not sure)
			return `/Users/${userName}/Library/Application Support/Google/Chrome Cloud Enrollment/${chromeProfilePath}/${DBFile}`;
		default:
			return `/Users/${userName}/Library/Application Support/Google/Chrome/${chromeProfilePath}/${DBFile}`;
	}
};

const recommendRetry = (tryFunction) => {
	return (...args) => {
		try {
			return tryFunction(...args);
		} catch (error) {
			if (error.code === 'ENOENT') {
				if (tryFindUserProfile()) {
					alfy.output([{
						title: 'Profile found correctly!',
						subtitle: 'Please execute the command again.'
					}]);
				} else {
					alfy.error('Profile not found error');
				}
				process.exit(0);
			}

			alfy.error(error);
			process.exit(1);
		}
	}
};

async function getChromeBookmark() {
	const bookmarksPath = getDBFilePathWithConf('Bookmarks');

	const {roots} = JSON.parse(
		await fs.readFile(bookmarksPath, {
			encoding: 'utf8'
		})
	);

	return roots;
}

function getHistoryDB() {
	const targetPath = getDBFilePathWithConf('History');
	fs.copyFileSync(targetPath, HISTORY_DB);
	return sqlite(HISTORY_DB, sqliteOptions);
}

function getFaviconDB() {
	const targetPath = getDBFilePathWithConf('Favicons');
	fs.copyFileSync(targetPath, FAVICON_DB);
	return sqlite(FAVICON_DB, sqliteOptions);
}

function getMediaHistoryDB() {
	const targetPath = getDBFilePathWithConf('Media History');
	fs.copyFileSync(targetPath, MEDIA_HISTORY_DB);
	return sqlite(MEDIA_HISTORY_DB, sqliteOptions);
}

function getWebDataDB() {
	const targetPath = getDBFilePathWithConf('Web Data');
	fs.copyFileSync(targetPath, WEB_DATA_DB);
	return sqlite(WEB_DATA_DB, sqliteOptions);
}

function getLoginDataDB() {
	const targetPath = getDBFilePathWithConf('Login Data');
	fs.copyFileSync(targetPath, LOGIN_DATA_DB);
	return sqlite(LOGIN_DATA_DB, sqliteOptions);
}

function replaceAll(string, search, replace) {
	return string.split(search).join(replace);
}

function convertChromeTimeToUnixTimestamp(time) {
	return (Math.floor((time / 1000000) - 11644473600)) * 1000;
}

function existsAsync(path) {
	return pathExists(path);
}

function extractHostname(url) {
	let hostname;
	// Find & remove protocol (http, ftp, etc.) and get hostname

	hostname = url.includes('//') ? url.split('/')[2] : url.split('/')[0];

	// Find & remove port number
	hostname = hostname.split(':')[0];
	// Find & remove "?"
	hostname = hostname.split('?')[0];

	return hostname;
}

const decideTargetHistory = (historys, resultLimit) => {
	let idx = 0;
	let deleted = 0;
	let previousTitle;
	const targetHistory = [];

	for (const historyItem of historys) {
		if (idx >= resultLimit) {
			break;
		}

		if (historyItem.title === previousTitle) {
			++deleted;
			continue;
		}

		previousTitle = historyItem.title;
		++idx;
		targetHistory.push(historyItem);
	}

	return {
		targetHistory,
		deleted
	};
};

const getLocaleString = (datetime, locale) => {
	const dateObject = new Date(datetime);

	const year = dateObject.getFullYear();
	const month = dateObject.getMonth() + 1;
	const day = dateObject.getDate();

	const hour =
		// AM 12
		dateObject.getHours() === 0 ?
			12 : // PM 12
			(dateObject.getHours() === 12 ?
				12 : // Other times
				dateObject.getHours() % 12);

	const minute =
		dateObject.getMinutes() < 10 ?
			`0${dateObject.getMinutes()}` :
			dateObject.getMinutes();
	const seconds =
		dateObject.getSeconds() < 10 ?
			`0${dateObject.getSeconds()}` :
			dateObject.getSeconds();

	switch (locale) {
		case 'ko': {
			const koDayOfTheWeek = [
				'일요일',
				'월요일',
				'화요일',
				'수요일',
				'목요일',
				'금요일',
				'토요일'
			];
			const isPM = dateObject.getHours() >= 12 ? '오후' : '오전';
			const dayOfTheWeek = koDayOfTheWeek[dateObject.getDay() % 7];
			return `${year}년 ${month}월 ${day}일 ${dayOfTheWeek} ${isPM} ${hour}:${minute}:${seconds}`;
		}

		default: {
			const enDayOfTheWeek = [
				'Sunday',
				'Monday',
				'Tuesday',
				'Wednesday',
				'Thursday',
				'Friday',
				'Saturday'
			];
			const enMonthString = [
				'December',
				'January',
				'Feburary',
				'March',
				'April',
				'May',
				'June',
				'July',
				'August',
				'September',
				'October',
				'November'
			];

			const isPM = dateObject.getHours() >= 12 ? 'PM' : 'AM';
			const dayOfTheWeek = enDayOfTheWeek[dateObject.getDay() % 7];
			const monthString = enMonthString[month % 12];
			return `${dayOfTheWeek}, ${monthString} ${day}, ${year} ${hour}:${minute}:${seconds} ${isPM}`;
		}
	}
};

const tryFindUserProfile = () => {
	const maxTryCount = 100;

	let assumeProfileDirIdx = 0;

	const profilePath = path.dirname(getDBFilePath(''));

	while (++assumeProfileDirIdx < maxTryCount) {
		const assumeProfileDirName = `Profile ${assumeProfileDirIdx}`;

		const profileExist = fs.pathExistsSync(path.resolve(profilePath, assumeProfileDirName));

		if (profileExist) {
			const newSetting = {...alfy.config.get('setting'), chrome_profile: assumeProfileDirName};
			alfy.config.set('setting', newSetting);
			return true;
		}
	}
	return false;
};

module.exports = {
	filterExcludeDomain,
	getExecPath,
	bookmarkDFS,
	handleInput,
	existsAsync,
	convertChromeTimeToUnixTimestamp,
	extractHostname,
	decideTargetHistory,
	getLocaleString,
	replaceAll,
	tryFindUserProfile,
	getChromeBookmark: recommendRetry(getChromeBookmark),
	getLoginDataDB: recommendRetry(getLoginDataDB),
	getWebDataDB: recommendRetry(getWebDataDB),
	getHistoryDB: recommendRetry(getHistoryDB),
	getFaviconDB: recommendRetry(getFaviconDB),
	getMediaHistoryDB: recommendRetry(getMediaHistoryDB)
};
