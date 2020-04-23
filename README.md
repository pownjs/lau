[![Follow on Twitter](https://img.shields.io/twitter/follow/pownjs.svg?logo=twitter)](https://twitter.com/pownjs)
[![NPM](https://img.shields.io/npm/v/@pown/lau.svg)](https://www.npmjs.com/package/@pown/lau)
[![Fury](https://img.shields.io/badge/version-2x%20Fury-red.svg)](https://github.com/pownjs/lobby)
[![SecApps](https://img.shields.io/badge/credits-SecApps-black.svg)](https://secapps.com)

# Pown LAU

Pown LAU (List All URLs) is a library and Pownjs tool for enlisting target web application URLs using several public databases.

## Credits

This tool is part of [secapps.com](https://secapps.com) open-source initiative.

```
  ___ ___ ___   _   ___ ___  ___
 / __| __/ __| /_\ | _ \ _ \/ __|
 \__ \ _| (__ / _ \|  _/  _/\__ \
 |___/___\___/_/ \_\_| |_|  |___/
  https://secapps.com
```

### Authors

* [@pdp](https://twitter.com/pdp) - https://pdparchitect.github.io/www/

## Quickstart

This tool is meant to be used as part of [Pown.js](https://github.com/pownjs/pown) but it can be invoked separately as an independent tool.

Install Pown first as usual:

```sh
$ npm install -g pown@latest
```

Invoke directly from Pown:

```sh
$ pown lau
```

### Library Use

Install this module locally from the root of your project:

```sh
$ npm install @pown/lau --save
```

Once done, invoke pown cli:

```sh
$ POWN_ROOT=. ./node_modules/.bin/pown-cli lau
```

You can also use the global pown to invoke the tool locally:

```sh
$ POWN_ROOT=. pown lau
```

## Usage

> **WARNING**: This pown command is currently under development and as a result will be subject to breaking changes.

```
pown lau <domain>

List all URLs

Options:
  --version          Show version number  [boolean]
  --help             Show help  [boolean]
  --header, -H       Custom header  [string]
  --wildcard, -w     Domain wildcard  [string] [default: "*."]
  --retry, -r  [number] [default: 5]
  --timeout, -t  [number] [default: 30000]
  --unique, -u  [boolean] [default: false]
  --summary, -s  [boolean] [default: false]
  --concurrency, -c  [number] [default: Infinity]
```
