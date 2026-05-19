import { type FormEvent, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Modal } from '../../components/common/Modal';
import { PasswordInput } from '../../components/common/PasswordInput';
import { TextInput } from '../../components/common/TextInput';

const INPUT_CLASS =
  'h-11 w-full rounded-xl border-blue-100 !bg-[#F0F6FF] px-4 text-[#6C88A4] placeholder:text-[#6C88A4] focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-100';

const LABEL_CLASS = 'mb-2 text-xs text-[#6C88A4]';
const ERROR_CLASS = 'mt-1 text-xs text-red-500';
const HELP_CLASS = 'mt-1 text-xs text-[#1565C0]';
const MOCK_AUTH_CODE = '123456';
const AUTH_SECONDS = 180;

interface SignupErrors {
  password?: string;
  passwordConfirm?: string;
  email?: string;
  authCode?: string;
  nickname?: string;
  phone?: string;
  terms?: string;
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

export function SignupPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [email, setEmail] = useState('');
  const [authCode, setAuthCode] = useState('');
  const [nickname, setNickname] = useState('');
  const [phone, setPhone] = useState('');
  const [serviceTerm, setServiceTerm] = useState(false);
  const [privacyTerm, setPrivacyTerm] = useState(false);
  const [marketingTerm, setMarketingTerm] = useState(false);
  const [isAuthSent, setIsAuthSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [authTimeLeft, setAuthTimeLeft] = useState(AUTH_SECONDS);
  const [noticeMessage, setNoticeMessage] = useState('');
  const [errors, setErrors] = useState<SignupErrors>({});
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);

  const canSubmit = useMemo(
    () =>
      Boolean(
        password &&
          passwordConfirm &&
          email &&
          authCode &&
          nickname &&
          phone &&
          serviceTerm &&
          privacyTerm,
      ),
    [
      password,
      passwordConfirm,
      email,
      authCode,
      nickname,
      phone,
      serviceTerm,
      privacyTerm,
    ],
  );

