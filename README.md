<h1 align="center">
  <a href="https://www.npmjs.com/package/alfred-chrome-workflow">
		Alfred-chrome-workflow<br>
	  <img src="https://img.shields.io/npm/dt/alfred-chrome-workflow" alt="NPM Release">
	  <img src="https://img.shields.io/github/license/jopemachine/alfred-chrome-workflow.svg" alt="License">
  </a>
</h1>

Search Chrome's bookmarks, download logs, and visit historys in Alfred 4

![](./imgs/demo.gif)

##  🔨 How to install

1. **Install package by npm**

```
$ npm install --global alfred-chrome-workflow
```

2. **Check your `chrome_profile` on `/Users/<username>/Library/Application Support/Google/Chrome/<chrome_profile>/`. default value is set by `Default`.**

If chrome_profile is not proper, you will encounter below error.

![](./imgs/profile_name_error.png)

3. **If your `chrome_profile` is not default, change `chrome_profile` of `conf.json` to your profile name.**

## 📋 Features

* *Search Chrome's Visit History*

* *Search Chrome's Bookmark sorted by visit counts*

* *Search Chrome's Download logs*

* *You can change your search config details*

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

### chh { Argument }

Argument: {`Term to search`}

Search chrome visit history

You can append `#` to search word to search `urls` only.

Example:

`chh #youtube [some_word_to_search]`

### chd { Argument }

Argument: {`Term to search`}

Search chrome download history

### ch > conf

Open config file (`conf.json`)

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
