import { type FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { PasswordInput } from '../../components/common/PasswordInput';
import { TextInput } from '../../components/common/TextInput';
import loginLogo from '../../assets/login-logo-transparent.png';

interface LoginErrors {
  username?: string;
  password?: string;
  server?: string;
}

export function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const [errors, setErrors] = useState<LoginErrors>({});

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors: LoginErrors = {};

    if (!username.trim()) {
      nextErrors.username = '아이디를 입력해주세요';
    }

    if (!password) {
      nextErrors.password = '비밀번호를 입력해주세요';
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    // TODO: API 연동 후 존재하지 않는 아이디, 탈퇴/정지 계정 오류를 처리합니다.
    // TODO: API 연동 후 아이디/비밀번호 불일치, 로그인 실패 횟수 초과 오류를 처리합니다.
    // setErrors({ server: '존재하지 않는 아이디입니다' });
    // setErrors({ server: '사용할 수 없는 계정입니다' });
    // setErrors({ server: '아이디 또는 비밀번호가 일치하지 않습니다' });
    // setErrors({ server: '로그인 실패 횟수를 초과했습니다. 잠시 후 다시 시도해주세요' });
    console.log('mock login', {
      username,
      keepLoggedIn,
    });

    // TODO: API/토큰 연동 단계에서 토큰 생성, 세션 저장, 로그인 유지 처리를 구현합니다.
    navigate('/home');
  };

  return (
    <Card className="flex min-h-screen w-full flex-col justify-center rounded-none border-0 shadow-none sm:min-h-0 sm:max-w-md sm:rounded-lg sm:border sm:shadow-sm">
      <form className="space-y-4" noValidate onSubmit={handleSubmit}>
        <div className="mb-10 flex justify-center pt-6">
          <img
            alt="매순간 매도 먼저"
            className="h-auto w-56 object-contain"
            src={loginLogo}
          />
        </div>

        <div>
          <p className="mb-2 text-sm text-[#6C88A4]">아이디</p>
          <TextInput
            autoComplete="username"
            className="h-11 rounded-xl border-blue-100 bg-[#F0F6FF] px-4 text-[#6C88A4] placeholder:text-[#6C88A4] focus:border-blue-500"
            onChange={(event) => {
              setUsername(event.target.value);
              setErrors((prev) => ({ ...prev, username: undefined, server: undefined }));
            }}
            placeholder="아이디를 입력하세요"
            value={username}
          />
          {errors.username ? (
            <p className="mt-1 text-xs text-red-500">{errors.username}</p>
          ) : null}
        </div>

        <div>
          <p className="mb-2 text-sm text-[#6C88A4]">비밀번호</p>
          <PasswordInput
            autoComplete="current-password"
            className="h-11 rounded-xl border-blue-100 bg-[#F0F6FF] px-4 text-[#6C88A4] placeholder:text-[#6C88A4] focus:border-blue-500"
            onChange={(event) => {
              setPassword(event.target.value);
              setErrors((prev) => ({ ...prev, password: undefined, server: undefined }));
            }}
            placeholder="비밀번호를 입력하세요"
            value={password}
          />
          {errors.password ? (
            <p className="mt-1 text-xs text-red-500">{errors.password}</p>
          ) : null}
        </div>

        <div className="flex items-center justify-between text-xs text-slate-600">
          <label className="inline-flex cursor-pointer items-center gap-2">
            <input
              checked={keepLoggedIn}
              className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600"
              onChange={(event) => setKeepLoggedIn(event.target.checked)}
              type="checkbox"
            />
            로그인 유지
          </label>
          <Link className="font-semibold text-blue-700" to="/find-account">
            ID / 비밀번호 찾기
          </Link>
        </div>

        {errors.server ? (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
            {errors.server}
          </p>
        ) : null}

        <Button
          className="h-12 w-full rounded-xl text-base font-bold"
          type="submit"
          variant="brand"
        >
          로그인
        </Button>

        <p className="pt-1 text-center text-xs text-slate-500">
          계정이 없으신가요?{' '}
          <Link className="font-bold text-blue-700" to="/signup">
            회원가입
          </Link>
        </p>
      </form>
    </Card>
  );
}
