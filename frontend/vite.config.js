import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/CustomRecipeManager/static/',
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000/CustomRecipeManager',
        changeOrigin: true,
        secure: false,
      },
      '/uploads': {
        target: 'http://localhost:8000/CustomRecipeManager',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
