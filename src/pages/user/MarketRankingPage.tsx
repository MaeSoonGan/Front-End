import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { marketApi } from '../../api/user/market';
import { useContestMode } from '../../contexts/ContestModeContext';
import { useMarketSocket } from '../../hooks/useMarketSocket';
import { cn } from '../../utils/cn';

type RankingType = '거래대금' | '상승' | '하락';

const RANKING_TYPES: RankingType[] = ['거래대금', '상승', '하락'];

interface RankingRow {
  rank: number;
  name: string;
  code: string;
  price: number;
  changeRate: number;
}

function getChangeClass(rate: number) {
  if (rate < 0) {
    return 'text-blue-600';
  }
  if (rate > 0) {
    return 'text-red-500';
  }
  return 'text-slate-500';
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
  const getPath = (path: string) => (isContestMode ? getContestPath(path) : path);

  const [type, setType] = useState<RankingType>('거래대금');
  const [rows, setRows] = useState<RankingRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    marketApi
      .getRanking(type)
      .then((items) => {
        if (!active) return;
        setRows(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (items ?? []).map((it: any) => ({
            rank: Number(it.rank ?? 0),
            name: it.name ?? '',
            code: it.code ?? '',
            price: Number(it.price ?? 0),
            changeRate: Number(it.changeRate ?? 0),
          })),
        );
      })
      .catch(() => {
        if (active) setRows([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [type]);

  // 실시간 가격 갱신
  const { prices } = useMarketSocket(rows.map((row) => row.code));

  // 관심종목 상태
  const [watchset, setWatchset] = useState<Set<string>>(new Set());
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

  const toggleWatch = async (code: string) => {
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
  };

  return (
    <div className="min-h-full bg-[#F3F7FC] px-4 pb-6 pt-3">
      <div className="mb-4 grid grid-cols-3 gap-2 rounded-2xl bg-[#E8F0FA] p-1">
        {RANKING_TYPES.map((option) => (
          <button
            className={cn(
              'h-9 rounded-xl text-xs font-extrabold transition',
              type === option ? 'bg-white text-[#1565C0] shadow-sm' : 'text-[#6C88A4] hover:bg-white/60',
            )}
            key={option}
            onClick={() => setType(option)}
            type="button"
          >
            {option}
          </button>
        ))}
      </div>

      {loading && rows.length === 0 ? (
        <p className="py-10 text-center text-xs font-bold text-[#6C88A4]">불러오는 중...</p>
      ) : rows.length === 0 ? (
        <p className="py-10 text-center text-xs font-bold text-[#A3B4C6]">순위 정보가 없습니다.</p>
      ) : (
        <div className="space-y-2">
          {rows.map((row, index) => {
            const live = prices[row.code];
            const price = live ? live.currentPrice : row.price;
            const changeRate = live ? live.changeRate : row.changeRate;
            const favorite = watchset.has(row.code);
            return (
              <div
                className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-blue-100 bg-white px-4 py-3 text-left shadow-sm transition hover:border-blue-200 hover:bg-[#F8FBFF]"
                key={row.code}
                onClick={() => navigate(`${getPath('/market')}?stockCode=${row.code}`)}
              >
                <div className="flex items-center gap-3">
                  <span className="w-5 text-center text-sm font-extrabold text-[#1565C0]">
                    {row.rank || index + 1}
                  </span>
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E5F4FF] text-xs font-bold text-[#1565C0]">
                    {row.name.slice(0, 1)}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-slate-950">{row.name}</p>
                    <p className="text-xs text-[#A3B4C6]">{row.code}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-950">{formatPrice(price)}</p>
                    <p className={`text-xs font-bold ${getChangeClass(changeRate)}`}>
                      {formatSignedRate(changeRate)}
                    </p>
                  </div>
                  <button
                    aria-label={favorite ? '관심종목 해제' : '관심종목 등록'}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full hover:bg-[#F0F6FF]"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWatch(row.code);
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
