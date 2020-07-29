# redpatch-web

## Depends on
* Node
* MongoDB
* Python
** redpatch

## .env

API_URL: The URL of this site (local address)
BASE_URL: The public URL of your site (without a trailing /)
PYTHON: The path to your python3
BATCH_PROCESS_PATH: The path to redpatch-batch-process

## Build Setup

```bash

# copy env file
cp example.env .env

# install dependencies
$ npm install

# serve with hot reload at localhost:3000
$ npm run dev

# build for production and launch server
$ npm run build
$ npm run start

# generate static project
$ npm run generate
```

For detailed explanation on how things work, check out [Nuxt.js docs](https://nuxtjs.org).
