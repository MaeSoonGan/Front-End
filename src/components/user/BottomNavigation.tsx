import { NavLink } from 'react-router-dom';
import { cn } from '../../utils/cn';

const items = [
  { label: '홈', to: '/home' },
  { label: '시장', to: '/market' },
  { label: '주문', to: '/order' },
  { label: '관심', to: '/watchlist' },
  { label: '더보기', to: '/more' },
];

export function BottomNavigation() {
  return (
    <nav className="fixed inset-x-0 bottom-0 border-t border-slate-200 bg-white sm:hidden">
      <div className="grid h-14 grid-cols-5">
        {items.map((item) => (
          <NavLink
            className={({ isActive }) =>
              cn(
                'flex items-center justify-center text-xs font-medium',
                isActive ? 'text-slate-950' : 'text-slate-500',
              )
            }
            key={item.to}
            to={item.to}
          >
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
