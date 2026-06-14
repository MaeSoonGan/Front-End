import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useContestMode } from '../../contexts/ContestModeContext';
import { marketApi } from '../../api/user/market';

interface RankingItem {
  rank: number;
  name: string;
  code: string;
  price: string;
  changeRate: string;
}

function getChangeClass(changeRate: string) {
  if (changeRate.startsWith('-')) return 'text-blue-600';
  if (changeRate.startsWith('+')) return 'text-red-500';
  return 'text-emerald-600';
}

function formatPrice(value: number) {
  return Math.round(value).toLocaleString('ko-KR');
}

function formatSignedRate(value: number) {
  const sign = value > 0 ? '+' : value < 0 ? '-' : '';
  return `${sign}${Math.abs(value).toFixed(2)}%`;
}

export function MarketRankingPage() {
  const navigate = useNavigate();
  const { getContestPath, isContestMode } = useContestMode();
  const marketPath = isContestMode ? getContestPath('/market') : '/market';

  const [items, setItems] = useState<RankingItem[]>([]);
  const [watchset, setWatchset] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // 실시간 조회상위 순위 (최대 20개) — REST 폴링(15초)
  useEffect(() => {
    let cancelled = false;
    const fetchRanking = () => {
      marketApi
        .getHtsTopViewRanking()
        .then((res) => {
          if (cancelled) return;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const list: any[] = res?.items ?? [];
          setItems(
            list.map((it, idx) => ({
              rank: Number(it.rank ?? idx + 1),
              name: it.stockName ?? '',
              code: it.stockCode ?? '',
              price: formatPrice(Number(it.currentPrice ?? 0)),
              changeRate: formatSignedRate(Number(it.changeRate ?? 0)),
            })),
          );
        })
        .catch(() => {
          /* 폴링 실패는 기존 값 유지 */
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    };
    fetchRanking();
    const timer = window.setInterval(fetchRanking, 15000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, []);

  // 관심종목 상태
  useEffect(() => {
    marketApi
      .getWatchlist('domestic')
      .then((data) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const codes = (data?.items ?? data?.stocks ?? []).map((i: any) => i.code ?? i.stockCode);
        setWatchset(new Set(codes.filter(Boolean)));
      })
      .catch(() => {});
  }, []);

  const toggleWatch = useCallback(async (code: string) => {
    const has = watchset.has(code);
    setWatchset((prev) => {
      const next = new Set(prev);
      if (has) next.delete(code);
      else next.add(code);
      return next;
    });
    try {
      if (has) await marketApi.deleteWatchlist(code);
      else await marketApi.addWatchlist(code);
    } catch {
      setWatchset((prev) => {
        const next = new Set(prev);
        if (has) next.add(code);
        else next.delete(code);
        return next;
      });
    }
  }, [watchset]);

  return (
    <div className="min-h-full bg-[#F3F7FC] px-4 pb-24 pt-4">
      <div className="mb-4 flex items-center gap-2">
        <button
          aria-label="뒤로"
          className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-[#F0F6FF]"
          onClick={() => navigate(-1)}
          type="button"
        >
          <ChevronLeft size={20} className="text-slate-700" />
        </button>
        <h1 className="text-base font-extrabold text-slate-950">실시간 순위</h1>
      </div>

      {loading && items.length === 0 ? (
        <p className="py-16 text-center text-xs font-bold text-[#6C88A4]">불러오는 중...</p>
      ) : items.length === 0 ? (
        <p className="py-16 text-center text-xs font-bold text-[#A3B4C6]">순위 정보가 없습니다.</p>
      ) : (
        <div className="space-y-2">
          {items.map((stock) => {
            const favorite = watchset.has(stock.code);
            return (
              <div
                className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-blue-100 bg-white px-4 py-3 text-left shadow-sm transition hover:border-blue-200 hover:bg-[#F8FBFF]"
                key={stock.code}
                onClick={() => navigate(`${marketPath}?stockCode=${stock.code}&from=market-ranking`)}
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E5F4FF] text-sm font-extrabold text-[#1565C0]">
                    {stock.rank}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-slate-950">{stock.name}</p>
                    <p className="text-xs text-[#A3B4C6]">{stock.code}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-950">{stock.price}</p>
                    <p className={`text-xs font-bold ${getChangeClass(stock.changeRate)}`}>{stock.changeRate}</p>
                  </div>
                  <button
                    aria-label={favorite ? '관심종목 해제' : '관심종목 등록'}
                    className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full hover:bg-[#F0F6FF]"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWatch(stock.code);
                    }}
                    type="button"
                  >
                    <Heart
                      size={18}
                      className={favorite ? 'fill-red-500 text-red-500' : 'fill-transparent text-[#A3B4C6]'}
                    />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
