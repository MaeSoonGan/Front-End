import { NavLink } from 'react-router-dom';
import { useContestMode } from '../../contexts/ContestModeContext';
import { cn } from '../../utils/cn';

const items = [
  { label: '홈', to: '/home', icon: '🏠' },
  { label: '잔고·체결', to: '/balance', icon: '💼' },
  { label: '관심 종목', to: '/watchlist', icon: '⭐' },
  { label: '대회', to: '/contests', icon: '🏆' },
  { label: '더보기', to: '/more', icon: '☰' },
];

export function BottomNavigation() {
  const { getContestPath, isContestMode, leaveContest } = useContestMode();

  return (
    <nav className="z-20 shrink-0 border-t border-blue-100 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <div className="grid h-16 grid-cols-5 px-1">
        {items.map((item) => {
          const isContestItem = item.to === '/contests';
          const isMoreItem = item.to === '/more';
          const to = isContestMode
            ? isContestItem
              ? getContestPath('/ranking')
              : getContestPath(item.to)
            : item.to;
          const label = isContestMode && isContestItem ? '랭킹' : item.label;

          if (isContestMode && isMoreItem) {
            return (
              <button
                className="flex flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-bold text-[#A3B4C6] transition hover:text-[#1565C0]"
                key={item.to}
                onClick={leaveContest}
                type="button"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full text-sm">
                  🚪
                </span>
                <span>나가기</span>
              </button>
            );
          }

          return (
            <NavLink
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-bold transition',
                  isActive ? 'text-[#1565C0]' : 'text-[#A3B4C6]',
                )
              }
              key={item.to}
              to={to}
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
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
