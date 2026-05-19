import { Outlet } from 'react-router-dom';
import { BottomNavigation } from '../components/user/BottomNavigation';
import { UserHeader } from '../components/user/UserHeader';

export function UserLayout() {
  return (
    <div className="min-h-screen bg-slate-100 pb-16 sm:pb-0">
      <UserHeader />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
      <BottomNavigation />
    </div>
  );
}
