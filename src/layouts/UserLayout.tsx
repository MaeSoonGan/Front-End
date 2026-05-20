import { Outlet } from 'react-router-dom';
import { BottomNavigation } from '../components/user/BottomNavigation';
import { UserHeader } from '../components/user/UserHeader';

export function UserLayout() {
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
