import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthPageHeader } from '../../components/auth/AuthPageHeader';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Modal } from '../../components/common/Modal';
import { TextInput } from '../../components/common/TextInput';
import { cn } from '../../utils/cn';

const INPUT_CLASS =
  'h-11 w-full rounded-xl border-blue-100 !bg-[#F0F6FF] px-4 text-[#6C88A4] placeholder:text-[#6C88A4] focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-100';
const LABEL_CLASS = 'mb-2 text-xs text-[#6C88A4]';
const ERROR_CLASS = 'mt-1 text-xs text-red-500';
const HELP_CLASS = 'mt-1 text-xs text-[#1565C0]';
const SUCCESS_CLASS = 'mt-1 text-xs text-emerald-600';
const SECTION_CLASS = 'rounded-xl border border-blue-100 bg-white p-4 shadow-sm';
const METHOD_BUTTON_CLASS =
  'h-10 flex-1 rounded-xl px-2 text-xs font-bold transition';
const MOCK_AUTH_CODE = '123456';
const MOCK_FOUND_EMAIL = 'user@example.com';
const AUTH_SECONDS = 180;

type PasswordAuthMethod = 'email' | 'phone';

interface FindIdErrors {
  phone?: string;
  authCode?: string;
  server?: string;
}

interface FindPasswordErrors {
  userEmail?: string;
  name?: string;
  phone?: string;
  authCode?: string;
  server?: string;
}

function formatPhoneNumber(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11);

  if (digits.length <= 3) {
    return digits;
  }

  if (digits.length <= 7) {
    return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  }

  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

