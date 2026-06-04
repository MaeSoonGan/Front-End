import client from '../client';

export const membersApi = {
  getMyProfile: () =>
    client.get('/api/members/me').then(r => r.data.data),

  updateMyProfile: (data: {
    nickname?: string;
    phone?: string;
    email?: string;
    emailCode?: string;
    profileImageUrl?: string;
  }) => client.patch('/api/members/me', data).then(r => r.data.data),

  changePassword: (data: {
    currentPassword: string;
    newPassword: string;
    newPasswordConfirm: string;
  }) => client.patch('/api/members/me/password', data).then(r => r.data.data),

  withdraw: (data: { password: string }) =>
    client.delete('/api/members/me', { data }).then(r => r.data.data),

  getProfileImageUploadUrl: (data: { contentType: string }) =>
    client.post('/api/members/me/profile-image/presigned-url', data).then(r => r.data.data),
};

