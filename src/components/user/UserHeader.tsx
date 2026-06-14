import { Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import loginLogo from '../../assets/login-logo-transparent.png';
import { useContestMode } from '../../contexts/ContestModeContext';
import { marketApi } from '../../api/user/market';

interface SearchResultItem {
  stockCode: string;
  stockName: string;
  currentPrice: number;
}

const pageTitles: Record<string, string> = {
  '/': '홈',
  '/home': '홈',
  '/market': '시세',
  '/order': '주문',
  '/contests': '대회',
  '/my-contests': '참여 중인 대회',
  '/more': '더보기',
  '/balance': '잔고',
  '/watchlist': '관심 종목',
  '/ranking': '대회 랭킹',
  '/notices': '공지',
  '/notifications': '알림',
  '/notifications/settings': '알림 설정',
  '/profile/edit': '정보 수정',
  '/seed-money/reset': '시드머니 초기화',
};

function stripContestPrefix(pathname: string) {
  return pathname.replace(/^\/contests\/[^/]+/, '') || '/home';
}

function getTitle(pathname: string, search: string) {
  if (pathname === '/market') {
    const searchParams = new URLSearchParams(search);
    // 종목명은 컴포넌트에서 API로 받아 덮어씀. 여기선 기본 제목만.
    return searchParams.get('query') ? '종목 검색' : '시세';
  }

  if (pathname.startsWith('/contests')) {
    return '대회';
  }

  if (pathname.startsWith('/my-contests')) {
    return '참여 중인 대회';
  }

  if (pathname.startsWith('/stocks')) {
    return '종목 상세';
  }

  if (pathname.startsWith('/notices/')) {
    return '공지사항';
  }

  return pageTitles[pathname] ?? 'FISA Invest';
}

export function UserHeader() {
  const location = useLocation();
  const { pathname, search, state } = location;
  const navigate = useNavigate();
  const { contest, getContestPath, isContestMode } = useContestMode();
  const titlePathname = isContestMode ? stripContestPrefix(pathname) : pathname;
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const isHome = pathname === '/' || pathname === '/home';
  const canGoBackInContestMode =
    isContestMode &&
    (titlePathname === '/balance' ||
      titlePathname === '/watchlist' ||
      titlePathname === '/market' ||
      titlePathname === '/ranking');
  const canGoBack =
    pathname === '/more' ||
    pathname === '/market' ||
    pathname === '/balance' ||
    pathname === '/watchlist' ||
    pathname === '/my-contests' ||
    pathname === '/contests' ||
    canGoBackInContestMode ||
    titlePathname === '/ranking' ||
    titlePathname === '/notices' ||
    titlePathname.startsWith('/notices/') ||
    titlePathname === '/notifications' ||
    titlePathname === '/notifications/settings' ||
    titlePathname === '/profile/edit' ||
    titlePathname === '/seed-money/reset';
  const contestTitle = contest ? `${contest.startAt.slice(0, 4)}년 ${contest.title}` : '대회';

  // 시세 페이지 헤더 제목용 종목명 (API 조회)
  const marketStockCode =
    titlePathname === '/market' ? new URLSearchParams(search).get('stockCode') : null;
  const [marketStockName, setMarketStockName] = useState<string | null>(null);

  useEffect(() => {
    if (!marketStockCode) {
      setMarketStockName(null);
      return;
    }

    let active = true;
    marketApi
      .getStockPrice(marketStockCode)
      .then((data) => {
        if (active) setMarketStockName(data?.name ?? null);
      })
      .catch(() => {
        if (active) setMarketStockName(null);
      });

    return () => {
      active = false;
    };
  }, [marketStockCode]);

  const baseTitle =
    isContestMode && titlePathname === '/home' ? contestTitle : getTitle(titlePathname, search);
  const pageTitle =
    titlePathname === '/market' && marketStockName ? marketStockName : baseTitle;
  const isNotificationListPage = titlePathname === '/notifications';
  const previousPath =
    typeof state === 'object' &&
    state !== null &&
    'from' in state &&
    typeof state.from === 'string'
      ? state.from
      : null;
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);

  useEffect(() => {
    const keyword = searchKeyword.trim();
    if (!keyword) {
      setSearchResults([]);
      return;
    }

    let active = true;
    const timer = window.setTimeout(() => {
      marketApi.searchStocks(keyword, 'KOSPI')
        .then((data) => {
          if (!active) return;
          setSearchResults(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (data.stocks ?? []).slice(0, 5).map((s: any) => ({
              stockCode: s.stockCode,
              stockName: s.stockName ?? '',
              currentPrice: Number(s.currentPrice ?? 0),
            })),
          );
        })
        .catch(() => { if (active) setSearchResults([]); });
    }, 250);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [searchKeyword]);

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const keyword = searchKeyword.trim();

    if (!keyword) {
      return;
    }

    const exactStock = searchResults.find(
      (item) => item.stockName === keyword || item.stockCode === keyword,
    );

    setIsSearchOpen(false);
    const marketPath = isContestMode ? getContestPath('/market') : '/market';
    navigate(
      exactStock
        ? `${marketPath}?stockCode=${exactStock.stockCode}`
        : `${marketPath}?query=${encodeURIComponent(keyword)}`,
    );
  };

  const handleSelectStock = (stockCode: string) => {
    setSearchKeyword('');
    setIsSearchOpen(false);
    navigate(`${isContestMode ? getContestPath('/market') : '/market'}?stockCode=${stockCode}`);
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
              {searchResults.map((item) => (
                <button
                  className="flex w-full items-center justify-between px-4 py-3 text-left transition hover:bg-[#F8FBFF]"
                  key={item.stockCode}
                  onMouseDown={() => handleSelectStock(item.stockCode)}
                  type="button"
                >
                  <span>
                    <span className="block text-sm font-extrabold text-slate-950">
                      {item.stockName}
                    </span>
                    <span className="block text-xs font-bold text-[#A3B4C6]">
                      {item.stockCode}
                    </span>
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
                  if (
                    pathname === '/market' ||
                    pathname === '/balance' ||
                    pathname === '/watchlist' ||
                    pathname === '/my-contests' ||
                    pathname === '/contests'
                  ) {
                    if (pathname === '/my-contests') {
                      navigate('/more');
                      return;
                    }

                    const searchParams = new URLSearchParams(search);

                    if (pathname === '/market') {
                      const from = searchParams.get('from');
                      if (from === 'market-ranking') {
                        navigate(-1); // 순위에서 들어온 경우: 히스토리 pop → 순위로 복귀(루프 방지)
                        return;
                      }
                      navigate(from === 'balance' ? '/balance' : from === 'watchlist' ? '/watchlist' : '/home');
                      return;
                    }

                    navigate('/home');
                    return;
                  }

                  if (isContestMode && titlePathname === '/market') {
                    const from = new URLSearchParams(search).get('from');
                    if (from === 'market-ranking') {
                      navigate(-1); // 순위에서 들어온 경우: 히스토리 pop → 순위로 복귀(루프 방지)
                      return;
                    }
                    navigate(
                      from === 'balance'
                        ? getContestPath('/balance')
                        : from === 'watchlist'
                          ? getContestPath('/watchlist')
                          : getContestPath('/home'),
                    );
                    return;
                  }

                  if (titlePathname === '/notifications/settings') {
                    if (window.history.length > 1) {
                      navigate(-1);
                    } else {
                      navigate(isContestMode ? getContestPath('/more') : '/more');
                    }
                    return;
                  }

                  if (titlePathname === '/notifications') {
                    if (previousPath) {
                      navigate(previousPath);
                    } else if (window.history.length > 1) {
                      navigate(-1);
                    } else {
                      navigate(isContestMode ? getContestPath('/more') : '/more');
                    }
                    return;
                  }

                  if (titlePathname.startsWith('/notices/')) {
                    navigate(isContestMode ? getContestPath('/notices') : '/notices');
                    return;
                  }

                  if (titlePathname === '/notices') {
                    navigate(isContestMode ? getContestPath('/more') : '/more');
                    return;
                  }

                  if (
                    isContestMode &&
                    (titlePathname === '/balance' || titlePathname === '/watchlist')
                  ) {
                    navigate(getContestPath('/home'));
                    return;
                  }

                  if (titlePathname === '/ranking') {
                    if (isContestMode) {
                      navigate(getContestPath('/home'));
                    } else if (window.history.length > 1) {
                      navigate(-1);
                    } else {
                      navigate('/my-contests');
                    }
                    return;
                  }

                  if (titlePathname === '/profile/edit') {
                    if (window.history.length > 1) {
                      navigate(-1);
                    } else {
                      navigate(isContestMode ? getContestPath('/more') : '/more');
                    }
                    return;
                  }

                  if (titlePathname === '/seed-money/reset') {
                    navigate(isContestMode ? getContestPath('/more') : '/more');
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
            <Link
              className="flex min-w-0 items-center text-base font-extrabold text-[#1565C0]"
              to={isContestMode ? getContestPath('/home') : '/home'}
            >
              {isHome || pageTitle === 'FISA Invest' ? (
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
          {!isNotificationListPage ? (
            <div className="flex items-center gap-2">
              <Link
                aria-label="알림"
                className="flex h-8 w-8 items-center justify-center rounded-full text-sm text-[#1565C0] hover:bg-[#F0F6FF]"
                state={{ from: `${pathname}${search}` }}
                to={isContestMode ? getContestPath('/notifications') : '/notifications'}
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
          ) : null}
        </div>
      )}
    </header>
  );
}
