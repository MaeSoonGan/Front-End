import { describe, it, expect, beforeEach } from 'vitest';
import { saveAdminAuth, getAdminInfo, clearAdminAuth } from '../../utils/adminAuth';

// UT-FE: 관리자 인증 정보 저장/조회/삭제 (실제 소스 import)
describe('adminAuth', () => {
  beforeEach(() => window.localStorage.clear());

  it('관리자 토큰·정보를 저장하고 loginId·role을 복원한다', () => {
    saveAdminAuth('admin-token', { loginId: 'admin', nickname: '관리자', role: 'ADMIN' });
    expect(window.localStorage.getItem('adminToken')).toBe('admin-token');
    const info = getAdminInfo();
    expect(info).not.toBeNull();
    expect(info?.loginId).toBe('admin');
    expect(info?.role).toBe('ADMIN');
  });

  it('정보가 없으면 null을 반환한다', () => {
    expect(getAdminInfo()).toBeNull();
  });

  it('clearAdminAuth는 토큰·정보를 제거한다', () => {
    saveAdminAuth('t', { loginId: 'a', nickname: 'b', role: 'ADMIN' });
    clearAdminAuth();
    expect(window.localStorage.getItem('adminToken')).toBeNull();
    expect(getAdminInfo()).toBeNull();
  });
});
