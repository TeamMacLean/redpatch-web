// require('dotenv').config();

import serveStatic from 'serve-static'
const mongoose = require('mongoose-fill');
try {
  mongoose.connect('mongodb://localhost:27017/redpatch', { useNewUrlParser: true, useUnifiedTopology: true });
} catch (err) {
  throw err;
}

export default {
  /*
  ** Nuxt rendering mode
  ** See https://nuxtjs.org/api/configuration-mode
  */
  mode: 'spa',
  /*
  ** Nuxt target
  ** See https://nuxtjs.org/api/configuration-target
  */
  target: 'server',
  /*
  ** Headers of the page
  ** See https://nuxtjs.org/api/configuration-head
  */
  head: {
    title: 'REDPATCH',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: process.env.npm_package_description || '' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },
  /*
  ** Global CSS
  */
  css: ["@/assets/styles.scss"],
  /*
  ** Plugins to load before mounting the App
  ** https://nuxtjs.org/guide/plugins
  */
  plugins: [
  ],
  serverMiddleware: {
    '/uploads': serveStatic(__dirname + '/uploads'),
    '/api/upload': '~/api/upload.js',
    '/api/status': '~/api/status.js',
    '/api/setselected': '~/api/setSelected.js',
    '/api/updatehsv': '~/api/updateHsv.js',
    '/api/previews': '~/api/getPreviews.js',
    '/api/postUploadStuff': '~/api/postUploadStuff.js',
    '/api/ensurepreloading': '~/api/ensurePreLoading.js',
  },
  /*
  ** Auto import components
  ** See https://nuxtjs.org/api/configuration-components
  */
  components: true,
  /*
  ** Nuxt.js dev-modules
  */
  buildModules: [
  ],
  /*
  ** Nuxt.js modules
  */
  modules: [
    // Doc: https://buefy.github.io/#/documentation
    'nuxt-buefy',
    '@nuxtjs/pwa',
    '@nuxtjs/axios',
    '@nuxtjs/dotenv'
  ],
  axios: {
    // proxyHeaders: false,
    baseURL: process.env.API_URL
  },
  /*
  ** Build configuration
  ** See https://nuxtjs.org/api/configuration-build/
  */
  build: {
  }
}
