import { describe, it, expect } from 'vitest';

// 회원가입/로그인 검증 로직 (SignupPage / FindAccountPage 기준)
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{10,}$/;
const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

function formatPhoneNumber(value: string) {
  const d = value.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 7) return `${d.slice(0, 3)}-${d.slice(3)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
}

// 약관 필수 동의: 서비스 + 개인정보
const termsValid = (service: boolean, privacy: boolean) => service && privacy;

describe('회원가입 비밀번호 정책', () => {
  it('대/소문자+숫자+특수문자 10자 이상이면 통과', () => {
    expect(PASSWORD_REGEX.test('Abcdef1!23')).toBe(true);
  });
  it('10자 미만이면 실패', () => {
    expect(PASSWORD_REGEX.test('Ab1!ab')).toBe(false);
  });
  it('특수문자 없으면 실패', () => {
    expect(PASSWORD_REGEX.test('Abcdefg123')).toBe(false);
  });
});

describe('이메일 형식 검증', () => {
  it('정상 형식은 통과', () => {
    expect(isEmail('user@example.com')).toBe(true);
  });
  it('잘못된 형식은 차단', () => {
    expect(isEmail('user@')).toBe(false);
    expect(isEmail('user.com')).toBe(false);
  });
});

describe('전화번호 자동 하이픈 포맷', () => {
  it('11자리를 010-0000-0000으로 포맷', () => {
    expect(formatPhoneNumber('01012345678')).toBe('010-1234-5678');
  });
  it('입력 중간 자리수도 하이픈 처리', () => {
    expect(formatPhoneNumber('0101234')).toBe('010-1234');
  });
});

describe('약관 필수 동의 검증', () => {
  it('서비스+개인정보 모두 동의해야 통과', () => {
    expect(termsValid(true, true)).toBe(true);
  });
  it('하나라도 미동의면 차단', () => {
    expect(termsValid(true, false)).toBe(false);
  });
});
