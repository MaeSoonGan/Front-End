import { Outlet } from 'react-router-dom';

export function AuthLayout() {
  return (
    <main className="min-h-screen bg-white sm:flex sm:items-center sm:justify-center sm:bg-slate-100 sm:px-4 sm:py-10">
      <Outlet />
    </main>
  );
}
