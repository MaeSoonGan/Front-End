import client from '../client';

export const systemApi = {
  getMonitoring: () =>
    client.get('/api/admin/monitoring').then(r => r.data.data),

  getActiveUsers: () =>
    client.get('/api/admin/monitoring/active-users').then(r => r.data.data),

  getAlerts: (params?: { status?: string; page?: number; size?: number }) =>
    client.get('/api/admin/monitoring/alerts', { params }).then(r => r.data.data),

  ignoreAlert: (alertId: number, data?: { reason?: string }) =>
    client.patch(`/api/admin/monitoring/alerts/${alertId}/ignore`, data).then(r => r.data.data),

  releaseAlert: (alertId: number, data?: { reason?: string }) =>
    client.patch(`/api/admin/monitoring/alerts/${alertId}/release`, data).then(r => r.data.data),

  getMaintenance: () =>
    client.get('/api/admin/system/maintenance').then(r => r.data.data),

  updateMaintenance: (data: { status?: string; message?: string }) =>
    client.patch('/api/admin/system/maintenance', data).then(r => r.data.data),

  getAuditLogSummary: () =>
    client.get('/api/admin/audit-logs/summary').then(r => r.data.data),

  getAuditLogs: (params?: { keyword?: string; startDate?: string; endDate?: string; type?: string; adminId?: number; page?: number; size?: number }) =>
    client.get('/api/admin/audit-logs', { params }).then(r => r.data.data),

  getAuditLog: (logId: number) =>
    client.get(`/api/admin/audit-logs/${logId}`).then(r => r.data.data),

  exportAuditLogs: (params?: { keyword?: string; startDate?: string; endDate?: string; type?: string; adminId?: number }) =>
    client.get('/api/admin/audit-logs/export', { params, responseType: 'blob' }).then(r => r.data),

  forceCancelOrder: (orderId: number, data?: { reason?: string }) =>
    client.patch(`/api/admin/orders/${orderId}/cancel`, data).then(r => r.data.data),

  getAdmins: () =>
    client.get('/api/admin/admins').then(r => r.data.data),
};
