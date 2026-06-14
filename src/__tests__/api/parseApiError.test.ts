import { describe, it, expect } from 'vitest';
import { parseApiError } from '../../api/parseApiError';

// UT-FE: API 에러 메시지 파싱 (실제 소스 import)
// axios.isAxiosError는 payload.isAxiosError === true 인지로 판별하므로,
// 버전 의존 없이 isAxiosError 플래그를 가진 객체로 검증한다.
describe('parseApiError', () => {
  it('axios 에러 응답의 message를 반환한다', () => {
    const err = { isAxiosError: true, response: { data: { message: '이미 사용 중인 아이디입니다' } } };
    expect(parseApiError(err)).toBe('이미 사용 중인 아이디입니다');
  });

  it('message가 없으면 기본 안내 문구를 반환한다', () => {
    const err = { isAxiosError: true, response: { data: {} } };
    expect(parseApiError(err)).toBe('오류가 발생했습니다. 잠시 후 다시 시도해주세요');
  });

  it('axios 에러가 아니면 기본 안내 문구를 반환한다', () => {
    expect(parseApiError(new Error('boom'))).toBe('오류가 발생했습니다. 잠시 후 다시 시도해주세요');
  });
});
