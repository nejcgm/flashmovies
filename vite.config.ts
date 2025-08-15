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
  // Performance optimizations (better than SSR for this app)
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          utils: ['axios'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  // Alternative to React Snap: Vite SSR Plugin
  // Uncomment and install @vitejs/plugin-react-ssr for better SEO
  // ssr: {
  //   noExternal: ['react-helmet']
  // }
});
