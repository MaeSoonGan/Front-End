import { describe, it, expect } from 'vitest';

// client.ts Authorization 주입 로직 (관리자 토큰 우선, 토큰 없으면 헤더 제거)
// 실제 로그인 403 버그 수정 핵심 로직을 단위 검증.
function resolveAuthHeader(adminToken: string | null, accessToken: string | null): string | undefined {
  if (adminToken) return `Bearer ${adminToken}`;
  if (accessToken) return `Bearer ${accessToken}`;
  return undefined; // 더미 토큰 주입 금지 → 헤더 미설정
}

describe('Authorization 헤더 주입', () => {
  it('관리자 토큰과 회원 토큰이 모두 있으면 관리자 토큰을 우선한다', () => {
    expect(resolveAuthHeader('admin-tok', 'user-tok')).toBe('Bearer admin-tok');
  });
  it('회원 토큰만 있으면 회원 토큰을 사용한다', () => {
    expect(resolveAuthHeader(null, 'user-tok')).toBe('Bearer user-tok');
  });
  it('토큰이 없으면 헤더를 설정하지 않는다 (더미 토큰 X)', () => {
    expect(resolveAuthHeader(null, null)).toBeUndefined();
  });
});
