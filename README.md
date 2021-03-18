<h1 align="center">
  <a href="https://www.npmjs.com/package/alfred-chrome-workflow">
		Alfred-chrome-workflow<br>
	<img src="https://img.shields.io/badge/Alfred-4-blueviolet">
	<img src="https://img.shields.io/npm/dt/alfred-chrome-workflow" alt="NPM Release">
	<img src="https://img.shields.io/github/license/jopemachine/alfred-chrome-workflow.svg" alt="License">
  </a>
</h1>

Alfred workflow to search Chrome's queries, bookmarks, history and download logs

![](./imgs/demo.gif)

##  🔨 How to install

1. **Install package by npm**

```
$ npm install --global alfred-chrome-workflow
```

If you have problem with installation with above command,

Please refer [these installaion issues](https://github.com/jopemachine/alfred-chrome-workflow/issues?q=is%3Aissue+is%3Aclosed+).

2. **Check your `chrome_profile` on `/Users/<username>/Library/Application Support/Google/Chrome/<chrome_profile>/`. default value is set by `Default`.**

If chrome_profile is not proper, you will encounter below error.

![](./imgs/profile_name_error.png)

3. **If your `chrome_profile` is not default, change `chrome_profile` of `conf.json` to your profile name.**

4. **(Optional, Recommended) You can cache favicon images in advance by executing `ch > cache`**

By proceeding with the above process, you can assign favicon to the items of `chb` and increase search speed.

## 📋 Features

* *Search Chrome's Visit History `(chh)`*

* *Search Chrome's Bookmark sorted by visit counts `(chb, chf)`*

* *Search Chrome's Download logs `(chd)`*

* *Search Chrome's Search query history `(chs)`*

* *You can change your search config details `(ch > conf)`*

## 📌 Prerequisite

The prerequisites below are required to use that package.

* Node JS

* [Chrome](https://www.google.com/intl/en/chrome/)

* [Alfred powerpack](https://www.alfredapp.com/powerpack/)


## 📗 How to use

### chb { Argument }

Argument: {`Term to search`}

Search chrome bookmark

(Could be sorted by `visit counts`, `alphabet`)

### chf { Argument }

Argument: {`Term to search`}

Search chrome bookmark folders

### chh { Argument }

Argument: {`Term to search`}

Search chrome visit history

You can append `#` to search word to search `urls` only.

Example:

`chh #youtube [some_word_to_search]`

### chd { Argument }

Argument: {`Term to search`}

Search chrome download history

### chs { Argument }

Argument: {`Term to search`}

Search your query based on visit history

### ch > conf

Open config file (`conf.json`)

### ch > cache

Cache favicon images from your visit history in advance

## 🔖 Search Options

### common

* **chrome_profile**

Type: `string`

Your chrome profile name.

* **locale**

Type: `string (enum)`

Determines whether to display some string values in Korean or English.

Possible values: `ko-KR` or `en`

### chh

* **result_limit**

Type: `number`

Displays as many search results in `chh` search as `result_limit`.

* **history_sort**

Type: `string`

Determine what to sort the search results in `chh`.

Recommended Value:

`last_visit_time DESC` Or `visit_count DESC, typed_count DESC, last_visit_time DESC`

* **delete_duplicate**

Type: `boolean`

Removes items with duplicate title names.

### chd

* **sort**

Type: `string (enum)`

Sort by `DESC` or `ASC`

### chb

* **sort**

Type: `string (enum)`

Sort by `VISIT_FREQ` or `ALPHABET`

### chs

* **result_limit**

Type: `number`

Displays as many search results in `chh` search as `result_limit`.

* **delete_duplicate**

Type: `boolean`

Removes items with duplicate title names.

## License

MIT © [jopemachine](https://github.com/jopemachine/alfred-chrome-workflow)