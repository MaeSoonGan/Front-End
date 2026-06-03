const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

// keepLogin 여부에 따라 저장소가 갈린다.
// - localStorage: 브라우저를 닫아도 유지 (로그인 유지 체크)
// - sessionStorage: 탭/브라우저를 닫으면 사라짐 (체크 안 함)
// 토큰을 읽을 때는 두 저장소를 모두 확인한다.

export function saveTokens(accessToken: string, refreshToken: string, keepLogin: boolean) {
  clearTokens();
  const store = keepLogin ? window.localStorage : window.sessionStorage;
  store.setItem(ACCESS_TOKEN_KEY, accessToken);
  if (refreshToken) {
    store.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
}

export function getAccessToken(): string | null {
  return (
    window.localStorage.getItem(ACCESS_TOKEN_KEY) ??
    window.sessionStorage.getItem(ACCESS_TOKEN_KEY)
  );
}

export function getRefreshToken(): string | null {
  return (
    window.localStorage.getItem(REFRESH_TOKEN_KEY) ??
    window.sessionStorage.getItem(REFRESH_TOKEN_KEY)
  );
}

export function setAccessToken(accessToken: string) {
  // 기존 토큰이 있던 저장소에 그대로 갱신한다.
  if (window.localStorage.getItem(ACCESS_TOKEN_KEY) !== null) {
    window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  } else {
    window.sessionStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  }
}

export function clearTokens() {
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  window.sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  window.sessionStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function isAuthenticated(): boolean {
  return getAccessToken() !== null;
}
