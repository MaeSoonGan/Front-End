import type { ContestRankingItem as ContestRankingItemType } from '../../types/contest';
import { ContestRankingItem } from './ContestRankingItem';

interface ContestRankingListProps {
  myRank?: number;
  rankingList: ContestRankingItemType[];
}

export function ContestRankingList({ myRank, rankingList }: ContestRankingListProps) {
  if (rankingList.length === 0) {
    return (
      <div className="rounded-2xl border border-blue-100 bg-white px-4 py-10 text-center shadow-sm">
        <p className="text-sm font-extrabold text-slate-950">아직 랭킹 데이터가 없습니다.</p>
        <p className="mt-1 text-xs font-bold text-[#6C88A4]">대회가 시작되면 순위가 표시됩니다.</p>
      </div>
    );
  }

  return (
    <section className="space-y-3">
      {/* TODO: GET /api/contests/{contestId}/ranking?page=0&size=20 연동 후 페이지 단위로 확장합니다. */}
      {rankingList.map((item) => (
        <ContestRankingItem
          isMine={item.rank === myRank}
          item={item}
          key={`${item.rank}-${item.nickname}`}
        />
      ))}
    </section>
  );
}
