import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        name: 'SchoolHub',
        short_name: 'SchoolHub',
        description: 'AI-driven adaptive study scheduling for Singapore families',
        theme_color: '#2563EB',
        background_color: '#EAF3FA',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Cache-first for assigned bites (Scholar Pro — gated at runtime)
        runtimeCaching: [
          {
            urlPattern: /\/api\/bites\//,
            handler: 'CacheFirst',
            options: { cacheName: 'bites-cache', expiration: { maxAgeSeconds: 86400 } },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@schoolhub/types': path.resolve(__dirname, '../../packages/types/src/index.ts'),
      '@schoolhub/ui': path.resolve(__dirname, '../../packages/ui/src/index.ts'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://localhost:3001', changeOrigin: true },
      '/realtime': { target: 'ws://localhost:3001', ws: true },
    },
  },
});
