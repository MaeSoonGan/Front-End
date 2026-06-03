import axios from 'axios';
import client from './client';

export function parseApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || '오류가 발생했습니다. 잠시 후 다시 시도해주세요';
  }
  return '오류가 발생했습니다. 잠시 후 다시 시도해주세요';
}

export const authApi = {
  login: (data: { userId: string; password: string; keepLogin?: boolean }) =>
    client.post('/api/auth/login', data).then(r => r.data.data),

  reissue: (data: { refreshToken: string }) =>
    client.post('/api/auth/reissue', data).then(r => r.data.data),

  sendCode: (data: { email: string; purpose: 'signup' | 'find-id' | 'reset-password' }) =>
    client.post('/api/auth/send-code', data).then(r => r.data.data),

  verifyCode: (data: { email: string; code: string }) =>
    client.post('/api/auth/verify-code', data).then(r => r.data.data),

  checkNickname: (nickname: string) =>
    client.get('/api/auth/check-nickname', { params: { nickname } }).then(r => r.data.data),

  register: (data: {
    userId: string;
    password: string;
    email: string;
    nickname: string;
    phone: string;
    termsAgreed: boolean;
    privacyAgreed: boolean;
    marketingAgreed?: boolean;
  }) => client.post('/api/auth/register', data).then(r => r.data.data),

  findId: (data: { email: string; code: string }) =>
    client.post('/api/auth/find-id', data).then(r => r.data.data),

  verifyReset: (data: { userId: string; name: string; email: string; code: string }) =>
    client.post('/api/auth/verify-reset', data).then(r => r.data.data),

  resetPassword: (data: { resetToken: string; newPassword: string; newPasswordConfirm: string }) =>
    client.patch('/api/auth/reset-password', data).then(r => r.data.data),
};
