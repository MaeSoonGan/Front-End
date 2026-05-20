import { type FormEvent, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthPageHeader } from '../../components/auth/AuthPageHeader';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { InfoBox } from '../../components/common/InfoBox';
import { PasswordInput } from '../../components/common/PasswordInput';
import { PasswordRuleList } from '../../components/common/PasswordRuleList';

const INPUT_CLASS =
  'h-11 w-full rounded-xl border-blue-100 !bg-[#F0F6FF] px-4 text-[#6C88A4] placeholder:text-[#6C88A4] focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-100';
const LABEL_CLASS = 'mb-2 text-xs font-bold text-[#6C88A4]';
const ERROR_CLASS = 'mt-1 text-xs text-red-500';
const SUCCESS_CLASS = 'mt-1 text-xs font-bold text-emerald-600';
const MOCK_MASKED_USER_ID = 'hong****';

interface ResetPasswordErrors {
  password?: string;
  passwordConfirm?: string;
  server?: string;
}

function getPasswordRules(password: string) {
  return [
    {
      label: '영문 대문자 포함',
      isValid: /[A-Z]/.test(password),
    },
    {
      label: '영문 소문자 포함',
      isValid: /[a-z]/.test(password),
    },
    {
      label: '숫자 포함',
      isValid: /\d/.test(password),
    },
    {
      label: '특수문자 포함 (!@#$%^&*)',
      isValid: /[!@#$%^&*]/.test(password),
    },
    {
      label: '10자 이상',
      isValid: password.length >= 10,
    },
  ];
}

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [errors, setErrors] = useState<ResetPasswordErrors>({});

  const passwordRules = useMemo(() => getPasswordRules(password), [password]);
  const isPasswordValid = passwordRules.every((rule) => rule.isValid);
  const isPasswordMatched = Boolean(passwordConfirm && password === passwordConfirm);
  const canSubmit = isPasswordValid && isPasswordMatched;

  const goBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate('/find-account');
  };

  const handleCancel = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate('/login');
  };

  const validateForm = () => {
    const nextErrors: ResetPasswordErrors = {};

    if (!password) {
      nextErrors.password = '새 비밀번호를 입력해주세요';
    } else if (!isPasswordValid) {
      nextErrors.password = '비밀번호 조건을 모두 충족해주세요';
    }

    if (!passwordConfirm) {
      nextErrors.passwordConfirm = '새 비밀번호를 다시 입력해주세요';
    } else if (password !== passwordConfirm) {
      nextErrors.passwordConfirm = '비밀번호가 일치하지 않습니다';
    }

    // TODO: API 연동 후 이전과 동일한 비밀번호 입력 여부를 검증합니다.
    // setErrors({ server: '이전과 동일한 비밀번호는 사용할 수 없어요' });
    // TODO: API 연동 후 비밀번호 재설정 토큰과 본인 인증 완료 여부를 검증합니다.
    return nextErrors;
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = validateForm();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    console.log('mock reset password complete', {
      maskedUserId: MOCK_MASKED_USER_ID,
    });
    navigate('/reset-password/complete');
  };

  return (
    <Card className="min-h-screen w-full rounded-none border-0 shadow-none sm:min-h-0 sm:max-w-md sm:rounded-lg sm:border sm:shadow-sm">
      <AuthPageHeader onBack={goBack} title="비밀번호 재설정" />

      <InfoBox variant="success">
        <p className="font-bold">☑ 본인 인증이 완료됐어요</p>
        <p className="mt-1 text-emerald-600">
          {MOCK_MASKED_USER_ID} 님의 새 비밀번호를 설정해주세요
        </p>
      </InfoBox>

      <form className="mt-4 space-y-4" noValidate onSubmit={handleSubmit}>
        <section className="rounded-xl border border-blue-100 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-bold text-slate-950">새 비밀번호 설정</h2>

          <div className="mt-4">
            <p className={LABEL_CLASS}>새 비밀번호</p>
            <PasswordInput
              autoComplete="new-password"
              className={INPUT_CLASS}
              onChange={(event) => {
                setPassword(event.target.value);
                setErrors((prev) => ({ ...prev, password: undefined, server: undefined }));
              }}
              placeholder="새 비밀번호 입력"
              value={password}
            />
            <PasswordRuleList rules={passwordRules} />
            {errors.password ? <p className={ERROR_CLASS}>{errors.password}</p> : null}
          </div>

          <div className="mt-4">
            <p className={LABEL_CLASS}>새 비밀번호 확인</p>
            <PasswordInput
              autoComplete="new-password"
              className={INPUT_CLASS}
              onChange={(event) => {
                setPasswordConfirm(event.target.value);
                setErrors((prev) => ({
                  ...prev,
                  passwordConfirm: undefined,
                  server: undefined,
                }));
              }}
              placeholder="새 비밀번호 재입력"
              value={passwordConfirm}
            />
            {passwordConfirm && !isPasswordMatched ? (
              <p className={ERROR_CLASS}>비밀번호가 일치하지 않습니다</p>
            ) : null}
            {isPasswordMatched ? (
              <p className={SUCCESS_CLASS}>비밀번호가 일치해요</p>
            ) : null}
            {errors.passwordConfirm ? (
              <p className={ERROR_CLASS}>{errors.passwordConfirm}</p>
            ) : null}
          </div>
        </section>

        <InfoBox variant="warning">
          <p>⚠ 이전과 동일한 비밀번호는 사용할 수 없어요</p>
          <p>비밀번호 변경 후 모든 기기에서 자동 로그아웃 돼요</p>
        </InfoBox>

        {errors.server ? (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
            {errors.server}
          </p>
        ) : null}

        <Button
          className="h-12 w-full rounded-xl text-base font-bold"
          disabled={!canSubmit}
          type="submit"
          variant="brand"
        >
          비밀번호 변경 완료
        </Button>
        <Button
          className="h-12 w-full rounded-xl border-blue-100 bg-[#F0F6FF] text-base font-bold text-slate-900 hover:bg-[#E5F4FF]"
          onClick={handleCancel}
          variant="secondary"
        >
          취소
        </Button>
      </form>
    </Card>
  );
}
