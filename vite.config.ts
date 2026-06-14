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

const DEPLOYED_API_TARGET = 'https://www.maesoongan.xyz';
const DEPLOYED_WS_TARGET = 'wss://www.maesoongan.xyz';

// /api/* 프록시 공통 옵션 (Origin 제거 포함)
const api = (target: string): ProxyOptions => ({
  target,
  changeOrigin: true,
  secure: true,
  configure: stripOrigin,
});

export default defineConfig({
  server: {
    proxy: {
      '/api/auth': api(DEPLOYED_API_TARGET),
      '/api/admin': api(DEPLOYED_API_TARGET),
      '/api/members': api(DEPLOYED_API_TARGET),
      '/api/notices': api(DEPLOYED_API_TARGET),
      '/api/notifications': api(DEPLOYED_API_TARGET),
      // 실시간 시세 websocket (market-realtime-service). ws 핸드셰이크 Origin은 유지.
      '/ws/market': {
        target: DEPLOYED_WS_TARGET,
        ws: true,
        changeOrigin: true,
      },
      // 대회 계좌는 order-service(8084)에 있으므로 contest-service보다 먼저 매칭
      '^/api/contests/[^/]+/account': api(DEPLOYED_API_TARGET),
      '/api/contests': api(DEPLOYED_API_TARGET),
      '/api/portfolio': api(DEPLOYED_API_TARGET),
      '/api/orders': api(DEPLOYED_API_TARGET),
      '/api/trades': api(DEPLOYED_API_TARGET),
      // 순위(hts-top-view)·지수(indices)는 market-service(8085, RDS 스냅샷)로
      '/api/market': api(DEPLOYED_API_TARGET),
      '/api/stocks': api(DEPLOYED_API_TARGET),
      '/api/watchlist': api(DEPLOYED_API_TARGET),
      '/api': api(DEPLOYED_API_TARGET),
    },
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: '매순간',
        short_name: '매순간',
        description: '매순간 모의투자 서비스',
        theme_color: '#1565C0',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        icons: [
          {
            // TODO: 실제 브랜드 아이콘 확정 후 public/icons 파일을 교체합니다.
            src: '/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/icons/maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/api/'),
            handler: 'NetworkOnly',
            method: 'GET',
          },
        ],
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
});
