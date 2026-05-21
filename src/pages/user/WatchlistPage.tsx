import { useMemo, useState } from 'react';
import { WatchlistGuideBanner } from '../../components/user/WatchlistGuideBanner';
import { WatchlistStockCard } from '../../components/user/WatchlistStockCard';
import { WatchlistTabs } from '../../components/user/WatchlistTabs';
import { watchlistMock } from '../../mocks/watchlistMock';
import type { WatchlistMarketType } from '../../types/watchlist';

export function WatchlistPage() {
  const [activeMarket, setActiveMarket] = useState<WatchlistMarketType>('DOMESTIC');
  const [watchlistItems, setWatchlistItems] = useState(watchlistMock);
  const filteredItems = useMemo(
    () => watchlistItems.filter((item) => item.marketType === activeMarket),
    [activeMarket, watchlistItems],
  );

  const handleRemoveWatchlist = (id: string) => {
    setWatchlistItems((current) => current.filter((item) => item.id !== id));
  };

  return (
    <div className="min-h-full bg-[#F3F7FC] px-4 pb-24 pt-4">
      <WatchlistGuideBanner />

      <section className="mt-4 flex items-center justify-between gap-3">
        <h1 className="text-base font-extrabold text-slate-950">
          내 관심종목 {filteredItems.length}개
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
        ) : filteredItems.length > 0 ? (
          <div className="space-y-3">
            {filteredItems.map((stock) => (
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

      <p className="mt-5 text-center text-xs font-bold text-[#6C88A4]">
        최대 30개까지 등록 가능 ({filteredItems.length}/30)
      </p>
    </div>
  );
}