  useEffect(() => {
    if (!isAuthSent || isEmailVerified || authTimeLeft <= 0) {
      return;
    }

    const timerId = window.setInterval(() => {
      setAuthTimeLeft((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [authTimeLeft, isAuthSent, isEmailVerified]);

  const goBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate('/login');
  };

  const clearFieldError = (field: keyof SignupErrors) => {
    setErrors((prev) => ({ ...prev, [field]: undefined, server: undefined }));
  };

  const validateForm = () => {
    const nextErrors: SignupErrors = {};
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{10,}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^010-\d{4}-\d{4}$/;

    if (!password) {
      nextErrors.password = '비밀번호를 입력해주세요';
    } else if (!passwordRegex.test(password)) {
      nextErrors.password =
        '비밀번호는 대소문자, 숫자, 특수문자를 포함하여 10자 이상 입력해주세요';
    }

    if (!passwordConfirm) {
      nextErrors.passwordConfirm = '비밀번호를 다시 입력해주세요';
    } else if (password !== passwordConfirm) {
      nextErrors.passwordConfirm = '비밀번호가 일치하지 않습니다';
    }

    if (!emailRegex.test(email)) {
      nextErrors.email = '올바른 이메일 형식으로 입력해주세요';
    }

    if (!authCode) {
      nextErrors.authCode = '인증번호를 입력해주세요';
    } else if (!isEmailVerified) {
      nextErrors.authCode =
        authTimeLeft <= 0
          ? '인증 시간이 만료되었습니다. 다시 발송해주세요'
          : '인증번호가 일치하지 않습니다';
    }

    if (!nickname.trim()) {
      nextErrors.nickname = '닉네임을 입력해주세요';
    } else if (nickname.length < 2 || nickname.length > 10) {
      nextErrors.nickname = '닉네임은 2~10자로 입력해주세요';
    }

    if (!phone) {
      nextErrors.phone = '전화번호를 입력해주세요';
    } else if (!phoneRegex.test(phone)) {
      nextErrors.phone = '올바른 전화번호 형식으로 입력해주세요';
    }

    if (!serviceTerm || !privacyTerm) {
      nextErrors.terms = '필수 약관에 동의해주세요';
    }

    return nextErrors;
  };

  const handleSendAuthCode = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      setErrors((prev) => ({
        ...prev,
        email: '올바른 이메일 형식으로 입력해주세요',
      }));
      return;
    }

    // TODO: API 연동 후 이미 가입된 이메일 여부를 검사합니다.
    // setErrors((prev) => ({ ...prev, email: '이미 사용 중인 이메일입니다' }));
    setAuthCode('');
    setIsAuthSent(true);
    setIsEmailVerified(false);
    setAuthTimeLeft(AUTH_SECONDS);
    setNoticeMessage('인증번호가 발송되었습니다');
    clearFieldError('email');
  };

  const handleVerifyAuthCode = () => {
    if (!authCode) {
      setErrors((prev) => ({ ...prev, authCode: '인증번호를 입력해주세요' }));
      return;
    }

    if (authTimeLeft <= 0) {
      setErrors((prev) => ({
        ...prev,
        authCode: '인증 시간이 만료되었습니다. 다시 발송해주세요',
      }));
      return;
    }

    if (authCode !== MOCK_AUTH_CODE) {
      setErrors((prev) => ({ ...prev, authCode: '인증번호가 일치하지 않습니다' }));
      return;
    }

    setIsEmailVerified(true);
    setNoticeMessage('이메일 인증이 완료되었습니다');
    clearFieldError('authCode');
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = validateForm();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    // TODO: API 연동 후 이메일/닉네임 중복 검사를 처리합니다.
    // setErrors({ email: '이미 사용 중인 이메일입니다' });
    // setErrors({ nickname: '이미 사용 중인 닉네임입니다' });
    // setErrors({ server: '회원가입에 실패했습니다. 잠시 후 다시 시도해주세요' });
    console.log('mock signup', {
      email,
      nickname,
      phone,
      marketingTerm,
    });
    setIsCompleteModalOpen(true);
  };

  return (
    <>
      <Card className="min-h-screen w-full rounded-none border-0 shadow-none sm:min-h-0 sm:max-w-md sm:rounded-lg sm:border sm:shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <button
            aria-label="뒤로가기"
            className="relative flex h-8 w-8 items-center justify-center rounded-full text-[#1565C0] hover:bg-[#F0F6FF]"
            onClick={goBack}
            type="button"
          >
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[61%] text-4xl leading-none">
              ‹
            </span>
          </button>
          <h1 className="text-base font-bold text-slate-950">회원가입</h1>
        </div>

        <form className="space-y-3" noValidate onSubmit={handleSubmit}>
          {errors.server ? <p className={ERROR_CLASS}>{errors.server}</p> : null}

          <div>
            <p className={LABEL_CLASS}>이메일</p>
            <div className="flex gap-2">
              <div className="min-w-0 flex-1">
                <TextInput
                  autoComplete="username"
                  className={INPUT_CLASS}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setIsEmailVerified(false);
                    clearFieldError('email');
                  }}
                  placeholder="이메일 입력"
                  value={email}
                />
              </div>
              <Button
                className="h-11 w-[86px] shrink-0 whitespace-nowrap rounded-xl !border-blue-700 px-0 text-xs !text-blue-700"
                onClick={handleSendAuthCode}
                variant="secondary"
              >
                인증 발송
              </Button>
            </div>
            {errors.email ? <p className={ERROR_CLASS}>{errors.email}</p> : null}
          </div>

          <div>
            <p className={LABEL_CLASS}>인증번호</p>
            <div className="flex items-center gap-2">
              <div className="min-w-0 flex-1">
                <TextInput
                  className={INPUT_CLASS}
                  disabled={!isAuthSent}
                  inputMode="numeric"
                  maxLength={6}
                  onChange={(event) => {
                    setAuthCode(event.target.value.replace(/\D/g, '').slice(0, 6));
                    clearFieldError('authCode');
                  }}
                  placeholder="인증번호 6자리 입력"
                  value={authCode}
                />
              </div>
              {isAuthSent ? (
                <span className="w-10 text-center text-xs text-red-500">
                  {formatTimer(authTimeLeft)}
                </span>
              ) : null}
              <Button
                className="h-11 w-[86px] shrink-0 whitespace-nowrap rounded-xl !border-blue-700 px-0 text-xs !text-blue-700"
                disabled={!isAuthSent || isEmailVerified}
                onClick={handleVerifyAuthCode}
                variant="secondary"
              >
                확인
              </Button>
            </div>
            {errors.authCode ? <p className={ERROR_CLASS}>{errors.authCode}</p> : null}
            {noticeMessage ? <p className={HELP_CLASS}>{noticeMessage}</p> : null}
          </div>

          <div>
            <p className={LABEL_CLASS}>비밀번호 (대소문자+숫자+특수문자 10자 이상)</p>
            <PasswordInput
              autoComplete="new-password"
              className={INPUT_CLASS}
              onChange={(event) => {
                setPassword(event.target.value);
                clearFieldError('password');
              }}
              placeholder="비밀번호 입력"
              value={password}
            />
            {errors.password ? <p className={ERROR_CLASS}>{errors.password}</p> : null}
          </div>

          <div>
            <p className={LABEL_CLASS}>비밀번호 확인</p>
            <PasswordInput
              autoComplete="new-password"
              className={INPUT_CLASS}
              onChange={(event) => {
                setPasswordConfirm(event.target.value);
                clearFieldError('passwordConfirm');
              }}
              placeholder="비밀번호 재입력"
              value={passwordConfirm}
            />
            {errors.passwordConfirm ? (
              <p className={ERROR_CLASS}>{errors.passwordConfirm}</p>
            ) : null}
          </div>

          <div>
            <p className={LABEL_CLASS}>닉네임 (2~10자)</p>
            <TextInput
              className={INPUT_CLASS}
              onChange={(event) => {
                setNickname(event.target.value);
                clearFieldError('nickname');
              }}
              placeholder="닉네임 입력"
              value={nickname}
            />
            {errors.nickname ? <p className={ERROR_CLASS}>{errors.nickname}</p> : null}
          </div>

          <div>
            <p className={LABEL_CLASS}>전화번호</p>
            <TextInput
              autoComplete="tel"
              className={INPUT_CLASS}
              inputMode="tel"
              onChange={(event) => {
                setPhone(formatPhoneNumber(event.target.value));
                clearFieldError('phone');
              }}
              placeholder="010-0000-0000"
              value={phone}
            />
            {errors.phone ? <p className={ERROR_CLASS}>{errors.phone}</p> : null}
          </div>

          <div className="rounded-xl bg-[#E5F4FF] p-4 text-xs text-[#6C88A4]">
            <p className="mb-3 text-sm text-[#1565C0]">약관 동의</p>
            <label className="mb-2 flex items-center gap-2">
              <input
                checked={serviceTerm}
                onChange={(event) => {
                  setServiceTerm(event.target.checked);
                  clearFieldError('terms');
                }}
                type="checkbox"
              />
              서비스 이용약관 동의 (필수)
            </label>
            <label className="mb-2 flex items-center gap-2">
              <input
                checked={privacyTerm}
                onChange={(event) => {
                  setPrivacyTerm(event.target.checked);
                  clearFieldError('terms');
                }}
                type="checkbox"
              />
              개인정보 처리방침 동의 (필수)
            </label>
            <label className="flex items-center gap-2">
              <input
                checked={marketingTerm}
                onChange={(event) => setMarketingTerm(event.target.checked)}
                type="checkbox"
              />
              마케팅 정보 수신 동의 (선택)
            </label>
            {errors.terms ? <p className={ERROR_CLASS}>{errors.terms}</p> : null}
          </div>

          <Button
            className="h-12 w-full rounded-xl text-base font-bold"
            disabled={!canSubmit}
            type="submit"
            variant="brand"
          >
            가입하기
          </Button>
        </form>
      </Card>

      <Modal
        confirmText="로그인하러 가기"
        description="회원가입이 정상적으로 완료되었습니다. 로그인 화면으로 이동해주세요."
        isOpen={isCompleteModalOpen}
        onClose={() => setIsCompleteModalOpen(false)}
        onConfirm={() => navigate('/login')}
        title="회원가입 완료"
      />
    </>
  );
}
