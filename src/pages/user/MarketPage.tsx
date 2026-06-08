import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MarketTabs } from '../../components/user/MarketTabs';
import { OrderBottomSheet } from '../../components/user/OrderBottomSheet';
import { OrderBookList } from '../../components/user/OrderBookList';
import { StockChartSection } from '../../components/user/StockChartSection';
import { StockInfoGrid } from '../../components/user/StockInfoGrid';
import { StockPriceSummary } from '../../components/user/StockPriceSummary';
import { TradeActionButtons } from '../../components/user/TradeActionButtons';
import { TradeHistoryTab } from '../../components/user/TradeHistoryTab';
import { stockMock, stockMocks } from '../../mocks/stockMock';
import { marketApi } from '../../api/user/market';
import type { OrderSide, OrderStockInfo } from '../../types/order';
import type {
  ChartPeriod,
  ChartType,
  MarketTab,
  OrderBookData,
  StockSummary,
} from '../../types/stock';
import { cn } from '../../utils/cn';

function getInitialTab(tab: string | null): MarketTab {
  if (tab === 'chart' || tab === 'trades') {
    return tab;
  }

  return 'orderBook';
}

function getInitialOrderSide(orderSide: string | null): OrderSide | null {
  if (orderSide === 'BUY' || orderSide === 'SELL') {
    return orderSide;
  }

  return null;
}

export function MarketPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<MarketTab>(() => getInitialTab(searchParams.get('tab')));
  const [activePeriod, setActivePeriod] = useState<ChartPeriod>('day');
  const [activeChartType, setActiveChartType] = useState<ChartType>('line');
  const [isFavorite, setIsFavorite] = useState(false);
  const [orderSheetSide, setOrderSheetSide] = useState<OrderSide | null>(() =>
    getInitialOrderSide(searchParams.get('orderSide')),
  );
  const stockCode = searchParams.get('stockCode');
  const searchQuery = searchParams.get('query')?.trim() ?? '';

  // 종목 검색 (API)
  const [searchResults, setSearchResults] = useState<
    { stockCode: string; stockName: string; currentPrice: number }[]
  >([]);
  useEffect(() => {
    if (!searchQuery) {
      setSearchResults([]);
      return;
    }
    let active = true;
    marketApi.searchStocks(searchQuery, 'KOSPI')
      .then((data) => {
        if (!active) return;
        setSearchResults(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (data.stocks ?? []).map((s: any) => ({
            stockCode: s.stockCode,
            stockName: s.stockName ?? '',
            currentPrice: Number(s.currentPrice ?? 0),
          })),
        );
      })
      .catch(() => { if (active) setSearchResults([]); });
    return () => { active = false; };
  }, [searchQuery]);

  // 차트/체결 탭 mock용 종목 (백엔드 API 없음)
  const selectedStock =
    stockMocks.find((stock) => stock.summary.stockCode === stockCode) ?? stockMock;
  // 차트/체결 탭은 백엔드 API가 없어 mock 유지, summary/orderBook만 실데이터로 덮어씀
  const { chart, tradeTrend, tradeHistory } = selectedStock;

  const [apiSummary, setApiSummary] = useState<StockSummary | null>(null);
  const [apiOrderBook, setApiOrderBook] = useState<OrderBookData | null>(null);
  const [loading, setLoading] = useState(true);

  // 현재가 + 일별정보 + 호가 조회
  useEffect(() => {
    if (!stockCode) return;
    let active = true;
    setLoading(true);
    Promise.all([
      marketApi.getStockPrice(stockCode),
      marketApi.getStockDailyInfo(stockCode).catch(() => null),
      marketApi.getStockOrderbook(stockCode).catch(() => null),
    ])
      .then(([price, daily, orderbook]) => {
        if (!active) return;
        setApiSummary({
          stockName: price.name ?? '',
          stockCode: price.code,
          currentPrice: Number(price.price ?? 0),
          changeAmount: Number(price.change ?? 0),
          changeRate: Number(price.changeRate ?? 0),
          volume: Number(price.volume ?? 0).toLocaleString('ko-KR'),
          openPrice: Number(daily?.open ?? 0),
          highPrice: Number(daily?.high ?? 0),
          lowPrice: Number(daily?.low ?? 0),
          previousClose: Number(daily?.prevClose ?? 0),
        });
        if (orderbook) {
          setApiOrderBook({
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            askOrders: (orderbook.asks ?? []).map((l: any) => ({ price: Number(l.price), quantity: Number(l.quantity), changeRate: 0 })),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            bidOrders: (orderbook.bids ?? []).map((l: any) => ({ price: Number(l.price), quantity: Number(l.quantity), changeRate: 0 })),
          });
        }
      })
      .catch(() => {})
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [stockCode]);

  // 관심종목 여부 조회
  useEffect(() => {
    if (!stockCode) return;
    marketApi.getWatchlist('domestic')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then((data) => setIsFavorite((data.items ?? []).some((i: any) => i.code === stockCode)))
      .catch(() => {});
  }, [stockCode]);

  const summary = apiSummary;
  const orderBook = apiOrderBook ?? { askOrders: [], bidOrders: [] };

  const orderStock: OrderStockInfo | null = summary
    ? {
        stockName: summary.stockName,
        stockCode: summary.stockCode,
        market: 'KOSPI',
        currentPrice: summary.currentPrice,
        changeRate: summary.changeRate,
      }
    : null;

  const handleToggleFavorite = async () => {
    if (!stockCode) return;
    const next = !isFavorite;
    setIsFavorite(next); // 낙관적 업데이트
    try {
      if (next) {
        await marketApi.addWatchlist(stockCode);
      } else {
        await marketApi.deleteWatchlist(stockCode);
      }
    } catch {
      setIsFavorite(!next); // 실패 시 롤백
    }
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

  const handleCloseOrderSheet = () => {
    setOrderSheetSide(null);
    const nextSearchParams = new URLSearchParams(searchParams);

    nextSearchParams.delete('orderSide');
    setSearchParams(nextSearchParams);
  };

  if (loading || !summary) {
    return (
      <div className="min-h-full bg-[#F3F7FC]">
        <p className="py-20 text-center text-xs font-bold text-[#6C88A4]">
          {loading ? '불러오는 중...' : '종목 정보를 불러올 수 없습니다.'}
        </p>
      </div>
    );
  }

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
              searchResults.map((item) => (
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
                일치하는 종목이 없습니다.
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
        <TradeHistoryTab trades={tradeHistory} trendData={tradeTrend} />
      )}

      <TradeActionButtons onSelectSide={setOrderSheetSide} />
      {orderSheetSide ? (
        <OrderBottomSheet
          initialSide={orderSheetSide}
          isOpen={Boolean(orderSheetSide)}
          key={`${summary.stockCode}-${orderSheetSide}`}
          onClose={handleCloseOrderSheet}
          stock={orderStock}
        />
      ) : null}
    </div>
  );
}
