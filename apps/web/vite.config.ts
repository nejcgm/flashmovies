import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteImagemin from 'vite-plugin-imagemin';

export default defineConfig({
  plugins: [
    react(),
    viteImagemin({
      gifsicle: { optimizationLevel: 3, interlaced: true },
      optipng: { optimizationLevel: 5 },
      mozjpeg: { quality: 75, progressive: true },
      pngquant: { quality: [0.6, 0.8], speed: 3 },
      svgo: {
        plugins: [
          { name: 'removeViewBox', active: false },
          { name: 'removeDimensions', active: true },
          { name: 'convertShapeToPath', active: true },
        ],
      },
      webp: { quality: 75 },
    }),
  ],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          router: ['react-router-dom'],
          // Renamed from `utils` so browsers stop requesting
          // /assets/utils-BCn5QfZZ.js. That URL's CORS cache entry is
          // index.html, stored as immutable JavaScript since 2 Sep 2026,
          // which prevents the SPA (and therefore GA) from booting.
          axios: ['axios'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    assetsDir: 'assets',
    sourcemap: false,
  },
});
