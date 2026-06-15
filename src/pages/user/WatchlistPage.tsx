import { useCallback, useEffect, useState } from 'react';
import { WatchlistGuideBanner } from '../../components/user/WatchlistGuideBanner';
import { WatchlistStockCard } from '../../components/user/WatchlistStockCard';
import { WatchlistTabs } from '../../components/user/WatchlistTabs';
import { marketApi } from '../../api/user/market';
import { parseApiError } from '../../api/parseApiError';
import { useContestMode } from '../../contexts/ContestModeContext';
import type { WatchlistMarketType, WatchlistStockItem } from '../../types/watchlist';

export function WatchlistPage() {
  const { contestId } = useContestMode();
  const cid = Number(contestId) || 0; // 일반 모드 = 0, 대회 모드 = 대회 ID
  const [activeMarket, setActiveMarket] = useState<WatchlistMarketType>('DOMESTIC');
  const [watchlistItems, setWatchlistItems] = useState<WatchlistStockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 가격은 ws 대신 RDS 스냅샷(getWatchlist)에서 주기 폴링으로 갱신 (실시간 순위와 동일 방식)
  const fetchWatchlist = useCallback(async (silent = false) => {
    // 해외는 백엔드 미지원 → 조회 생략
    if (activeMarket === 'OVERSEAS') {
      setWatchlistItems([]);
      setLoading(false);
      return;
    }
    if (!silent) {
      setLoading(true);
    }
    try {
      const data = await marketApi.getWatchlist('domestic', cid);
      setWatchlistItems(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (data.items ?? []).map((item: any) => ({
          id: item.code,
          stockName: item.name ?? '',
          stockCode: item.code,
          marketType: 'DOMESTIC' as WatchlistMarketType,
          exchange: item.market ?? '',
          currentPrice: Number(item.price ?? 0),
          changeRate: Number(item.changeRate ?? 0),
        })),
      );
      setError('');
    } catch (e) {
      if (!silent) {
        setError(parseApiError(e));
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, [activeMarket, cid]);

  useEffect(() => {
    fetchWatchlist();
    if (activeMarket === 'OVERSEAS') {
      return;
    }
    // 주기 폴링(15초)으로 스냅샷 가격 갱신 — 로딩 표시 없이 조용히
    const timer = window.setInterval(() => fetchWatchlist(true), 15000);
    return () => window.clearInterval(timer);
  }, [fetchWatchlist, activeMarket]);

  const handleRemoveWatchlist = async (id: string) => {
    try {
      await marketApi.deleteWatchlist(id, cid);
      setWatchlistItems((current) => current.filter((item) => item.id !== id));
    } catch (e) {
      setError(parseApiError(e));
    }
  };

  return (
    <div className="min-h-full bg-[#F3F7FC] px-4 pb-24 pt-4">
      <WatchlistGuideBanner />

      <section className="mt-4 flex items-center justify-between gap-3">
        <h1 className="text-base font-extrabold text-slate-950">
          내 관심종목 {watchlistItems.length}개
        </h1>
        <WatchlistTabs activeMarket={activeMarket} onChangeMarket={setActiveMarket} />
      </section>

      <section className="mt-3">
        {activeMarket === 'OVERSEAS' ? (
          <div className="rounded-xl border border-blue-100 bg-white px-4 py-16 text-center shadow-sm">
            <p className="text-sm font-extrabold text-slate-950">Coming soon...</p>
            <p className="mt-2 text-xs font-bold text-[#6C88A4]">
              해외 관심종목은 추후 제공 예정입니다.
            </p>
          </div>
        ) : loading ? (
          <p className="py-16 text-center text-xs font-bold text-[#6C88A4]">불러오는 중...</p>
        ) : error ? (
          <p className="py-16 text-center text-xs font-bold text-red-500">{error}</p>
        ) : watchlistItems.length > 0 ? (
          <div className="space-y-3">
            {watchlistItems.map((stock) => (
              <WatchlistStockCard
                key={stock.id}
                onRemove={handleRemoveWatchlist}
                stock={stock}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-blue-100 bg-white px-4 py-16 text-center shadow-sm">
            <p className="text-sm font-extrabold text-slate-950">등록된 관심종목이 없어요</p>
            <p className="mt-2 text-xs font-bold text-[#6C88A4]">
              종목 상세에서 하트를 눌러 관심종목을 추가해보세요
            </p>
          </div>
        )}
      </section>

      {activeMarket === 'DOMESTIC' ? (
        <p className="mt-5 text-center text-xs font-bold text-[#6C88A4]">
          최대 30개까지 등록 가능 ({watchlistItems.length}/30)
        </p>
      ) : null}
    </div>
  );
}
