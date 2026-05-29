import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { Download, RefreshCw, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { getPaginationPages } from '../../../utils/pagination';
import { Card } from '../../../components/common/Card';
import { useAdminPageActions } from '../../../contexts/AdminPageActionsContext';
import { Button } from '../../../components/common/Button';
import { contestsApi } from '../../../api/admin/contests';

type RankingStatus = 'NORMAL' | 'EXCLUDED';

interface RankingEntry {
  id: string;
  memberId: number;
  nickname: string;
  profitRate: number;
  profitAmount: number;
  currentAsset: number;
  status: RankingStatus;
  rank: number | null;
}

interface Contest {
  id: string;
  name: string;
  statusLabel: string;
}

const PAGE_SIZE = 7;

const MEDAL: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

function formatRate(rate: number): string {
  return `${rate >= 0 ? '+' : ''}${(rate * 100).toFixed(1)}%`;
}
function formatAmount(amount: number): string {
  return `${amount >= 0 ? '+' : ''}${amount.toLocaleString('ko-KR')}원`;
}
function formatAsset(amount: number): string {
  return `${amount.toLocaleString('ko-KR')}원`;
}

let _setHeaderRefreshTime: ((t: string) => void) | null = null;

function HeaderRefreshTime({ initial }: { initial: string }) {
  const [time, setTime] = useState(initial);
  useEffect(() => {
    _setHeaderRefreshTime = setTime;
    return () => { _setHeaderRefreshTime = null; };
  }, []);
  return <span className="text-xs text-slate-500">최근 갱신: {time} (10분마다 자동갱신)</span>;
}

export function AdminRankingPage() {
  const [contests, setContests]             = useState<Contest[]>([]);
  const [selectedContestId, setSelectedContestId] = useState('');
  const [entries, setEntries]               = useState<RankingEntry[]>([]);
  const [totalPages, setTotalPages]         = useState(1);
  const [currentPage, setCurrentPage]       = useState(1);
  const [loading, setLoading]               = useState(false);

  const [selectedEntry, setSelectedEntry]   = useState<RankingEntry | null>(null);
  const [excludeNickname, setExcludeNickname] = useState('');
  const [excludeReason, setExcludeReason]   = useState('');
  const [panelMode, setPanelMode]           = useState<'exclude' | 'restore'>('exclude');
  const [isConfirmOpen, setIsConfirmOpen]   = useState(false);
  const [isRefreshing, setIsRefreshing]     = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState(() => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  });

  useEffect(() => {
    contestsApi.getContests({ status: 'ACTIVE', size: 100 })
      .then(data => {
        const list: Contest[] = (data.content ?? []).map((c: any) => ({
          id:          String(c.contestId),
          name:        c.title ?? '',
          statusLabel: '진행중',
        }));
        setContests(list);
        if (list.length > 0) setSelectedContestId(list[0].id);
      })
      .catch(console.error);
  }, []);

  const fetchRankings = useCallback(async (contestId: string, page: number) => {
    if (!contestId) return;
    setLoading(true);
    try {
      const data = await contestsApi.getRankings(Number(contestId), { page: page - 1, size: PAGE_SIZE });
      setEntries(
        (data.content ?? []).map((r: any) => ({
          id:           String(r.memberId),
          memberId:     r.memberId,
          nickname:     r.nickname ?? '',
          profitRate:   (r.profitRate ?? 0) / 100,
          profitAmount: r.profitAmount ?? 0,
          currentAsset: r.totalAsset ?? 0,
          status:       r.isExcluded ? 'EXCLUDED' : 'NORMAL' as RankingStatus,
          rank:         r.isExcluded ? null : (r.rankNo ?? null),
        }))
      );
      setTotalPages(data.totalPages ?? 1);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedContestId) fetchRankings(selectedContestId, currentPage);
  }, [selectedContestId, currentPage, fetchRankings]);

  async function handleRefresh() {
    if (isRefreshing || !selectedContestId) return;
    setIsRefreshing(true);
    try {
      await fetchRankings(selectedContestId, currentPage);
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      setLastRefreshTime(timeStr);
      _setHeaderRefreshTime?.(timeStr);
    } finally {
      setIsRefreshing(false);
    }
  }

  const handleRefreshRef = useRef(handleRefresh);
  useEffect(() => { handleRefreshRef.current = handleRefresh; });

  const stats = useMemo(() => {
    const normal   = entries.filter(e => e.status === 'NORMAL');
    const excluded = entries.filter(e => e.status === 'EXCLUDED');
    const sorted   = [...normal].sort((a, b) => b.profitRate - a.profitRate);
    const avg      = normal.length > 0 ? normal.reduce((sum, e) => sum + e.profitRate, 0) / normal.length : 0;
    return {
      avgProfitRate: avg,
      profitCount:   normal.filter(e => e.profitRate > 0).length,
      lossCount:     normal.filter(e => e.profitRate < 0).length,
      topNickname:   sorted[0]?.nickname ?? '-',
      topProfitRate: sorted[0]?.profitRate ?? 0,
      excludedCount: excluded.length,
    };
  }, [entries]);

  const ghostCount = PAGE_SIZE - Math.max(entries.length, entries.length === 0 ? 1 : 0);

  function handleSelectEntry(entry: RankingEntry, mode: 'exclude' | 'restore') {
    setSelectedEntry(entry);
    setExcludeNickname(entry.nickname);
    setExcludeReason('');
    setPanelMode(mode);
  }

  async function handlePanelSubmit() {
    const target = selectedEntry ?? entries.find(e => e.nickname === excludeNickname.trim());
    if (!target || !selectedContestId) return;
    try {
      if (panelMode === 'exclude') {
        await contestsApi.excludeRanking(Number(selectedContestId), target.memberId, { reason: excludeReason });
      } else {
        await contestsApi.restoreRanking(Number(selectedContestId), target.memberId);
      }
      setExcludeNickname('');
      setExcludeReason('');
      setSelectedEntry(null);
      setPanelMode('exclude');
      fetchRankings(selectedContestId, currentPage);
    } catch (e) {
      console.error(e);
    }
  }

  function handlePanelReset() {
    setExcludeNickname('');
    setExcludeReason('');
    setSelectedEntry(null);
    setPanelMode('exclude');
  }

  useAdminPageActions(
    <div className="flex items-center gap-2">
      <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-600">정상 랭킹 집계</span>
      <HeaderRefreshTime initial={lastRefreshTime} />
      <Button variant="secondary" className="h-9 gap-1.5 text-sm"><Download size={14} />CSV 내보내기</Button>
      <Button variant="brand" className="h-9 gap-1.5 text-sm" onClick={() => handleRefreshRef.current()}><RefreshCw size={14} />수동 갱신</Button>
    </div>
  );

  return (
    <>
      {isConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setIsConfirmOpen(false)}>
          <div className="w-80 rounded-lg bg-white p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="mb-2 text-base font-bold text-slate-900">{panelMode === 'exclude' ? '랭킹 제외 확인' : '랭킹 복구 확인'}</h3>
            <p className="mb-5 text-sm text-slate-600"><span className="font-semibold text-slate-900">{excludeNickname}</span>을(를) {panelMode === 'exclude' ? '랭킹에서 제외하시겠습니까?' : '랭킹에 복구하시겠습니까?'}</p>
            <div className="flex justify-end gap-2">
              <Button variant={panelMode === 'exclude' ? 'danger' : 'brand'} onClick={() => { handlePanelSubmit(); setIsConfirmOpen(false); }}>{panelMode === 'exclude' ? '제외' : '복구'}</Button>
              <Button variant="secondary" onClick={() => setIsConfirmOpen(false)}>취소</Button>
            </div>
          </div>
        </div>
      )}

      <div className="grid items-stretch gap-6 lg:grid-cols-5">
        <div className="flex flex-col lg:col-span-3">
          <Card className="flex flex-col p-0 flex-1">
            <div className="border-b border-slate-200 p-4">
              <div className="flex items-center gap-3">
                <span className="whitespace-nowrap text-sm font-medium text-slate-700">대회 선택</span>
                <select
                  value={selectedContestId}
                  onChange={e => { setSelectedContestId(e.target.value); setCurrentPage(1); }}
                  className="h-9 flex-1 rounded-md border border-slate-300 px-3 text-sm focus:border-[#1565C0] focus:outline-none"
                >
                  {contests.map(c => <option key={c.id} value={c.id}>{c.name} ({c.statusLabel})</option>)}
                </select>
              </div>
            </div>

            <div className="overflow-hidden">
              <table className="w-full table-fixed text-sm">
                <colgroup>
                  <col className="w-14" /><col className="w-28" /><col className="w-24" />
                  <col className="w-32" /><col className="w-36" /><col className="w-22" /><col className="w-16" />
                </colgroup>
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="whitespace-nowrap px-3 py-3 text-center font-medium">순위</th>
                    <th className="whitespace-nowrap px-3 py-3 text-center font-medium">닉네임</th>
                    <th className="whitespace-nowrap px-3 py-3 text-center font-medium">수익률</th>
                    <th className="whitespace-nowrap px-3 py-3 text-center font-medium">손익금액</th>
                    <th className="whitespace-nowrap px-3 py-3 text-center font-medium">현재 자산</th>
                    <th className="whitespace-nowrap px-3 py-3 text-center font-medium">상태</th>
                    <th className="whitespace-nowrap px-3 py-3 text-center font-medium">관리</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading && <tr><td colSpan={7} className="px-3 py-3 text-center text-sm text-slate-400">불러오는 중...</td></tr>}
                  {!loading && entries.length === 0 && <tr><td colSpan={7} className="px-3 py-3 text-center text-sm text-slate-400">데이터가 없습니다.</td></tr>}
                  {!loading && entries.map(entry => (
                    <tr key={entry.id} className="hover:bg-slate-50">
                      <td className={`px-3 py-3 text-center font-semibold text-slate-900 ${entry.status === 'EXCLUDED' ? 'opacity-60' : ''}`}>
                        {entry.status === 'EXCLUDED' ? <span className="text-slate-400">-</span> : entry.rank !== null && entry.rank <= 3 ? <span className="text-base">{MEDAL[entry.rank!]}</span> : entry.rank}
                      </td>
                      <td className={`whitespace-nowrap px-3 py-3 text-center font-medium text-slate-900 ${entry.status === 'EXCLUDED' ? 'opacity-60' : ''}`}>{entry.nickname}</td>
                      <td className={`whitespace-nowrap px-3 py-3 text-center font-semibold ${entry.profitRate >= 0 ? 'text-rose-600' : 'text-blue-600'} ${entry.status === 'EXCLUDED' ? 'opacity-60' : ''}`}>{formatRate(entry.profitRate)}</td>
                      <td className={`whitespace-nowrap px-3 py-3 text-center ${entry.profitAmount >= 0 ? 'text-rose-600' : 'text-blue-600'} ${entry.status === 'EXCLUDED' ? 'opacity-60' : ''}`}>{formatAmount(entry.profitAmount)}</td>
                      <td className={`whitespace-nowrap px-3 py-3 text-center text-slate-600 ${entry.status === 'EXCLUDED' ? 'opacity-60' : ''}`}>{formatAsset(entry.currentAsset)}</td>
                      <td className={`px-3 py-3 ${entry.status === 'EXCLUDED' ? 'opacity-60' : ''}`}>
                        <div className="flex justify-center">
                          {entry.status === 'NORMAL' ? <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">정상</span> : <span className="inline-flex items-center rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-medium text-rose-600">제외됨</span>}
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex justify-center">
                          {entry.status === 'NORMAL'
                            ? <button onClick={() => handleSelectEntry(entry, 'exclude')} className="cursor-pointer rounded px-2 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50">제외</button>
                            : <button onClick={() => handleSelectEntry(entry, 'restore')} className="cursor-pointer rounded px-2 py-1 text-xs font-medium text-[#1565C0] hover:bg-[#E8F0FE]">복구</button>
                          }
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!loading && Array.from({ length: ghostCount }).map((_, i) => (
                    <tr key={`ghost-${i}`}><td colSpan={7} className="px-3 py-3"><span className="invisible select-none text-base leading-6">x</span></td></tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-center border-t border-slate-200 px-4 py-3 text-sm text-slate-500">
              <div className="flex items-center gap-1">
                <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="cursor-pointer rounded p-1 hover:bg-slate-100 disabled:opacity-40"><ChevronsLeft size={16} /></button>
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="cursor-pointer rounded p-1 hover:bg-slate-100 disabled:opacity-40"><ChevronLeft size={16} /></button>
                {getPaginationPages(currentPage, totalPages).map(page => (
                  <button key={page} onClick={() => setCurrentPage(page)} className={`min-w-7 cursor-pointer rounded px-2 py-1 text-sm font-medium ${currentPage === page ? 'bg-[#1565C0] text-white' : 'text-slate-600 hover:bg-slate-100'}`}>{page}</button>
                ))}
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="cursor-pointer rounded p-1 hover:bg-slate-100 disabled:opacity-40"><ChevronRight size={16} /></button>
                <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} className="cursor-pointer rounded p-1 hover:bg-slate-100 disabled:opacity-40"><ChevronsRight size={16} /></button>
              </div>
            </div>
          </Card>
        </div>

        <div className="flex flex-col gap-4 lg:col-span-2">
          <Card>
            <h2 className="mb-4 text-base font-semibold text-slate-900">{panelMode === 'exclude' ? '랭킹 제외' : '랭킹 복구'}</h2>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">대상 닉네임</label>
                <input type="text" placeholder="닉네임 입력" value={excludeNickname} onChange={e => setExcludeNickname(e.target.value)} className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm focus:border-[#1565C0] focus:outline-none" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">{panelMode === 'exclude' ? '제외 사유' : '복구 사유'}</label>
                <textarea placeholder={panelMode === 'exclude' ? '어뷰저 행위, 부정 거래 등' : '복구 사유를 입력하세요'} value={excludeReason} onChange={e => setExcludeReason(e.target.value)} rows={3} className="w-full resize-none rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-[#1565C0] focus:outline-none" />
              </div>
              <div className="flex gap-2">
                <Button variant={panelMode === 'exclude' ? 'danger' : 'brand'} className="flex-1" disabled={!excludeNickname.trim() || !excludeReason.trim()} onClick={() => setIsConfirmOpen(true)}>{panelMode === 'exclude' ? '제외 처리' : '복구 처리'}</Button>
                <Button variant="secondary" onClick={handlePanelReset}>초기화</Button>
              </div>
            </div>
          </Card>

          <Card className="flex-1">
            <h2 className="mb-4 text-base font-semibold text-slate-900">현황 통계</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between"><span className="text-slate-500">평균 수익률</span><span className="font-semibold text-rose-600">{formatRate(stats.avgProfitRate)}</span></div>
              <div className="flex items-center justify-between"><span className="text-slate-500">수익자 / 손실자</span><span className="font-medium text-slate-900"><span className="text-rose-600">{stats.profitCount}명</span>{' / '}<span className="text-blue-600">{stats.lossCount}명</span></span></div>
              <div className="flex items-center justify-between"><span className="text-slate-500">최고 수익률</span><span className="font-semibold text-rose-600">{formatRate(stats.topProfitRate)} ({stats.topNickname})</span></div>
              <div className="flex items-center justify-between border-t border-slate-100 pt-3"><span className="text-slate-500">제외된 인원</span><span className="font-medium text-slate-900">{stats.excludedCount}명</span></div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
