import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  server: {
    proxy: {
      '/api/auth': {
        target: 'http://localhost:8081',
        changeOrigin: true,
      },
      '/api/members': {
        target: 'http://localhost:8081',
        changeOrigin: true,
      },
      '/api/notices': {
        target: 'http://localhost:8086',
        changeOrigin: true,
      },
      '/api/notifications': {
        target: 'http://localhost:8086',
        changeOrigin: true,
      },
      '/api/contests': {
        target: 'http://localhost:8082',
        changeOrigin: true,
      },
      '/api/portfolio': {
        target: 'http://localhost:8084',
        changeOrigin: true,
      },
      '/api/market': {
        target: 'http://localhost:8085',
        changeOrigin: true,
      },
      '/api/stocks': {
        target: 'http://localhost:8085',
        changeOrigin: true,
      },
      '/api/watchlist': {
        target: 'http://localhost:8085',
        changeOrigin: true,
      },
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'FISA 모의투자 서비스',
        short_name: 'FISA Invest',
        description: '모의투자 대회 및 클라우드 관제 서비스',
        theme_color: '#0f172a',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
});