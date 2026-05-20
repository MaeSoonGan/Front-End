import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AdminHeader } from '../components/admin/AdminHeader';
import { AdminSidebar } from '../components/admin/AdminSidebar';

export function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  function handleToggleSidebar() {
    setIsSidebarOpen(prev => !prev);
  }

  return (
    <div className="flex min-h-screen bg-slate-100">
      <AdminSidebar isOpen={isSidebarOpen} />
      <div className="min-w-0 flex-1">
        <AdminHeader isSidebarOpen={isSidebarOpen} onToggleSidebar={handleToggleSidebar} />
        <main className="p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
