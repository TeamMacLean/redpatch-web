// <reference path="./.nuxt/nuxt.d.ts" />

// Extend ImportMeta with Nuxt-specific properties
interface ImportMeta {
  client: boolean
  server: boolean
  dev: boolean
  test: boolean
}
