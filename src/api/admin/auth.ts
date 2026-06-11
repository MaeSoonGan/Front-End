import client from '../client';

export interface AdminLoginResponse {
  token: string;
  loginId: string;
  nickname: string;
  role: string;
}

export const adminAuthApi = {
  login: (data: { loginId: string; password: string }) =>
    client.post('/api/admin/login', data).then((r) => r.data.data as AdminLoginResponse),
};
