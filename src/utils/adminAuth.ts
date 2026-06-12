// 어드민 인증 저장. API 호출 토큰은 client.ts가 localStorage 'adminToken'을 읽어 사용한다.
const ADMIN_TOKEN_KEY = 'adminToken';
const ADMIN_INFO_KEY = 'adminInfo';

export interface AdminInfo {
  loginId: string;
  nickname: string;
  role: string;
}

export function saveAdminAuth(token: string, info: AdminInfo) {
  window.localStorage.setItem(ADMIN_TOKEN_KEY, token);
  window.localStorage.setItem(ADMIN_INFO_KEY, JSON.stringify(info));
}

export function getAdminInfo(): AdminInfo | null {
  const raw = window.localStorage.getItem(ADMIN_INFO_KEY);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as AdminInfo;
  } catch {
    return null;
  }
}

export function clearAdminAuth() {
  window.localStorage.removeItem(ADMIN_TOKEN_KEY);
  window.localStorage.removeItem(ADMIN_INFO_KEY);
}