function formatTimer(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const restSeconds = String(seconds % 60).padStart(2, '0');

  return `${minutes}:${restSeconds}`;
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isPhone(value: string) {
  return /^010-\d{4}-\d{4}$/.test(value);
}

function getMethodButtonClass(isSelected: boolean) {
  return cn(
    METHOD_BUTTON_CLASS,
    isSelected
      ? '!border-blue-700 bg-[#EAF4FF] !text-blue-700'
      : '!border-blue-100 bg-white !text-slate-700',
  );
}

export function FindAccountPage() {
  const navigate = useNavigate();
  const [findIdPhone, setFindIdPhone] = useState('');
  const [findIdAuthCode, setFindIdAuthCode] = useState('');
  const [isFindIdAuthSent, setIsFindIdAuthSent] = useState(false);
  const [isFindIdVerified, setIsFindIdVerified] = useState(false);
  const [findIdTimeLeft, setFindIdTimeLeft] = useState(AUTH_SECONDS);
  const [findIdNotice, setFindIdNotice] = useState('');
  const [findIdErrors, setFindIdErrors] = useState<FindIdErrors>({});
  const [isFindIdModalOpen, setIsFindIdModalOpen] = useState(false);

  const [passwordAuthMethod, setPasswordAuthMethod] =
    useState<PasswordAuthMethod>('email');
  const [passwordUserEmail, setPasswordUserEmail] = useState('');
  const [passwordName, setPasswordName] = useState('');
  const [passwordPhone, setPasswordPhone] = useState('');
  const [passwordAuthCode, setPasswordAuthCode] = useState('');
  const [isPasswordAuthSent, setIsPasswordAuthSent] = useState(false);
  const [isPasswordVerified, setIsPasswordVerified] = useState(false);
  const [passwordTimeLeft, setPasswordTimeLeft] = useState(AUTH_SECONDS);
  const [passwordNotice, setPasswordNotice] = useState('');
  const [passwordErrors, setPasswordErrors] = useState<FindPasswordErrors>({});

  const canResetPassword = useMemo(
    () =>
      Boolean(
        passwordUserEmail &&
          isEmail(passwordUserEmail) &&
          passwordName.trim() &&
          isPasswordVerified,
      ),
    [isPasswordVerified, passwordName, passwordUserEmail],
  );

  useEffect(() => {
    if (!isFindIdAuthSent || isFindIdVerified || findIdTimeLeft <= 0) {
      return;
    }

    const timerId = window.setInterval(() => {
      setFindIdTimeLeft((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [findIdTimeLeft, isFindIdAuthSent, isFindIdVerified]);

  useEffect(() => {
    if (!isPasswordAuthSent || isPasswordVerified || passwordTimeLeft <= 0) {
      return;
    }

    const timerId = window.setInterval(() => {
      setPasswordTimeLeft((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [isPasswordAuthSent, isPasswordVerified, passwordTimeLeft]);

  const goBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate('/login');
  };

  const clearFindIdError = (field: keyof FindIdErrors) => {
    setFindIdErrors((prev) => ({ ...prev, [field]: undefined, server: undefined }));
  };

  const clearPasswordError = (field: keyof FindPasswordErrors) => {
    setPasswordErrors((prev) => ({ ...prev, [field]: undefined, server: undefined }));
  };

  const resetPasswordAuthState = () => {
    setPasswordAuthCode('');
    setIsPasswordAuthSent(false);
    setIsPasswordVerified(false);
    setPasswordTimeLeft(AUTH_SECONDS);
    setPasswordNotice('');
    setPasswordErrors((prev) => ({
      ...prev,
      phone: undefined,
      authCode: undefined,
      server: undefined,
    }));
  };

  const handleSendFindIdCode = () => {
    if (!findIdPhone) {
      setFindIdErrors((prev) => ({ ...prev, phone: '전화번호를 입력해주세요' }));
      return;
    }

    if (!isPhone(findIdPhone)) {
      setFindIdErrors((prev) => ({
        ...prev,
        phone: '올바른 전화번호 형식으로 입력해주세요',
      }));
      return;
    }

    // TODO: API 연동 후 가입된 휴대폰 번호 없음, 탈퇴/정지 계정 여부를 검증합니다.
    // setFindIdErrors({ server: '일치하는 회원 정보를 찾을 수 없습니다' });
    // setFindIdErrors({ server: '사용할 수 없는 계정입니다' });
    console.log('mock send find id sms code', { phone: findIdPhone });
    setFindIdAuthCode('');
    setIsFindIdAuthSent(true);
    setIsFindIdVerified(false);
    setFindIdTimeLeft(AUTH_SECONDS);
    setFindIdNotice('인증번호가 발송되었습니다');
    clearFindIdError('phone');
  };

  const handleVerifyFindIdCode = () => {
    if (!findIdAuthCode) {
      setFindIdErrors((prev) => ({
        ...prev,
        authCode: '인증번호를 입력해주세요',
      }));
      return;
    }

    if (findIdTimeLeft <= 0) {
      setFindIdErrors((prev) => ({
        ...prev,
        authCode: '인증 시간이 만료되었습니다. 다시 발송해주세요',
      }));
      return;
    }

    if (findIdAuthCode !== MOCK_AUTH_CODE) {
      setFindIdErrors((prev) => ({
        ...prev,
        authCode: '인증번호가 일치하지 않습니다',
      }));
      return;
    }

    setIsFindIdVerified(true);
    setFindIdNotice('휴대폰 인증이 완료되었습니다');
    clearFindIdError('authCode');
  };

  const handleFindId = () => {
    if (!isFindIdVerified) {
      setFindIdErrors((prev) => ({
        ...prev,
        authCode: '휴대폰 인증을 완료해주세요',
      }));
      return;
    }

    // TODO: API 연동 후 실제 회원 조회와 계정 상태 검증을 처리합니다.
    console.log('mock find id', { phone: findIdPhone });
    setIsFindIdModalOpen(true);
  };

  const handleSendPasswordCode = () => {
    if (passwordAuthMethod === 'email') {
      if (!passwordUserEmail) {
        setPasswordErrors((prev) => ({
          ...prev,
          userEmail: '아이디를 입력해주세요',
        }));
        return;
      }

      if (!isEmail(passwordUserEmail)) {
        setPasswordErrors((prev) => ({
          ...prev,
          userEmail: '아이디는 이메일 형식으로 입력해주세요',
        }));
        return;
      }

      console.log('mock send password email code', { email: passwordUserEmail });
      clearPasswordError('userEmail');
    } else {
      if (!passwordPhone) {
        setPasswordErrors((prev) => ({ ...prev, phone: '전화번호를 입력해주세요' }));
        return;
      }

      if (!isPhone(passwordPhone)) {
        setPasswordErrors((prev) => ({
          ...prev,
          phone: '올바른 전화번호 형식으로 입력해주세요',
        }));
        return;
      }

      // TODO: API 연동 후 가입 정보와 전화번호 일치 여부를 검증합니다.
      // setPasswordErrors({ server: '입력한 정보와 일치하는 회원이 없습니다' });
      console.log('mock send password sms code', { phone: passwordPhone });
      clearPasswordError('phone');
    }

    setPasswordAuthCode('');
    setIsPasswordAuthSent(true);
    setIsPasswordVerified(false);
    setPasswordTimeLeft(AUTH_SECONDS);
    setPasswordNotice('인증번호가 발송되었습니다');
  };

  const handleVerifyPasswordCode = () => {
    if (!passwordAuthCode) {
      setPasswordErrors((prev) => ({
        ...prev,
        authCode: '인증번호를 입력해주세요',
      }));
      return;
    }

    if (passwordTimeLeft <= 0) {
      setPasswordErrors((prev) => ({
        ...prev,
        authCode: '인증 시간이 만료되었습니다. 다시 발송해주세요',
      }));
      return;
    }

    if (passwordAuthCode !== MOCK_AUTH_CODE) {
      setPasswordErrors((prev) => ({
        ...prev,
        authCode: '인증번호가 일치하지 않습니다',
      }));
      return;
    }

    setIsPasswordVerified(true);
    setPasswordNotice(
      passwordAuthMethod === 'email'
        ? '이메일 인증이 완료되었습니다'
        : '휴대폰 인증이 완료되었습니다',
    );
    clearPasswordError('authCode');
  };

  const validatePasswordInfo = () => {
    const nextErrors: FindPasswordErrors = {};

    if (!passwordUserEmail) {
      nextErrors.userEmail = '아이디를 입력해주세요';
    } else if (!isEmail(passwordUserEmail)) {
      nextErrors.userEmail = '아이디는 이메일 형식으로 입력해주세요';
    }

    if (!passwordName.trim()) {
      nextErrors.name = '이름을 입력해주세요';
    }

    if (!isPasswordVerified) {
      nextErrors.authCode = '본인 인증을 완료해주세요';
    }

    // TODO: API 연동 후 존재하지 않는 아이디와 가입 정보 불일치 여부를 검증합니다.
    // setPasswordErrors({ userEmail: '존재하지 않는 아이디입니다' });
    // setPasswordErrors({ server: '입력한 정보와 일치하는 회원이 없습니다' });
    return nextErrors;
  };

  const handleResetPassword = () => {
    const nextErrors = validatePasswordInfo();
    setPasswordErrors((prev) => ({ ...prev, ...nextErrors }));

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    console.log('mock reset password request', {
      userEmail: passwordUserEmail,
      name: passwordName,
      authMethod: passwordAuthMethod,
      authEmail: passwordUserEmail,
      phone: passwordPhone,
    });

    // TODO: 비밀번호 재설정 페이지 구현 후 실제 라우트와 토큰 전달 방식을 연결합니다.
    navigate('/reset-password');
  };

  return (
    <>
      <Card className="min-h-screen w-full rounded-none border-0 shadow-none sm:min-h-0 sm:max-w-md sm:rounded-lg sm:border sm:shadow-sm">
        <AuthPageHeader onBack={goBack} title="아이디/비밀번호 찾기" />

        <div className="space-y-4">
          <section className={SECTION_CLASS}>
            <h2 className="text-sm font-bold text-slate-950">아이디 찾기</h2>
            <p className="mt-1 text-xs leading-5 text-[#6C88A4]">
              가입 시 사용한 휴대폰 인증을 통해 이메일 아이디를 확인할 수 있습니다.
            </p>

            <div className="mt-4">
              <p className={LABEL_CLASS}>인증 방법 선택</p>
              <Button className={getMethodButtonClass(true)} variant="secondary">
                휴대폰 인증
              </Button>
            </div>

            <div className="mt-3">
              <p className={LABEL_CLASS}>전화번호</p>
              <div className="flex gap-2">
                <div className="min-w-0 flex-1">
                  <TextInput
                    autoComplete="tel"
                    className={INPUT_CLASS}
                    inputMode="tel"
                    onChange={(event) => {
                      setFindIdPhone(formatPhoneNumber(event.target.value));
                      setIsFindIdVerified(false);
                      clearFindIdError('phone');
                    }}
                    placeholder="010-0000-0000"
                    value={findIdPhone}
                  />
                </div>
                <Button
                  className="h-11 w-[86px] shrink-0 rounded-xl !border-blue-700 px-0 text-xs !text-blue-700"
                  onClick={handleSendFindIdCode}
                  variant="secondary"
                >
                  인증 발송
                </Button>
              </div>
              {findIdErrors.phone ? (
                <p className={ERROR_CLASS}>{findIdErrors.phone}</p>
              ) : null}
            </div>

            <div className="mt-3">
              <p className={LABEL_CLASS}>인증번호</p>
              <div className="flex items-center gap-2">
                <div className="min-w-0 flex-1">
                  <TextInput
                    className={INPUT_CLASS}
                    disabled={!isFindIdAuthSent}
                    inputMode="numeric"
                    maxLength={6}
                    onChange={(event) => {
                      setFindIdAuthCode(
                        event.target.value.replace(/\D/g, '').slice(0, 6),
                      );
                      clearFindIdError('authCode');
                    }}
                    placeholder="SMS로 받은 인증번호 입력"
                    value={findIdAuthCode}
                  />
                </div>
                {isFindIdAuthSent ? (
                  <span className="w-10 text-center text-xs text-red-500">
                    {formatTimer(findIdTimeLeft)}
                  </span>
                ) : null}
                <Button
                  className="h-11 w-[58px] shrink-0 rounded-xl !border-blue-700 px-0 text-xs !text-blue-700"
                  disabled={!isFindIdAuthSent || isFindIdVerified}
                  onClick={handleVerifyFindIdCode}
                  variant="secondary"
                >
                  확인
                </Button>
              </div>
              {findIdErrors.authCode ? (
                <p className={ERROR_CLASS}>{findIdErrors.authCode}</p>
              ) : null}
              {findIdNotice ? (
                <p className={isFindIdVerified ? SUCCESS_CLASS : HELP_CLASS}>
                  {findIdNotice}
                </p>
              ) : null}
              {findIdErrors.server ? (
                <p className={ERROR_CLASS}>{findIdErrors.server}</p>
              ) : null}
            </div>

            <Button
              className="mt-4 h-11 w-full rounded-xl text-sm font-bold"
              onClick={handleFindId}
              variant="brand"
            >
              아이디 찾기
            </Button>
          </section>

          <div className="flex items-center gap-3 px-1">
            <div className="h-px flex-1 bg-blue-100" />
            <span className="text-xs text-[#A3B4C6]">비밀번호 찾기</span>
            <div className="h-px flex-1 bg-blue-100" />
          </div>

          <section className={SECTION_CLASS}>
            <h2 className="text-sm font-bold text-slate-950">비밀번호 찾기</h2>
            <p className="mt-1 text-xs leading-5 text-[#6C88A4]">
              가입한 이메일 아이디와 본인 인증을 통해 비밀번호를 재설정할 수
              있습니다.
            </p>

            <div className="mt-4">
              <p className={LABEL_CLASS}>인증 방법 선택</p>
              <div className="flex gap-2">
                <Button
                  className={getMethodButtonClass(passwordAuthMethod === 'email')}
                  onClick={() => {
                    setPasswordAuthMethod('email');
                    resetPasswordAuthState();
                  }}
                  variant="secondary"
                >
                  이메일 인증
                </Button>
                <Button
                  className={getMethodButtonClass(passwordAuthMethod === 'phone')}
                  onClick={() => {
                    setPasswordAuthMethod('phone');
                    resetPasswordAuthState();
                  }}
                  variant="secondary"
                >
                  휴대폰 인증
                </Button>
              </div>
            </div>

            <div className="mt-3">
              <p className={LABEL_CLASS}>아이디(이메일)</p>
              <div className={passwordAuthMethod === 'email' ? 'flex gap-2' : undefined}>
                <div className="min-w-0 flex-1">
                  <TextInput
                    autoComplete="username"
                    className={INPUT_CLASS}
                    onChange={(event) => {
                      setPasswordUserEmail(event.target.value);
                      setIsPasswordVerified(false);
                      clearPasswordError('userEmail');
                    }}
                    placeholder="가입한 이메일 아이디 입력"
                    value={passwordUserEmail}
                  />
                </div>
                {passwordAuthMethod === 'email' ? (
                  <Button
                    className="h-11 w-[86px] shrink-0 rounded-xl !border-blue-700 px-0 text-xs !text-blue-700"
                    onClick={handleSendPasswordCode}
                    variant="secondary"
                  >
                    인증 발송
                  </Button>
                ) : null}
              </div>
              {passwordErrors.userEmail ? (
                <p className={ERROR_CLASS}>{passwordErrors.userEmail}</p>
              ) : null}
            </div>

            <div className="mt-3">
              <p className={LABEL_CLASS}>이름</p>
              <TextInput
                autoComplete="name"
                className={INPUT_CLASS}
                onChange={(event) => {
                  setPasswordName(event.target.value);
                  clearPasswordError('name');
                }}
                placeholder="이름 입력"
                value={passwordName}
              />
              {passwordErrors.name ? (
                <p className={ERROR_CLASS}>{passwordErrors.name}</p>
              ) : null}
            </div>

            {passwordAuthMethod === 'phone' ? (
              <div className="mt-3">
                <p className={LABEL_CLASS}>전화번호</p>
                <div className="flex gap-2">
                  <div className="min-w-0 flex-1">
                    <TextInput
                      autoComplete="tel"
                      className={INPUT_CLASS}
                      inputMode="tel"
                      onChange={(event) => {
                        setPasswordPhone(formatPhoneNumber(event.target.value));
                        setIsPasswordVerified(false);
                        clearPasswordError('phone');
                      }}
                      placeholder="010-0000-0000"
                      value={passwordPhone}
                    />
                  </div>
                  <Button
                    className="h-11 w-[86px] shrink-0 rounded-xl !border-blue-700 px-0 text-xs !text-blue-700"
                    onClick={handleSendPasswordCode}
                    variant="secondary"
                  >
                    인증 발송
                  </Button>
                </div>
                {passwordErrors.phone ? (
                  <p className={ERROR_CLASS}>{passwordErrors.phone}</p>
                ) : null}
              </div>
            ) : null}

            <div className="mt-3">
              <p className={LABEL_CLASS}>인증번호</p>
              <div className="flex items-center gap-2">
                <div className="min-w-0 flex-1">
                  <TextInput
                    className={INPUT_CLASS}
                    disabled={!isPasswordAuthSent}
                    inputMode="numeric"
                    maxLength={6}
                    onChange={(event) => {
                      setPasswordAuthCode(
                        event.target.value.replace(/\D/g, '').slice(0, 6),
                      );
                      clearPasswordError('authCode');
                    }}
                    placeholder={
                      passwordAuthMethod === 'email'
                        ? '인증번호 6자리 입력'
                        : 'SMS로 받은 인증번호 입력'
                    }
                    value={passwordAuthCode}
                  />
                </div>
                {isPasswordAuthSent ? (
                  <span className="w-10 text-center text-xs text-red-500">
                    {formatTimer(passwordTimeLeft)}
                  </span>
                ) : null}
                <Button
                  className="h-11 w-[58px] shrink-0 rounded-xl !border-blue-700 px-0 text-xs !text-blue-700"
                  disabled={!isPasswordAuthSent || isPasswordVerified}
                  onClick={handleVerifyPasswordCode}
                  variant="secondary"
                >
                  확인
                </Button>
              </div>
              {passwordErrors.authCode ? (
                <p className={ERROR_CLASS}>{passwordErrors.authCode}</p>
              ) : null}
              {passwordNotice ? (
                <p className={isPasswordVerified ? SUCCESS_CLASS : HELP_CLASS}>
                  {passwordNotice}
                </p>
              ) : null}
              {passwordErrors.server ? (
                <p className={ERROR_CLASS}>{passwordErrors.server}</p>
              ) : null}
            </div>

            <Button
              className={cn(
                'mt-4 h-11 w-full rounded-xl text-sm font-bold',
                !canResetPassword && 'opacity-60',
              )}
              onClick={handleResetPassword}
              variant="brand"
            >
              비밀번호 재설정
            </Button>
          </section>

          <Link
            className="block pb-3 pt-2 text-center text-xs font-bold text-blue-700"
            to="/login"
          >
            로그인 화면으로 돌아가기
          </Link>
        </div>
      </Card>

      <Modal
        confirmText="로그인하러 가기"
        description={`가입된 이메일 아이디는 ${MOCK_FOUND_EMAIL} 입니다.`}
        isOpen={isFindIdModalOpen}
        onClose={() => setIsFindIdModalOpen(false)}
        onConfirm={() => navigate('/login')}
        title="아이디 찾기 완료"
      />
    </>
  );
}
