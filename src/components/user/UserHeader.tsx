import { Link, useLocation } from 'react-router-dom';
import loginLogo from '../../assets/login-logo-transparent.png';

const pageTitles: Record<string, string> = {
  '/': '홈',
  '/home': '홈',
  '/market': '시세',
  '/order': '주문',
  '/contests': '대회',
  '/more': '더보기',
  '/balance': '잔고',
  '/watchlist': '관심 종목',
};

function getTitle(pathname: string) {
  if (pathname.startsWith('/contests')) {
    return '대회';
  }

  if (pathname.startsWith('/stocks')) {
    return '종목 상세';
  }

  return pageTitles[pathname] ?? 'FISA Invest';
}

export function UserHeader() {
  const { pathname } = useLocation();
  const isHome = pathname === '/' || pathname === '/home';

  return (
    <header className="sticky top-0 z-20 border-b border-blue-100 bg-white/95 backdrop-blur">
      <div className="flex h-14 items-center justify-between px-4">
        <Link className="flex items-center text-sm font-extrabold text-[#1565C0]" to="/home">
          {isHome ? (
            <img
              alt="매순간 매도 먼저"
              className="h-8 w-auto object-contain"
              src={loginLogo}
            />
          ) : (
            getTitle(pathname)
          )}
        </Link>
        <div className="flex items-center gap-2">
          <Link
            aria-label="알림"
            className="flex h-8 w-8 items-center justify-center rounded-full text-sm text-[#1565C0] hover:bg-[#F0F6FF]"
            to="/notifications"
          >
            🔔
          </Link>
          <Link
            aria-label="검색"
            className="flex h-8 w-8 items-center justify-center rounded-full text-sm text-[#6C88A4] hover:bg-[#F0F6FF]"
            to="/market"
          >
            🔍
          </Link>
        </div>
      </div>
    </header>
  );
}
