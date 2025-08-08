import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

const phasermsg = () => {
    return {
        name: 'phasermsg',
        buildStart() {
            process.stdout.write(`Building for production...\n`);
        },
        buildEnd() {
            const line = "---------------------------------------------------------";
            const msg = `❤️❤️❤️ Tell us about your game! - games@phaser.io ❤️❤️❤️`;
            process.stdout.write(`${line}\n${msg}\n${line}\n`);

            process.stdout.write(`✨ Done ✨\n`);
        }
    }
}

export default defineConfig({
    base: '/CardGameDemo/',
    plugins: [
        react(),
        phasermsg()
    ],
    resolve: {
        alias: {
            '@types': path.resolve(__dirname, '../src/types/index.ts'),
            '@data': path.resolve(__dirname, '../src/data'),
            '@engine': path.resolve(__dirname, '../src/engine'),
            '@game': path.resolve(__dirname, '../src/game'),
        }
    },
    logLevel: 'warning',
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    phaser: ['phaser']
                }
            }
        },
        minify: 'terser',
        terserOptions: {
            compress: {
                passes: 2
            },
            mangle: true,
            format: {
                comments: false
            }
        }
    }
});
