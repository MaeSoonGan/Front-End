/// <reference types="vitest/config" />
import { defineConfig } from 'vitest/config';

// 단위테스트 전용 설정. dev 서버(vite.config.ts)와 분리.
export default defineConfig({
  test: {
    environment: 'jsdom', // window/localStorage 사용 (토큰 저장 테스트)
    globals: true, // describe/it/expect 전역 사용
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
});
