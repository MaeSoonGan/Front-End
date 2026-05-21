import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MarketTabs } from '../../components/user/MarketTabs';
import { OrderBookList } from '../../components/user/OrderBookList';
import { StockChartSection } from '../../components/user/StockChartSection';
import { StockInfoGrid } from '../../components/user/StockInfoGrid';
import { StockPriceSummary } from '../../components/user/StockPriceSummary';
import { TradeActionButtons } from '../../components/user/TradeActionButtons';
import { stockMock, stockMocks } from '../../mocks/stockMock';
import type { ChartPeriod, ChartType, MarketTab } from '../../types/stock';
import { cn } from '../../utils/cn';

function getInitialTab(tab: string | null): MarketTab {
  if (tab === 'chart' || tab === 'trades') {
    return tab;
  }

  return 'orderBook';
}

export function MarketPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<MarketTab>(() => getInitialTab(searchParams.get('tab')));
  const [activePeriod, setActivePeriod] = useState<ChartPeriod>('day');
  const [activeChartType, setActiveChartType] = useState<ChartType>('line');
  const [isFavorite, setIsFavorite] = useState(false);
  const stockCode = searchParams.get('stockCode');
  const searchQuery = searchParams.get('query')?.trim() ?? '';
  const searchResults = searchQuery
    ? stockMocks.filter(({ summary: item }) => {
        const keyword = searchQuery.toLowerCase();

        return (
          item.stockName.toLowerCase().includes(keyword) ||
          item.stockCode.toLowerCase().includes(keyword)
        );
      })
    : [];
  const selectedStock =
    stockMocks.find((stock) => stock.summary.stockCode === stockCode) ??
    searchResults[0] ??
    stockMock;
  const { summary, orderBook, chart } = selectedStock;

  const handleToggleFavorite = () => {
    // TODO: 관심종목 API 연동 후 서버 상태와 동기화합니다.
    setIsFavorite((current) => !current);
  };

  const handleChangeTab = (tab: MarketTab) => {
    setActiveTab(tab);
    const nextSearchParams = new URLSearchParams(searchParams);

    if (tab === 'orderBook') {
      nextSearchParams.delete('tab');
    } else {
      nextSearchParams.set('tab', tab);
    }

    setSearchParams(nextSearchParams);
  };

  return (
    <div className="min-h-full bg-[#F3F7FC]">
      <StockPriceSummary
        isFavorite={isFavorite}
        onToggleFavorite={handleToggleFavorite}
        summary={summary}
      />
      <StockInfoGrid summary={summary} />
      <MarketTabs activeTab={activeTab} onChangeTab={handleChangeTab} />

      {searchQuery ? (
        <section className="mx-4 mt-4 rounded-xl border border-blue-100 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-extrabold text-slate-950">검색 결과</h2>
            <span className="text-xs font-bold text-[#6C88A4]">{searchQuery}</span>
          </div>
          <div className="mt-3 space-y-2">
            {searchResults.length > 0 ? (
              searchResults.map(({ summary: item }) => (
                <button
                  className={cn(
                    'flex w-full items-center justify-between rounded-xl border px-3 py-3 text-left transition',
                    item.stockCode === summary.stockCode
                      ? 'border-[#1565C0] bg-[#F0F6FF]'
                      : 'border-blue-100 hover:bg-[#F8FBFF]',
                  )}
                  key={item.stockCode}
                  onClick={() => navigate(`/market?stockCode=${item.stockCode}`)}
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
                  <span className="text-sm font-extrabold text-[#1565C0]">
                    {item.currentPrice.toLocaleString('ko-KR')}
                  </span>
                </button>
              ))
            ) : (
              <p className="rounded-xl bg-[#F0F6FF] px-3 py-4 text-center text-xs font-bold text-[#6C88A4]">
                일치하는 mock 종목이 없습니다.
              </p>
            )}
          </div>
        </section>
      ) : null}

      {activeTab === 'orderBook' ? (
        <OrderBookList orderBook={orderBook} summary={summary} />
      ) : activeTab === 'chart' ? (
        <StockChartSection
          activeChartType={activeChartType}
          activePeriod={activePeriod}
          chartData={chart[activePeriod]}
          onChangeChartType={setActiveChartType}
          onChangePeriod={setActivePeriod}
        />
      ) : (
        <section className="mx-4 mt-4 rounded-xl border border-blue-100 bg-white px-4 py-16 text-center shadow-sm">
          {/* TODO: 체결 상세 화면은 추후 이슈에서 구현합니다. */}
          <p className="text-sm font-extrabold text-[#1565C0]">준비 중</p>
          <p className="mt-2 text-xs font-bold text-[#6C88A4]">체결 화면은 곧 연결됩니다.</p>
        </section>
      )}

      <TradeActionButtons stockCode={summary.stockCode} />
    </div>
  );
}
