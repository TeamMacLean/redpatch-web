// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },

  // SPA mode (equivalent to old mode: 'spa')
  ssr: false,

  // Runtime config (replaces @nuxtjs/dotenv)
  runtimeConfig: {
    // Server-only config
    python: process.env.PYTHON || 'python3',
    batchProcessPath: process.env.BATCH_PROCESS_PATH || 'redpatch-batch-process',
    mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/redpatch',

    // Public config (exposed to client)
    public: {
      apiBase: process.env.API_URL || 'http://127.0.0.1:3000',
      baseUrl: process.env.BASE_URL || 'http://127.0.0.1:3000'
    }
  },

  // Server configuration
  devServer: {
    port: Number.parseInt(process.env.PORT || '3000'),
    host: process.env.HOST || '0.0.0.0'
  },

  // Modules
  modules: ['@vite-pwa/nuxt'],

  // PWA configuration
  pwa: {
    manifest: {
      name: 'REDPATCH',
      short_name: 'Redpatch',
      description: 'Finding Disease Lesions in Plant Leaves'
    }
  },

  // Global CSS
  css: ['~/assets/styles.scss'],

  // App configuration
  app: {
    head: {
      title: 'REDPATCH',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content: 'Finding Disease Lesions in Plant Leaves'
        }
      ],
      link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }]
    }
  },

  // Nitro server configuration
  nitro: {
    // Serve uploaded files
    publicAssets: [
      {
        dir: 'uploads',
        baseURL: '/uploads',
        maxAge: 0
      }
    ]
  },

  // Auto-import components
  components: true
})
