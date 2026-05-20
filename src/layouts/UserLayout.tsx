import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { BottomNavigation } from '../components/user/BottomNavigation';
import { UserHeader } from '../components/user/UserHeader';

const MOCK_AUTH_KEY = 'mockAuthStatus';
const MOCK_AUTHENTICATED = 'authenticated';

export function UserLayout() {
  const navigate = useNavigate();

  useEffect(() => {
    if (window.sessionStorage.getItem(MOCK_AUTH_KEY) === MOCK_AUTHENTICATED) {
      return;
    }

    // TODO: API/토큰 연동 후 실제 인증 상태 기반 보호 라우트로 교체합니다.
    navigate('/login', { replace: true });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-slate-100 sm:flex sm:items-center sm:justify-center sm:px-4 sm:py-10">
      <div className="relative min-h-screen w-full overflow-hidden bg-[#F3F7FC] sm:min-h-[720px] sm:max-w-md sm:rounded-3xl sm:shadow-xl">
        <UserHeader />
        <main className="h-[calc(100vh-7.5rem)] overflow-y-auto sm:h-[600px]">
          <Outlet />
        </main>
        <BottomNavigation />
      </div>
    </div>
  );
}
