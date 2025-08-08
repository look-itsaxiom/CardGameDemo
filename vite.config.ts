import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/types': path.resolve(__dirname, './src/types'),
      '@/engine': path.resolve(__dirname, './src/engine'),
      '@/data': path.resolve(__dirname, './src/data'),
      '@/game': path.resolve(__dirname, './src/game'),
      '@/components': path.resolve(__dirname, './src/components'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
  },
})