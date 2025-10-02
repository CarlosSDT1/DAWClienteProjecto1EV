// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    port: 3000,
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "bootstrap/scss/bootstrap";`
      }
    }
  }
})