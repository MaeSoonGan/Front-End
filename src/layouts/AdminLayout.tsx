import { useState, useCallback, type ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import { AdminHeader } from '../components/admin/AdminHeader';
import { AdminSidebar } from '../components/admin/AdminSidebar';
import { AlertCountProvider } from '../contexts/AlertCountContext';
import { AdminPageActionsContext } from '../contexts/AdminPageActionsContext';

export function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [headerActions, setHeaderActions] = useState<ReactNode>(null);

  const handleToggleSidebar = useCallback(() => setIsSidebarOpen(prev => !prev), []);
  const setActions = useCallback((actions: ReactNode) => setHeaderActions(actions), []);

  return (
    <AlertCountProvider>
      <AdminPageActionsContext.Provider value={setActions}>
        <div className="flex min-h-screen bg-slate-100">
          <AdminSidebar isOpen={isSidebarOpen} />
          <div className="min-w-0 flex-1">
            <AdminHeader
              isSidebarOpen={isSidebarOpen}
              onToggleSidebar={handleToggleSidebar}
              actions={headerActions}
            />
            <main className="p-4 md:p-6">
              <Outlet />
            </main>
          </div>
        </div>
      </AdminPageActionsContext.Provider>
    </AlertCountProvider>
  );
}
