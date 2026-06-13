import client from '../client';

const ADMIN_MONITORING_PATH = '/api/admin/monitoring';
const ADMIN_SYSTEM_PATH = '/api/admin/system';
const ADMIN_AUDIT_LOGS_PATH = '/api/admin/audit-logs';
const ADMIN_ORDERS_PATH = '/api/admin/orders';
const ADMIN_ADMINS_PATH = '/api/admin/admins';

export const systemApi = {
  getMonitoring: () =>
    client.get(ADMIN_MONITORING_PATH).then(r => r.data.data),

  getActiveUsers: () =>
    client.get(`${ADMIN_MONITORING_PATH}/active-users`).then(r => r.data.data),

  getAlerts: (params?: { status?: string; page?: number; size?: number }) =>
    client.get(`${ADMIN_MONITORING_PATH}/alerts`, { params }).then(r => r.data.data),

  ignoreAlert: (alertId: number, data?: { reason?: string }) =>
    client.patch(`${ADMIN_MONITORING_PATH}/alerts/${alertId}/ignore`, data).then(r => r.data.data),

  releaseAlert: (alertId: number, data?: { reason?: string }) =>
    client.patch(`${ADMIN_MONITORING_PATH}/alerts/${alertId}/release`, data).then(r => r.data.data),

  getMaintenance: () =>
    client.get(`${ADMIN_SYSTEM_PATH}/maintenance`).then(r => r.data.data),

  updateMaintenance: (data: { status?: string; message?: string }) =>
    client.patch(`${ADMIN_SYSTEM_PATH}/maintenance`, data).then(r => r.data.data),

  getAuditLogSummary: () =>
    client.get(`${ADMIN_AUDIT_LOGS_PATH}/summary`).then(r => r.data.data),

  getAuditLogs: (params?: { keyword?: string; startDate?: string; endDate?: string; type?: string; adminId?: number; page?: number; size?: number }) =>
    client.get(ADMIN_AUDIT_LOGS_PATH, { params }).then(r => r.data.data),

  getAuditLog: (logId: number) =>
    client.get(`${ADMIN_AUDIT_LOGS_PATH}/${logId}`).then(r => r.data.data),

  exportAuditLogs: (params?: { keyword?: string; startDate?: string; endDate?: string; type?: string; adminId?: number }) =>
    client.get(`${ADMIN_AUDIT_LOGS_PATH}/export`, { params, responseType: 'blob' }).then(r => r.data),

  forceCancelOrder: (orderId: number, data?: { reason?: string }) =>
    client.patch(`${ADMIN_ORDERS_PATH}/${orderId}/cancel`, data).then(r => r.data.data),

  getAdmins: () =>
    client.get(ADMIN_ADMINS_PATH).then(r => r.data.data),
};
