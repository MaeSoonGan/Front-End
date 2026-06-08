import { useNavigate } from 'react-router-dom';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import type { ContestListItem } from '../../types/contest';
import { cn } from '../../utils/cn';
import { ContestStatusBadge } from './ContestStatusBadge';
import { ContestStockTypeBadge } from './ContestStockTypeBadge';

interface ContestCardProps {
  contest: ContestListItem;
  isJoining: boolean;
  onJoin: (contestId: string) => void;
}

function formatDate(date: string) {
  return date.replaceAll('-', '.');
}

function formatContestTitle(contest: ContestListItem) {
  return `${contest.startAt.slice(0, 4)}년 ${contest.title}`;
}

function formatSeedMoney(seedMoney: number) {
  if (seedMoney >= 10000) {
    return `${Math.floor(seedMoney / 10000).toLocaleString('ko-KR')}만원`;
  }

  return `${seedMoney.toLocaleString('ko-KR')}원`;
}

function getParticipantText(contest: ContestListItem) {
  if (contest.maxParticipants === null) {
    return `참가자 ${contest.currentParticipants.toLocaleString('ko-KR')}명`;
  }

  return `참가자 ${contest.currentParticipants.toLocaleString('ko-KR')}/${contest.maxParticipants.toLocaleString('ko-KR')}명`;
}

function isParticipantNearlyFull(contest: ContestListItem) {
  if (contest.maxParticipants === null) {
    return false;
  }

  return contest.currentParticipants / contest.maxParticipants >= 0.9;
}

export function ContestCard({ contest, isJoining, onJoin }: ContestCardProps) {
  const navigate = useNavigate();
  const hasJoined = contest.isJoined;
  // 참가 가능 여부는 백엔드 판단(joinable)을 따른다.
  const canJoin = contest.joinable && !hasJoined;
  // 참가했고 진행 중인 대회는 입장 가능
  const canEnter = hasJoined && contest.status === 'ACTIVE';

  const actionLabel =
    contest.status === 'ENDED'
      ? '결과 보기'
      : contest.status === 'SCHEDULED'
        ? '개최 예정'
        : canEnter
          ? '입장하기'
          : hasJoined
            ? '참가 완료'
            : canJoin
              ? (isJoining ? '참가 처리 중' : '참가하기')
              : '참가 불가';

  const buttonStyle =
    contest.status === 'ENDED'
      ? 'border border-[#1565C0] bg-[#1565C0] text-white hover:bg-[#0f55a5]'
      : canEnter || canJoin
        ? 'bg-[#1565C0] text-white hover:bg-[#0f55a5]'
        : 'cursor-default border border-blue-100 bg-[#E8F0FA] text-[#6C88A4] hover:bg-[#E8F0FA]';

  // 참가 처리 중에만 실제 disabled(중복 클릭 방지). 그 외 비활성 상태(개최 예정 등)는
  // disabled로 흐리게 하지 않고, 핸들러에서 무반응 처리한다.
  const isDisabled = isJoining;

  const handleActionClick = () => {
    if (contest.status === 'ENDED') {
      navigate(`/contests/${contest.id}/ranking`);
      return;
    }

    if (canEnter) {
      navigate(`/contests/${contest.id}/home`);
      return;
    }

    if (canJoin) {
      onJoin(contest.id);
    }
  };

  return (
    <Card className="rounded-2xl border-blue-100 p-4">
      <div className="flex items-start justify-between gap-3">
        <ContestStatusBadge status={contest.status} />
        <ContestStockTypeBadge stockType={contest.stockType} />
      </div>

      <div className="mt-4">
        <div className="flex items-center gap-2">
          <h2 className="break-keep text-base font-extrabold leading-6 text-slate-950">
            {formatContestTitle(contest)}
          </h2>
          {canEnter ? (
            <span className="shrink-0 rounded-full bg-[#E5F4FF] px-2.5 py-1 text-[11px] font-extrabold text-[#1565C0]">
              참가중
            </span>
          ) : null}
        </div>
        <dl className="mt-2 space-y-1.5 text-xs font-bold text-[#6C88A4]">
          <div className="flex items-center gap-1.5">
            <dt className="shrink-0">🗓️</dt>
            <dd>
              {formatDate(contest.startAt)} ~ {formatDate(contest.endAt)}
            </dd>
          </div>
          <div
            className={cn(
              'flex items-center gap-1.5',
              isParticipantNearlyFull(contest) && 'text-orange-500',
            )}
          >
            <dt className="shrink-0">👥</dt>
            <dd>{getParticipantText(contest)}</dd>
          </div>
          <div className="flex items-center gap-1.5">
            <dt className="shrink-0">💰</dt>
            <dd>시드머니 {formatSeedMoney(contest.seedMoney)}</dd>
          </div>
        </dl>
      </div>

      <Button
        className={cn(
          'mt-4 h-11 w-full rounded-xl text-sm font-extrabold disabled:opacity-100',
          buttonStyle,
        )}
        disabled={isDisabled}
        onClick={handleActionClick}
        variant="brand"
      >
        {actionLabel}
      </Button>
    </Card>
  );
}
