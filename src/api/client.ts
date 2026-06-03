import axios from 'axios';
import {
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  clearTokens,
} from '../utils/tokenStorage';

const client = axios.create({
  baseURL: '',
  headers: { 'Content-Type': 'application/json' },
});

client.interceptors.request.use(config => {
  // 사용자 로그인 토큰 우선, 없으면 admin 토큰으로 폴백
  const token = getAccessToken() ?? localStorage.getItem('adminToken') ?? 'admin-token';
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// accessToken 만료(401) 시 refreshToken으로 1회 재발급 후 원요청 재시도.
// 동시에 여러 요청이 401이 나도 재발급은 한 번만 수행하도록 공유 Promise로 묶는다.
let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error('No refresh token');
  }
  // raw axios 사용 — client 인스턴스를 쓰면 인터셉터가 재귀 호출됨
  const response = await axios.post('/api/auth/reissue', { refreshToken });
  const accessToken = response.data.data.accessToken;
  setAccessToken(accessToken);
  return accessToken;
}

client.interceptors.response.use(
  response => response,
  async error => {
    const original = error.config;
    const status = error.response?.status;
    const isAuthEndpoint = original?.url?.includes('/api/auth/');

    // 사용자 토큰이 있을 때만 재발급 시도 (admin 흐름은 제외)
    if (status === 401 && !original?._retry && !isAuthEndpoint && getRefreshToken()) {
      original._retry = true;
      try {
        if (!refreshPromise) {
          refreshPromise = refreshAccessToken().finally(() => {
            refreshPromise = null;
          });
        }
        const newToken = await refreshPromise;
        original.headers.Authorization = `Bearer ${newToken}`;
        return client(original);
      } catch (refreshError) {
        clearTokens();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default client;
