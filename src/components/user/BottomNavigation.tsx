import { NavLink } from 'react-router-dom';
import { cn } from '../../utils/cn';

const items = [
  { label: '홈', to: '/home', icon: '🏠' },
  { label: '잔고', to: '/balance', icon: '💼' },
  { label: '관심 종목', to: '/watchlist', icon: '⭐' },
  { label: '대회', to: '/contests', icon: '🏆' },
  { label: '더보기', to: '/more', icon: '☰' },
];

export function BottomNavigation() {
  return (
    <nav className="absolute inset-x-0 bottom-0 z-20 border-t border-blue-100 bg-white/95 backdrop-blur">
      <div className="grid h-16 grid-cols-5 px-1">
        {items.map((item) => (
          <NavLink
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-bold transition',
                isActive ? 'text-[#1565C0]' : 'text-[#A3B4C6]',
              )
            }
            key={item.to}
            to={item.to}
          >
            {({ isActive }) => (
              <>
                <span
                  className={cn(
                    'flex h-6 w-6 items-center justify-center rounded-full text-sm',
                    isActive && 'bg-[#E5F4FF]',
                  )}
                >
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
