import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthPageHeader } from '../../components/auth/AuthPageHeader';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Modal } from '../../components/common/Modal';
import { TextInput } from '../../components/common/TextInput';
import { authApi, parseApiError } from '../../api/auth';

const INPUT_CLASS =
  'h-11 w-full rounded-xl border-blue-100 !bg-[#F0F6FF] px-4 text-[#6C88A4] placeholder:text-[#6C88A4] focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-100';
const LABEL_CLASS = 'mb-2 text-xs text-[#6C88A4]';
const ERROR_CLASS = 'mt-1 text-xs text-red-500';
const HELP_CLASS = 'mt-1 text-xs text-[#1565C0]';
const SUCCESS_CLASS = 'mt-1 text-xs text-emerald-600';
const SECTION_CLASS = 'rounded-xl border border-blue-100 bg-white p-4 shadow-sm';
const AUTH_SECONDS = 180;

interface FindIdErrors {
  email?: string;
  authCode?: string;
  server?: string;
}

interface FindPasswordErrors {
  userId?: string;
  name?: string;
  email?: string;
  authCode?: string;
  server?: string;
}

function formatTimer(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const restSeconds = String(seconds % 60).padStart(2, '0');
  return `${minutes}:${restSeconds}`;
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function FindAccountPage() {
  const navigate = useNavigate();

  // 아이디 찾기
  const [findIdEmail, setFindIdEmail] = useState('');
  const [findIdAuthCode, setFindIdAuthCode] = useState('');
  const [isFindIdAuthSent, setIsFindIdAuthSent] = useState(false);
  const [isFindIdVerified, setIsFindIdVerified] = useState(false);
  const [findIdTimeLeft, setFindIdTimeLeft] = useState(AUTH_SECONDS);
  const [findIdNotice, setFindIdNotice] = useState('');
  const [findIdErrors, setFindIdErrors] = useState<FindIdErrors>({});
  const [isFindIdModalOpen, setIsFindIdModalOpen] = useState(false);
  const [foundUserId, setFoundUserId] = useState('');

  // 비밀번호 찾기
  const [passwordUserId, setPasswordUserId] = useState('');
  const [passwordName, setPasswordName] = useState('');
  const [passwordEmail, setPasswordEmail] = useState('');
  const [passwordAuthCode, setPasswordAuthCode] = useState('');
  const [isPasswordAuthSent, setIsPasswordAuthSent] = useState(false);
  const [isPasswordVerified, setIsPasswordVerified] = useState(false);
  const [passwordTimeLeft, setPasswordTimeLeft] = useState(AUTH_SECONDS);
  const [passwordNotice, setPasswordNotice] = useState('');
  const [passwordErrors, setPasswordErrors] = useState<FindPasswordErrors>({});

  const canResetPassword = useMemo(
    () =>
      Boolean(
        passwordUserId.trim() &&
          passwordName.trim() &&
          passwordEmail &&
          isEmail(passwordEmail) &&
          isPasswordVerified,
      ),
    [isPasswordVerified, passwordName, passwordUserId, passwordEmail],
  );

  useEffect(() => {
    if (!isFindIdAuthSent || isFindIdVerified || findIdTimeLeft <= 0) return;
    const timerId = window.setInterval(() => {
      setFindIdTimeLeft((prev) => Math.max(prev - 1, 0));
    }, 1000);
    return () => window.clearInterval(timerId);
  }, [findIdTimeLeft, isFindIdAuthSent, isFindIdVerified]);

  useEffect(() => {
    if (!isPasswordAuthSent || isPasswordVerified || passwordTimeLeft <= 0) return;
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

  // 아이디 찾기 — 이메일로 인증번호 발송
  const handleSendFindIdCode = async () => {
    if (!findIdEmail) {
      setFindIdErrors((prev) => ({ ...prev, email: '이메일을 입력해주세요' }));
      return;
    }
    if (!isEmail(findIdEmail)) {
      setFindIdErrors((prev) => ({ ...prev, email: '올바른 이메일 형식으로 입력해주세요' }));
      return;
    }
    try {
      await authApi.sendCode({ email: findIdEmail, purpose: 'find-id' });
      setFindIdAuthCode('');
      setIsFindIdAuthSent(true);
      setIsFindIdVerified(false);
      setFindIdTimeLeft(AUTH_SECONDS);
      setFindIdNotice('인증번호가 발송되었습니다');
      clearFindIdError('email');
    } catch (error) {
      setFindIdErrors((prev) => ({ ...prev, email: parseApiError(error) }));
    }
  };

  const handleVerifyFindIdCode = async () => {
    if (!findIdAuthCode) {
      setFindIdErrors((prev) => ({ ...prev, authCode: '인증번호를 입력해주세요' }));
      return;
    }
    if (findIdTimeLeft <= 0) {
      setFindIdErrors((prev) => ({ ...prev, authCode: '인증 시간이 만료되었습니다. 다시 발송해주세요' }));
      return;
    }
    try {
      const data = await authApi.verifyCode({ email: findIdEmail, code: findIdAuthCode });
      if (data.verified) {
        setIsFindIdVerified(true);
        setFindIdNotice('이메일 인증이 완료되었습니다');
        clearFindIdError('authCode');
      } else {
        setFindIdErrors((prev) => ({ ...prev, authCode: '인증번호가 일치하지 않습니다' }));
      }
    } catch (error) {
      setFindIdErrors((prev) => ({ ...prev, authCode: parseApiError(error) }));
    }
  };

  const handleFindId = async () => {
    if (!isFindIdVerified) {
      setFindIdErrors((prev) => ({ ...prev, authCode: '이메일 인증을 완료해주세요' }));
      return;
    }
    try {
      const data = await authApi.findId({ email: findIdEmail, code: findIdAuthCode });
      setFoundUserId(data.maskedUserId ?? '');
      setIsFindIdModalOpen(true);
    } catch (error) {
      setFindIdErrors((prev) => ({ ...prev, server: parseApiError(error) }));
    }
  };

  // 비밀번호 찾기 — 이메일로 인증번호 발송
  const handleSendPasswordCode = async () => {
    if (!passwordEmail) {
      setPasswordErrors((prev) => ({ ...prev, email: '이메일을 입력해주세요' }));
      return;
    }
    if (!isEmail(passwordEmail)) {
      setPasswordErrors((prev) => ({ ...prev, email: '올바른 이메일 형식으로 입력해주세요' }));
      return;
    }
    try {
      await authApi.sendCode({ email: passwordEmail, purpose: 'reset-password' });
      setPasswordAuthCode('');
      setIsPasswordAuthSent(true);
      setIsPasswordVerified(false);
      setPasswordTimeLeft(AUTH_SECONDS);
      setPasswordNotice('인증번호가 발송되었습니다');
      clearPasswordError('email');
    } catch (error) {
      setPasswordErrors((prev) => ({ ...prev, email: parseApiError(error) }));
    }
  };

  const handleVerifyPasswordCode = async () => {
    if (!passwordAuthCode) {
      setPasswordErrors((prev) => ({ ...prev, authCode: '인증번호를 입력해주세요' }));
      return;
    }
    if (passwordTimeLeft <= 0) {
      setPasswordErrors((prev) => ({ ...prev, authCode: '인증 시간이 만료되었습니다. 다시 발송해주세요' }));
      return;
    }
    try {
      const data = await authApi.verifyCode({ email: passwordEmail, code: passwordAuthCode });
      if (data.verified) {
        setIsPasswordVerified(true);
        setPasswordNotice('이메일 인증이 완료되었습니다');
        clearPasswordError('authCode');
      } else {
        setPasswordErrors((prev) => ({ ...prev, authCode: '인증번호가 일치하지 않습니다' }));
      }
    } catch (error) {
      setPasswordErrors((prev) => ({ ...prev, authCode: parseApiError(error) }));
    }
  };

  const handleResetPassword = async () => {
    const nextErrors: FindPasswordErrors = {};
    if (!passwordUserId.trim()) nextErrors.userId = '아이디를 입력해주세요';
    if (!passwordName.trim()) nextErrors.name = '이름을 입력해주세요';
    if (!passwordEmail) nextErrors.email = '이메일을 입력해주세요';
    else if (!isEmail(passwordEmail)) nextErrors.email = '올바른 이메일 형식으로 입력해주세요';
    if (!isPasswordVerified) nextErrors.authCode = '이메일 인증을 완료해주세요';

    setPasswordErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      const data = await authApi.verifyReset({
        userId: passwordUserId,
        name: passwordName,
        email: passwordEmail,
        code: passwordAuthCode,
      });
      navigate('/reset-password', {
        state: { resetToken: data.resetToken, maskedUserId: data.maskedUserId },
      });
    } catch (error) {
      setPasswordErrors((prev) => ({ ...prev, server: parseApiError(error) }));
    }
  };

  return (
    <>
      <Card className="min-h-screen w-full rounded-none border-0 shadow-none sm:min-h-0 sm:max-w-md sm:rounded-lg sm:border sm:shadow-sm">
        <AuthPageHeader onBack={goBack} title="아이디/비밀번호 찾기" />

        <div className="space-y-4">
          {/* 아이디 찾기 */}
          <section className={SECTION_CLASS}>
            <h2 className="text-sm font-bold text-slate-950">아이디 찾기</h2>
            <p className="mt-1 text-xs leading-5 text-[#6C88A4]">
              가입 시 사용한 이메일로 인증하면 아이디를 확인할 수 있습니다.
            </p>

            <div className="mt-3">
              <p className={LABEL_CLASS}>이메일</p>
              <div className="flex gap-2">
                <div className="min-w-0 flex-1">
                  <TextInput
                    autoComplete="email"
                    className={INPUT_CLASS}
                    onChange={(event) => {
                      setFindIdEmail(event.target.value);
                      setIsFindIdVerified(false);
                      clearFindIdError('email');
                    }}
                    placeholder="가입한 이메일 입력"
                    value={findIdEmail}
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
              {findIdErrors.email ? <p className={ERROR_CLASS}>{findIdErrors.email}</p> : null}
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
                      setFindIdAuthCode(event.target.value.replace(/\D/g, '').slice(0, 6));
                      clearFindIdError('authCode');
                    }}
                    placeholder="인증번호 6자리 입력"
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
              {findIdErrors.authCode ? <p className={ERROR_CLASS}>{findIdErrors.authCode}</p> : null}
              {findIdNotice ? (
                <p className={isFindIdVerified ? SUCCESS_CLASS : HELP_CLASS}>{findIdNotice}</p>
              ) : null}
              {findIdErrors.server ? <p className={ERROR_CLASS}>{findIdErrors.server}</p> : null}
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

          {/* 비밀번호 찾기 */}
          <section className={SECTION_CLASS}>
            <h2 className="text-sm font-bold text-slate-950">비밀번호 찾기</h2>
            <p className="mt-1 text-xs leading-5 text-[#6C88A4]">
              아이디, 이름, 가입한 이메일 인증을 통해 비밀번호를 재설정할 수 있습니다.
            </p>

            <div className="mt-3">
              <p className={LABEL_CLASS}>아이디</p>
              <TextInput
                autoComplete="username"
                className={INPUT_CLASS}
                onChange={(event) => {
                  setPasswordUserId(event.target.value);
                  clearPasswordError('userId');
                }}
                placeholder="아이디 입력"
                value={passwordUserId}
              />
              {passwordErrors.userId ? <p className={ERROR_CLASS}>{passwordErrors.userId}</p> : null}
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
              {passwordErrors.name ? <p className={ERROR_CLASS}>{passwordErrors.name}</p> : null}
            </div>

            <div className="mt-3">
              <p className={LABEL_CLASS}>이메일</p>
              <div className="flex gap-2">
                <div className="min-w-0 flex-1">
                  <TextInput
                    autoComplete="email"
                    className={INPUT_CLASS}
                    onChange={(event) => {
                      setPasswordEmail(event.target.value);
                      setIsPasswordVerified(false);
                      clearPasswordError('email');
                    }}
                    placeholder="가입한 이메일 입력"
                    value={passwordEmail}
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
              {passwordErrors.email ? <p className={ERROR_CLASS}>{passwordErrors.email}</p> : null}
            </div>

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
                      setPasswordAuthCode(event.target.value.replace(/\D/g, '').slice(0, 6));
                      clearPasswordError('authCode');
                    }}
                    placeholder="인증번호 6자리 입력"
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
              {passwordErrors.authCode ? <p className={ERROR_CLASS}>{passwordErrors.authCode}</p> : null}
              {passwordNotice ? (
                <p className={isPasswordVerified ? SUCCESS_CLASS : HELP_CLASS}>{passwordNotice}</p>
              ) : null}
              {passwordErrors.server ? <p className={ERROR_CLASS}>{passwordErrors.server}</p> : null}
            </div>

            <Button
              className="mt-4 h-11 w-full rounded-xl text-sm font-bold"
              disabled={!canResetPassword}
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
        description={`가입된 아이디는 ${foundUserId} 입니다.`}
        isOpen={isFindIdModalOpen}
        onClose={() => setIsFindIdModalOpen(false)}
        onConfirm={() => navigate('/login')}
        title="아이디 찾기 완료"
      />
    </>
  );
}
