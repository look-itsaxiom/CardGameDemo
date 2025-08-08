import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
    base: './',
    plugins: [
        react(),
    ],
    resolve: {
        alias: {
            '@types': path.resolve(__dirname, '../src/types/index.ts'),
            '@data': path.resolve(__dirname, '../src/data'),
            '@engine': path.resolve(__dirname, '../src/engine'),
            '@game': path.resolve(__dirname, '../src/game'),
        }
    },
    server: {
        port: 8080
    }
})
