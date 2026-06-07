import axios from 'axios';

export function parseApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || '오류가 발생했습니다. 잠시 후 다시 시도해주세요';
  }
  return '오류가 발생했습니다. 잠시 후 다시 시도해주세요';
}
