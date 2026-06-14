import { describe, it, expect, beforeEach } from 'vitest';
import {
  saveTokens,
  getAccessToken,
  getRefreshToken,
  clearTokens,
  isAuthenticated,
} from '../../utils/tokenStorage';

// UT-FE: 로그인 토큰 저장/판정 (실제 소스 import)
describe('tokenStorage', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  it('로그인 유지(keepLogin=true) 시 localStorage에 영속 저장한다', () => {
    saveTokens('access-1', 'refresh-1', true);
    expect(window.localStorage.getItem('accessToken')).toBe('access-1');
    expect(window.sessionStorage.getItem('accessToken')).toBeNull();
    expect(getAccessToken()).toBe('access-1');
    expect(getRefreshToken()).toBe('refresh-1');
  });

  it('로그인 미유지(keepLogin=false) 시 sessionStorage에 저장한다', () => {
    saveTokens('access-2', 'refresh-2', false);
    expect(window.sessionStorage.getItem('accessToken')).toBe('access-2');
    expect(window.localStorage.getItem('accessToken')).toBeNull();
  });

  it('isAuthenticated은 토큰 유무에 따라 true/false를 반환한다', () => {
    expect(isAuthenticated()).toBe(false);
    saveTokens('access-3', 'refresh-3', true);
    expect(isAuthenticated()).toBe(true);
  });

  it('clearTokens는 두 저장소의 토큰을 모두 제거한다', () => {
    saveTokens('a', 'b', true);
    clearTokens();
    expect(getAccessToken()).toBeNull();
    expect(isAuthenticated()).toBe(false);
  });
});
