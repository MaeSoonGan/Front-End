import { Outlet } from 'react-router-dom';

export function InfraLayout() {
  return (
    <div className="app-cursor min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 px-4 py-4">
        <p className="text-sm font-medium text-slate-300">인프라 관제</p>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
