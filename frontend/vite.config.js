import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/static/frontend/',
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:8000',
    }
  },
  build: {
    outDir: '../staticfiles/frontend',
  }
})
