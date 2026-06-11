import { useEffect, useMemo, useRef, useState } from 'react';
import { contestsApi } from '../api/user/contests';

export interface LiveRankParticipant {
  rank: number;
  nickname: string;
  profitRate: number;
  profitAmount: number;
}

/**
 * 대회 실시간 순위 계산 (주기 갱신).
 * - 다른 참여자(mock)는 수익률 고정 → 한 번만 받아둠.
 * - 내 live 수익률은 매 틱 바뀌지만, 순위/카드 위치는 refreshMs 주기로만 갱신(정신사나움 방지).
 * - 모든 참여자 시드가 동일하므로 수익률 순위 = 수익금/총자산 순위(대회 기준 무관).
 */
export function useLiveContestRank(
  contestId: number | null,
  myLiveProfitRate: number | null,
  refreshMs = 30000,
) {
  const [participants, setParticipants] = useState<LiveRankParticipant[]>([]);
  const [totalParticipants, setTotalParticipants] = useState(0);
  const [myNickname, setMyNickname] = useState<string | undefined>(undefined);
  const [snapshotRate, setSnapshotRate] = useState<number | null>(null);

  const rateRef = useRef(myLiveProfitRate);
  rateRef.current = myLiveProfitRate;

  // 참여자 목록 + 내 닉네임 1회 로드
  useEffect(() => {
    if (!contestId) {
      setParticipants([]);
      setTotalParticipants(0);
      setMyNickname(undefined);
      return;
    }
    let cancelled = false;
    Promise.all([
      contestsApi.getRankings(contestId, { page: 0, size: 500 }).catch(() => null),
      contestsApi.getMyRanking(contestId).catch(() => null),
    ]).then(([rankings, mine]) => {
      if (cancelled) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const list: any[] = rankings?.content ?? [];
      setParticipants(
        list.map((r) => ({
          rank: Number(r.rank ?? 0),
          nickname: r.nickname ?? '',
          profitRate: Number(r.profitRate ?? 0),
          profitAmount: Number(r.profitAmount ?? 0),
        })),
      );
      setTotalParticipants(rankings?.totalElements ?? list.length);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setMyNickname((mine as any)?.nickname);
    });
    return () => {
      cancelled = true;
    };
  }, [contestId]);

  // 내 수익률 스냅샷을 주기적으로 갱신 (이 값으로만 순위 재계산)
  useEffect(() => {
    setSnapshotRate(rateRef.current);
    const timer = window.setInterval(() => setSnapshotRate(rateRef.current), refreshMs);
    return () => window.clearInterval(timer);
  }, [refreshMs]);

  const otherRates = useMemo(
    () =>
      participants
        .filter((p) => !myNickname || p.nickname !== myNickname)
        .map((p) => p.profitRate),
    [participants, myNickname],
  );

  const rank = snapshotRate == null ? null : otherRates.filter((r) => r > snapshotRate).length + 1;

  return { rank, totalParticipants, participants, myNickname, snapshotRate };
}
