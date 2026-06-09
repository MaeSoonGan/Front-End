import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UserX,
  Coins,
  Trophy,
  Medal,
  Megaphone,
  Monitor,
  FileText,
  LogOut,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAlertCount } from '../../contexts/AlertCountContext';
import { getAdminInfo, clearAdminAuth } from '../../utils/adminAuth';
import { clearTokens } from '../../utils/tokenStorage';

interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  badge?: number;
  end?: boolean;
}

interface NavGroup {
  groupLabel: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    groupLabel: '메인',
    items: [
      { label: '대시보드', to: '/admin/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    groupLabel: '회원 관리',
    items: [
      { label: '회원 목록',     to: '/admin/users',       icon: Users },
      { label: '계정 정지 이력', to: '/admin/suspensions', icon: UserX },
      { label: '시드머니 지급', to: '/admin/seed-money',  icon: Coins },
    ],
  },
  {
    groupLabel: '대회 관리',
    items: [
      { label: '대회 목록', to: '/admin/contests', icon: Trophy, end: true },
      { label: '랭킹 관리', to: '/admin/rankings',  icon: Medal },
    ],
  },
  {
    groupLabel: '콘텐츠',
    items: [
      { label: '공지사항', to: '/admin/notices', icon: Megaphone },
    ],
  },
  {
    groupLabel: '시스템',
    items: [
      { label: '모니터링', to: '/admin/monitoring', icon: Monitor },
      { label: '감사 로그', to: '/admin/audit-log',  icon: FileText },
    ],
  },
];

const navItemClass = (isActive: boolean) =>
  cn(
    'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
    isActive
      ? 'border-l-2 border-[#1565C0] bg-[#E8F0FE] text-[#1565C0]'
      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
  );

interface AdminSidebarProps {
  isOpen: boolean;
}

export function AdminSidebar({ isOpen }: AdminSidebarProps) {
  const { alertCount } = useAlertCount();
  const navigate = useNavigate();
  const admin = getAdminInfo();
  const adminName = admin?.nickname || admin?.loginId || '관리자';
  const adminRole = (admin?.role ?? '').replace(/_/g, ' ') || 'ADMIN';

  const handleLogout = () => {
    if (!window.confirm('로그아웃하시겠습니까?')) {
      return;
    }
    clearAdminAuth();
    clearTokens();
    navigate('/login', { replace: true });
  };

  return (
    <aside
      className={cn(
        'sticky top-0 flex h-screen shrink-0 flex-col overflow-hidden border-r border-slate-200 bg-white transition-all duration-200',
        isOpen ? 'w-60' : 'w-0 border-none',
      )}
    >
      <div className="flex w-60 flex-1 flex-col">
        {/* 로고 */}
        <div className="flex items-center gap-3 bg-[#1565C0] px-4 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-white/20">
            <LayoutDashboard size={18} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">모의투자 Admin</p>
            <p className="text-xs text-white/70">운영자 시스템</p>
          </div>
        </div>

        {/* 내비게이션 */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {NAV_GROUPS.map(group => (
            <div key={group.groupLabel} className="mb-4">
              <p className="mb-1 px-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                {group.groupLabel}
              </p>
              <ul className="space-y-0.5">
                {group.items.map(item => {
                  const Icon = item.icon;
                  return (
                    <li key={item.to}>
                      <NavLink
                        to={item.to}
                        end={item.end}
                        className={({ isActive }) => navItemClass(isActive)}
                      >
                        <Icon size={16} className="shrink-0" />
                        <span>{item.label}</span>
                        {item.to === '/admin/monitoring' && alertCount > 0 && (
                          <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-xs font-bold text-white">
                            {alertCount}
                          </span>
                        )}
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* 하단 계정 정보 + 로그아웃 */}
        <div className="border-t border-slate-200 px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1565C0] text-sm font-bold text-white">
                {adminName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-900">{adminName}</p>
                <p className="truncate text-xs text-slate-500">{adminRole}</p>
              </div>
            </div>
            <button
              aria-label="로그아웃"
              className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-red-500"
              onClick={handleLogout}
              title="로그아웃"
              type="button"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
