import { defineConfig, type ProxyOptions } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

// 프록시(서버→백엔드) 요청에서 Origin 헤더 제거 → 백엔드가 non-CORS(동일출처)로 처리.
// 로컬에서 EKS 서비스(포트포워딩)로 붙을 때, EKS의 CORS 허용 origin에 localhost:5173이 없어
// "Invalid CORS request"(403)로 막히는 문제 회피.
const stripOrigin: ProxyOptions['configure'] = (proxy) => {
  proxy.on('proxyReq', (proxyReq) => {
    proxyReq.removeHeader('origin');
  });
};

// /api/* 프록시 공통 옵션 (Origin 제거 포함)
const api = (target: string): ProxyOptions => ({
  target,
  changeOrigin: true,
  configure: stripOrigin,
});

export default defineConfig({
  server: {
    proxy: {
      '/api/auth': api('http://localhost:8081'),
      '/api/members': api('http://localhost:8081'),
      '/api/notices': api('http://localhost:8086'),
      '/api/notifications': api('http://localhost:8086'),
      // 실시간 시세 websocket (market-realtime-service). ws 핸드셰이크 Origin은 유지.
      '/ws/market': {
        target: 'http://localhost:8090',
        ws: true,
        changeOrigin: true,
      },
      // 대회 계좌는 order-service(8084)에 있으므로 contest-service보다 먼저 매칭
      '^/api/contests/[^/]+/account': api('http://localhost:8084'),
      '/api/contests': api('http://localhost:8082'),
      '/api/portfolio': api('http://localhost:8084'),
      '/api/orders': api('http://localhost:8084'),
      '/api/trades': api('http://localhost:8084'),
      // 순위(hts-top-view)·지수(indices)는 market-service(8085, RDS 스냅샷)로
      '/api/market': api('http://localhost:8085'),
      '/api/stocks': api('http://localhost:8085'),
      '/api/watchlist': api('http://localhost:8085'),
      '/api': api('http://localhost:8080'),
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