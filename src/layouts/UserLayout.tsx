import { useEffect, useRef } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ContestModeBanner } from '../components/user/ContestModeBanner';
import { BottomNavigation } from '../components/user/BottomNavigation';
import { RealtimeRecoveryModal } from '../components/common/RealtimeRecoveryModal';
import { UserHeader } from '../components/user/UserHeader';
import { ContestModeProvider } from '../contexts/ContestModeContext';
import { resetMarketSocket } from '../hooks/useMarketSocket';
import { isAuthenticated } from '../utils/tokenStorage';

export function UserLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (isAuthenticated()) {
      return;
    }

    navigate('/login', { replace: true });
  }, [navigate]);

  // 페이지 이동 시 스크롤을 맨 위로 (SPA 네비게이션은 스크롤이 유지되므로).
  // 뷰포트에 따라 실제 스크롤러가 main일 수도, window일 수도 있어 둘 다 리셋.
  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 });
    window.scrollTo({ top: 0 });
    // 페이지 이동 시 실시간 소스 초기화(누적 구독 비우기 → 한도 초과 예방)
    resetMarketSocket();
  }, [location.pathname]);

  return (
    <ContestModeProvider>
      <div className="app-cursor min-h-screen bg-slate-100 sm:flex sm:items-center sm:justify-center sm:px-4 sm:py-10">
        <div className="relative flex min-h-screen w-full flex-col overflow-hidden bg-[#F3F7FC] sm:min-h-[720px] sm:max-w-md sm:rounded-3xl sm:shadow-xl">
          <UserHeader />
          <ContestModeBanner />
          <main ref={mainRef} className="flex min-h-0 flex-1 flex-col overflow-y-auto">
            <Outlet />
          </main>
          <BottomNavigation />
        </div>
      </div>
      <RealtimeRecoveryModal />
    </ContestModeProvider>
  );
}
