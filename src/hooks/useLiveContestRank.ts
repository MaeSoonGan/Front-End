import { useEffect, useMemo, useRef, useState } from 'react';
import { contestsApi } from '../api/user/contests';

export interface LiveRankParticipant {
  rank: number;
  nickname: string;
  profitRate: number;
  profitAmount: number;
  memberId?: number;
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
  const [myMemberId, setMyMemberId] = useState<number | undefined>(undefined);
  const [snapshotRate, setSnapshotRate] = useState<number | null>(null);

  const rateRef = useRef(myLiveProfitRate);
  rateRef.current = myLiveProfitRate;

  // 참여자 목록 + 내 닉네임 1회 로드
  useEffect(() => {
    if (!contestId) {
      setParticipants([]);
      setTotalParticipants(0);
      setMyNickname(undefined);
      setMyMemberId(undefined);
      return;
    }
    let cancelled = false;
    Promise.all([
      // size 상한이 100 → 한 번에 최대 100명(현재 대회 규모 내). 그 이상이면 페이지네이션 필요.
      contestsApi.getRankings(contestId, { page: 0, size: 100 }).catch(() => null),
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
          memberId: r.memberId != null ? Number(r.memberId) : undefined,
        })),
      );
      setTotalParticipants(rankings?.totalElements ?? list.length);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setMyNickname((mine as any)?.nickname);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setMyMemberId((mine as any)?.memberId != null ? Number((mine as any).memberId) : undefined);
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

  // 내 수익률이 처음 준비되면(마운트 시 null이었던 경우) 30초 안 기다리고 즉시 1회 반영
  useEffect(() => {
    if (snapshotRate == null && myLiveProfitRate != null) {
      setSnapshotRate(myLiveProfitRate);
    }
  }, [myLiveProfitRate, snapshotRate]);

  // 나를 제외한 다른 참여자 수익률 — memberId 우선(정확), 없으면 nickname
  const otherRates = useMemo(
    () =>
      participants
        .filter((p) =>
          myMemberId != null ? p.memberId !== myMemberId : !myNickname || p.nickname !== myNickname,
        )
        .map((p) => p.profitRate),
    [participants, myMemberId, myNickname],
  );

  const rank = snapshotRate == null ? null : otherRates.filter((r) => r > snapshotRate).length + 1;

  return { rank, totalParticipants, participants, myNickname, myMemberId, snapshotRate };
}
