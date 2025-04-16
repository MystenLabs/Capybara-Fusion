import { defineConfig } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
    base: './',
    plugins: [
        sveltekit(),
    ],
    logLevel: 'error',
    build: {
        emptyOutDir: true,
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

