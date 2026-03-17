import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom', 'react-router-dom'],
          'redux': ['@reduxjs/toolkit', 'react-redux'],
          'ui': ['axios']
        }
      }
    },
    chunkSizeWarningLimit: 1000,
  },
  server: {
    host: true,
    open: '/index.html',
  },
  define: {
    'process.env': {
      VITE_APP_TITLE: 'Patna Basket'
    }
  }
})
