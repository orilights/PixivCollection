import path from 'node:path'
import process from 'node:process'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import AutoImport from 'unplugin-auto-import/vite'
import simpleHtmlPlugin from 'vite-plugin-simple-html'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  base: './',
  server: {
    port: 3000,
  },
  build: {
    copyPublicDir: false,
  },
  plugins: [
    vue(),
    AutoImport({
      imports: ['vue', 'vue-router'],
      dts: true,
      vueTemplate: true,
    }),
    Components({
      dts: true,
    }),
    simpleHtmlPlugin({
      inject: {
        data: {
          injectHead: process.env.INJECT_HEAD || '',
        },
      },
    }),
    {
      name: 'html-transform',
      transformIndexHtml(html) {
        const buildDate = new Date().toISOString()
        return html.replace(
          '<body>',
          `<body data-build-date="${buildDate}">`,
        )
      },
    },
  ],
})
