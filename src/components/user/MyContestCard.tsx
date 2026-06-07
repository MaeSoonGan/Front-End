import { useNavigate } from 'react-router-dom';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import type { MyContestItem } from '../../types/contest';
import { cn } from '../../utils/cn';
import { ContestTopRankList } from './ContestTopRankList';

interface MyContestCardProps {
  contest: MyContestItem;
  onWithdraw: (contest: MyContestItem) => void;
}

function formatShortDate(date: string) {
  return date.slice(5).replace('-', '.');
}

function formatSeedMoney(seedMoney: number) {
  return `${Math.floor(seedMoney / 10000).toLocaleString('ko-KR')}만원`;
}

function formatAmount(value: number) {
  const sign = value > 0 ? '+' : value < 0 ? '-' : '';

  return `${sign}${Math.abs(value).toLocaleString('ko-KR')}원`;
}

function formatAsset(value: number) {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(value % 1000000 === 0 ? 0 : 2)}M`;
  }

  return value.toLocaleString('ko-KR');
}

function formatRate(value: number) {
  const sign = value > 0 ? '+' : '';

  return `${sign}${value.toFixed(1)}%`;
}

export function MyContestCard({ contest, onWithdraw }: MyContestCardProps) {
  const navigate = useNavigate();
  const isActive = contest.status === 'ACTIVE';
  const isProfit = contest.profitRate >= 0;

  const handleGoContest = () => {
    // TODO: 대회 홈 화면 API 연동 후 해당 대회의 시드머니/보유자산 기준 데이터를 조회합니다.
    navigate(`/contests/${contest.contestId}/home`);
  };

  return (
    <Card className="rounded-2xl border-blue-100 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-base font-extrabold text-slate-950">{contest.title}</h2>
          <p className="mt-2 text-xs font-bold text-[#6C88A4]">
            🗓️ {formatShortDate(contest.startAt)} ~ {formatShortDate(contest.endAt)} · 💰
            시드머니 {formatSeedMoney(contest.seedMoney)}
          </p>
        </div>
        <span
          className={cn(
            'shrink-0 rounded-full px-2.5 py-1 text-[11px] font-extrabold',
            isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500',
          )}
        >
          {isActive ? '진행중' : '종료됨'}
        </span>
      </div>

      <section className="mt-4 grid grid-cols-3 overflow-hidden rounded-2xl bg-[#F0F6FF]">
        <div className="px-2 py-3 text-center">
          <p className="text-[11px] font-bold text-[#6C88A4]">내 순위</p>
          <p className="mt-1 text-lg font-extrabold text-[#1565C0]">{contest.myRank}위</p>
          <p className="text-[11px] font-bold text-[#6C88A4]">
            / {contest.totalParticipants}명
          </p>
        </div>
        <div className="border-x border-blue-100 px-2 py-3 text-center">
          <p className="text-[11px] font-bold text-[#6C88A4]">수익률</p>
          <p className={cn('mt-1 text-lg font-extrabold', isProfit ? 'text-red-500' : 'text-blue-600')}>
            {formatRate(contest.profitRate)}
          </p>
          <p className="text-[11px] font-bold text-[#6C88A4]">
            {formatAmount(contest.profitAmount)}
          </p>
        </div>
        <div className="px-2 py-3 text-center">
          <p className="text-[11px] font-bold text-[#6C88A4]">현재 자산</p>
          <p className="mt-1 text-lg font-extrabold text-slate-950">
            {formatAsset(contest.currentAsset)}
          </p>
          <p className="text-[11px] font-bold text-[#6C88A4]">원</p>
        </div>
      </section>

      <div className="mt-4">
        <ContestTopRankList
          title={isActive ? '현재 순위 TOP 3' : '순위 TOP 3'}
          topRankers={contest.topRankers}
        />
      </div>

      {isActive ? (
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button
            className="h-11 rounded-xl text-sm font-extrabold"
            onClick={() => navigate(`/my-contests/${contest.contestId}/ranking?fromTab=ACTIVE`)}
            variant="brand"
          >
            전체 랭킹 보기
          </Button>
          <Button
            className="h-11 rounded-xl border-[#1565C0] text-sm font-extrabold text-[#1565C0]"
            onClick={handleGoContest}
            variant="secondary"
          >
            대회로 가기
          </Button>
        </div>
      ) : (
        <Button
          className="mt-4 h-11 w-full rounded-xl text-sm font-extrabold"
          onClick={() => navigate(`/my-contests/${contest.contestId}/ranking?fromTab=ENDED`)}
          variant="brand"
        >
          랭킹 확인하기
        </Button>
      )}

      {isActive ? (
        <Button
          className="mt-2 h-10 w-full rounded-xl bg-rose-600 text-xs font-extrabold text-white hover:bg-rose-700"
          onClick={() => onWithdraw(contest)}
          variant="danger"
        >
          대회 포기하기
        </Button>
      ) : null}
    </Card>
  );
}
