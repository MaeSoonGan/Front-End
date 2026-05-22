import { LogOut } from 'lucide-react';
import { useContestMode } from '../../contexts/ContestModeContext';

export function ContestModeBanner() {
  const { contest, isContestMode, leaveContest } = useContestMode();

  if (!isContestMode) {
    return null;
  }

  return (
    <section className="border-b border-blue-100 bg-[#0f55a5] px-4 py-3 text-white">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-extrabold text-blue-100">대회 투자 모드</p>
          <p className="mt-0.5 truncate text-sm font-extrabold">
            {contest ? `${contest.startAt.slice(0, 4)}년 ${contest.title}` : '대회'}
          </p>
        </div>
        <button
          className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-xl bg-white/15 px-3 text-xs font-extrabold text-white transition hover:bg-white/25"
          onClick={leaveContest}
          type="button"
        >
          <LogOut size={14} strokeWidth={2.5} />
          나가기
        </button>
      </div>
    </section>
  );
}
