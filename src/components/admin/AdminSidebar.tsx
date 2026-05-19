import { NavLink } from 'react-router-dom';
import { cn } from '../../utils/cn';

const items = [
  { label: '대시보드', to: '/admin/dashboard' },
  { label: '사용자', to: '/admin/users' },
  { label: '대회', to: '/admin/contests' },
  { label: '공지', to: '/admin/notices' },
  { label: '시스템', to: '/admin/system' },
];

export function AdminSidebar() {
  return (
    <aside className="hidden w-60 border-r border-slate-200 bg-white p-4 md:block">
      <div className="mb-6 text-lg font-bold text-slate-950">Admin</div>
      <nav className="space-y-1">
        {items.map((item) => (
          <NavLink
            className={({ isActive }) =>
              cn(
                'block rounded-md px-3 py-2 text-sm font-medium',
                isActive ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100',
              )
            }
            key={item.to}
            to={item.to}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
