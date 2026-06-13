import client from '../client';

export const dashboardApi = {
  getDashboard: () =>
    client.get('/api/admin/dashboard').then(r => r.data.data ?? r.data),
};
