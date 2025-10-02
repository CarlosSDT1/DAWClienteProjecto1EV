// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    port: 8070,
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "bootstrap/scss/bootstrap";`
      }
    }
  }
})