const userName = require('os').userInfo().username;
const conf = require('../conf.json');
const sqliteOptions = { readonly: true, fileMustExist: true };
const fs = require('fs');
const { HISTORY_DB, FAVICON_DB } = require('./constant');

function getHistoryDB () {
  const targetPath = `/Users/${userName}/Library/Application Support/Google/Chrome/${conf['chrome_profile']}/History`;
  fs.copyFileSync(targetPath, HISTORY_DB);
  return require('better-sqlite3')(HISTORY_DB, sqliteOptions);
}

function getFaviconDB () {
  const targetPath = `/Users/${userName}/Library/Application Support/Google/Chrome/${conf['chrome_profile']}/Favicon`;
  fs.copyFileSync(targetPath, FAVICON_DB);
  return require('better-sqlite3')(FAVICON_DB, sqliteOptions);
}

function replaceAll (string, search, replace) {
  return string.split(search).join(replace);
}

const getLocaleString = (datetime, locale) => {
  const dateObj = new Date(datetime);

  const year = dateObj.getFullYear();
  const month = dateObj.getMonth() + 1;
  const day = dateObj.getDate();

  const hour =
    // AM 12
    // eslint-disable-next-line multiline-ternary
    dateObj.getHours() === 0
      ? 12
      : // PM 12
      // eslint-disable-next-line multiline-ternary
      dateObj.getHours() === 12
        ? 12
        : // Other times
        dateObj.getHours() % 12;

  const minute =
    dateObj.getMinutes() < 10
      ? `0${dateObj.getMinutes()}`
      : dateObj.getMinutes();
  const seconds =
    dateObj.getSeconds() < 10
      ? `0${dateObj.getSeconds()}`
      : dateObj.getSeconds();

  switch (locale) {
  case 'ko-KR': {
    const koDayOfTheWeek = [
      '일요일',
      '월요일',
      '화요일',
      '수요일',
      '목요일',
      '금요일',
      '토요일',
    ];
    const isPM = dateObj.getHours() >= 12 ? '오후' : '오전';
    const dayOfTheWeek = koDayOfTheWeek[dateObj.getDay() % 7];
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
      'Saturday',
    ];
    const enMonthStr = [
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
      'November',
    ];

    const isPM = dateObj.getHours() >= 12 ? 'PM' : 'AM';
    const dayOfTheWeek = enDayOfTheWeek[dateObj.getDay() % 7];
    const monthStr = enMonthStr[month % 12];
    return `${dayOfTheWeek}, ${monthStr} ${day}, ${year} ${hour}:${minute}:${seconds} ${isPM}`;
  }
  }
};

module.exports = {
  getHistoryDB,
  getFaviconDB,
  getLocaleString,
  replaceAll,
};
