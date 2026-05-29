import axios from 'axios';

const client = axios.create({
  baseURL: '',
  headers: { 'Content-Type': 'application/json' },
});

client.interceptors.request.use(config => {
  const token = localStorage.getItem('adminToken') ?? 'admin-token';
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default client;
