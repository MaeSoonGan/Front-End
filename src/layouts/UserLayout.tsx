import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { ContestModeBanner } from '../components/user/ContestModeBanner';
import { BottomNavigation } from '../components/user/BottomNavigation';
import { UserHeader } from '../components/user/UserHeader';
import { ContestModeProvider } from '../contexts/ContestModeContext';
import { isAuthenticated } from '../utils/tokenStorage';

export function UserLayout() {
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated()) {
      return;
    }

    navigate('/login', { replace: true });
  }, [navigate]);

  return (
    <ContestModeProvider>
      <div className="min-h-screen bg-slate-100 sm:flex sm:items-center sm:justify-center sm:px-4 sm:py-10">
        <div className="relative flex min-h-screen w-full flex-col overflow-hidden bg-[#F3F7FC] sm:min-h-[720px] sm:max-w-md sm:rounded-3xl sm:shadow-xl">
          <UserHeader />
          <ContestModeBanner />
          <main className="flex min-h-0 flex-1 flex-col overflow-y-auto">
            <Outlet />
          </main>
          <BottomNavigation />
        </div>
      </div>
    </ContestModeProvider>
  );
}
