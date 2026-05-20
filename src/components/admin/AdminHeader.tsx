import { useLocation } from 'react-router-dom';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';

const PAGE_NAME_MAP: Record<string, string> = {
  '/admin/dashboard': '대시보드',
  '/admin/users': '회원 목록',
  '/admin/suspensions': '계정 정지 이력',
  '/admin/seed-money': '시드머니 지급',
  '/admin/contests': '대회 목록',
  '/admin/rankings': '랭킹 관리',
  '/admin/notices': '공지사항',
  '/admin/monitoring': '모니터링',
  '/admin/audit-log': '감사 로그',
  '/admin/system': '시스템',
};

interface AdminHeaderProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export function AdminHeader({ isSidebarOpen, onToggleSidebar }: AdminHeaderProps) {
  const { pathname } = useLocation();
  const pageName = PAGE_NAME_MAP[pathname] ?? '관리자 콘솔';

  return (
    <header className="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3">
      <button
        onClick={onToggleSidebar}
        aria-label={isSidebarOpen ? '사이드바 닫기' : '사이드바 열기'}
        className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100"
      >
        {isSidebarOpen
          ? <PanelLeftClose size={20} />
          : <PanelLeftOpen size={20} />
        }
      </button>
      <h2 className="text-sm font-semibold text-slate-700">{pageName}</h2>
    </header>
  );
}
