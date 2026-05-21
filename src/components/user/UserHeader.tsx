import { Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import loginLogo from '../../assets/login-logo-transparent.png';
import { stockMocks } from '../../mocks/stockMock';

const pageTitles: Record<string, string> = {
  '/': '홈',
  '/home': '홈',
  '/market': '시세',
  '/order': '주문',
  '/contests': '대회',
  '/more': '더보기',
  '/balance': '잔고',
  '/watchlist': '관심 종목',
  '/seed-money/reset': '시드머니 초기화',
};

function getTitle(pathname: string, search: string) {
  if (pathname === '/market') {
    const searchParams = new URLSearchParams(search);
    const stockCode = searchParams.get('stockCode');
    const query = searchParams.get('query');
    const stock = stockMocks.find((item) => item.summary.stockCode === stockCode);

    return stock?.summary.stockName ?? (query ? '종목 검색' : '삼성전자');
  }

  if (pathname.startsWith('/contests')) {
    return '대회';
  }

  if (pathname.startsWith('/stocks')) {
    return '종목 상세';
  }

  return pageTitles[pathname] ?? 'FISA Invest';
}

export function UserHeader() {
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const isHome = pathname === '/' || pathname === '/home';
  const canGoBack = pathname === '/more' || pathname === '/market';
  const pageTitle = getTitle(pathname, search);
  const searchResults = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase();

    if (!keyword) {
      return [];
    }

    return stockMocks
      .filter(({ summary }) => {
        const name = summary.stockName.toLowerCase();
        const code = summary.stockCode.toLowerCase();

        return name.includes(keyword) || code.includes(keyword);
      })
      .slice(0, 5);
  }, [searchKeyword]);

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const keyword = searchKeyword.trim();

    if (!keyword) {
      return;
    }

    const exactStock = stockMocks.find(
      ({ summary }) => summary.stockName === keyword || summary.stockCode === keyword,
    );

    setIsSearchOpen(false);
    navigate(
      exactStock
        ? `/market?stockCode=${exactStock.summary.stockCode}`
        : `/market?query=${encodeURIComponent(keyword)}`,
    );
  };

  const handleSelectStock = (stockCode: string) => {
    setSearchKeyword('');
    setIsSearchOpen(false);
    navigate(`/market?stockCode=${stockCode}`);
  };

  return (
    <header className="sticky top-0 z-20 border-b border-blue-100 bg-white/95 backdrop-blur">
      {isSearchOpen ? (
        <form className="relative flex h-14 items-center gap-2 px-4" onSubmit={handleSearchSubmit}>
          <div className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-xl bg-[#F0F6FF] px-3">
            <Search className="shrink-0 text-[#6C88A4]" size={17} strokeWidth={2.5} />
            <input
              autoFocus
              className="min-w-0 flex-1 bg-transparent text-sm font-bold text-slate-950 outline-none placeholder:text-[#A3B4C6]"
              onChange={(event) => setSearchKeyword(event.target.value)}
              placeholder="종목명 또는 코드 검색"
              value={searchKeyword}
            />
          </div>
          <button
            aria-label="검색 닫기"
            className="flex h-9 w-9 items-center justify-center rounded-full text-[#6C88A4] hover:bg-[#F0F6FF]"
            onClick={() => {
              setSearchKeyword('');
              setIsSearchOpen(false);
            }}
            type="button"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
          {searchResults.length > 0 ? (
            <div className="absolute left-4 right-4 top-14 overflow-hidden rounded-xl border border-blue-100 bg-white shadow-lg">
              {searchResults.map(({ summary }) => (
                <button
                  className="flex w-full items-center justify-between px-4 py-3 text-left transition hover:bg-[#F8FBFF]"
                  key={summary.stockCode}
                  onMouseDown={() => handleSelectStock(summary.stockCode)}
                  type="button"
                >
                  <span>
                    <span className="block text-sm font-extrabold text-slate-950">
                      {summary.stockName}
                    </span>
                    <span className="block text-xs font-bold text-[#A3B4C6]">
                      {summary.stockCode}
                    </span>
                  </span>
                  <span className="text-sm font-extrabold text-[#1565C0]">
                    {summary.currentPrice.toLocaleString('ko-KR')}
                  </span>
                </button>
              ))}
            </div>
          ) : null}
        </form>
      ) : (
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            {canGoBack ? (
              <button
                aria-label="뒤로가기"
                className="relative flex h-8 w-8 items-center justify-center rounded-full text-[#1565C0] hover:bg-[#F0F6FF]"
                onClick={() => {
                  if (pathname === '/market') {
                    navigate('/home');
                    return;
                  }

                  navigate(-1);
                }}
                type="button"
              >
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[61%] text-3xl leading-none">
                  ‹
                </span>
              </button>
            ) : null}
            <Link className="flex min-w-0 items-center text-base font-extrabold text-[#1565C0]" to="/home">
              {isHome ? (
                <img
                  alt="매순간 매도 먼저"
                  className="h-8 w-auto object-contain"
                  src={loginLogo}
                />
              ) : (
                <span className="truncate">{pageTitle}</span>
              )}
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Link
              aria-label="알림"
              className="flex h-8 w-8 items-center justify-center rounded-full text-sm text-[#1565C0] hover:bg-[#F0F6FF]"
              to="/notifications"
            >
              🔔
            </Link>
            <button
              aria-label="검색"
              className="flex h-8 w-8 items-center justify-center rounded-full text-[#6C88A4] hover:bg-[#F0F6FF]"
              onClick={() => setIsSearchOpen(true)}
              type="button"
            >
              <Search size={18} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
