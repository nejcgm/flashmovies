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
          // The chunk name is part of the URL. The previous `utils-*.js`
          // name is cached as HTML on Cloudflare; the next web deploy has
          // to request a different filename so those browsers refetch.
          axios: ['axios'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    assetsDir: 'assets',
    sourcemap: false,
  },
});
