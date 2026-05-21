import { useState, useMemo } from 'react';
import { Download, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card } from '../../../components/common/Card';
import { useAdminPageActions } from '../../../contexts/AdminPageActionsContext';
import { Button } from '../../../components/common/Button';

type RankingStatus = 'NORMAL' | 'EXCLUDED';

interface RankingEntry {
  id: string;
  nickname: string;
  profitRate: number;
  profitAmount: number;
  currentAsset: number;
  status: RankingStatus;
}

interface Contest {
  id: string;
  name: string;
  statusLabel: string;
}

const MOCK_CONTESTS: Contest[] = [
  { id: 'c1', name: '5월 모의투자 대회', statusLabel: '진행중' },
  { id: 'c2', name: '코스닥 챌린지',     statusLabel: '마감임박' },
];

const MOCK_RANKING: RankingEntry[] = [
  { id: 'r1', nickname: '투자고수',      profitRate:  0.325, profitAmount:  3250000, currentAsset: 13250000, status: 'NORMAL'   },
  { id: 'r2', nickname: '주식왕',        profitRate:  0.283, profitAmount:  2830000, currentAsset: 12830000, status: 'NORMAL'   },
  { id: 'r3', nickname: '금빛새벽',      profitRate:  0.251, profitAmount:  2510000, currentAsset: 12510000, status: 'NORMAL'   },
  { id: 'r4', nickname: '노력하는투자자', profitRate:  0.187, profitAmount:  1870000, currentAsset: 11870000, status: 'NORMAL'   },
  { id: 'r5', nickname: '최고수',        profitRate:  0.153, profitAmount:  1530000, currentAsset: 11530000, status: 'NORMAL'   },
  { id: 'r6', nickname: '어뷰저123',    profitRate:  0.451, profitAmount:  4510000, currentAsset: 14510000, status: 'EXCLUDED' },
  { id: 'r7', nickname: '홍길동',        profitRate:  0.082, profitAmount:   820000, currentAsset: 10820000, status: 'NORMAL'   },
  { id: 'r8', nickname: '김수익',        profitRate: -0.054, profitAmount:  -540000, currentAsset:  9460000, status: 'NORMAL'   },
  { id: 'r9', nickname: '이손실',        profitRate: -0.112, profitAmount: -1120000, currentAsset:  8880000, status: 'NORMAL'   },
];

const LAST_REFRESH_TIME = '14:30';
const PAGE_SIZE = 7;

function formatRate(rate: number): string {
  return `${rate >= 0 ? '+' : ''}${(rate * 100).toFixed(1)}%`;
}

function formatAmount(amount: number): string {
  return `${amount >= 0 ? '+' : ''}${amount.toLocaleString('ko-KR')}원`;
}

function formatAsset(amount: number): string {
  return `${amount.toLocaleString('ko-KR')}원`;
}

const MEDAL: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

export function AdminRankingPage() {
  const [selectedContestId, setSelectedContestId] = useState(MOCK_CONTESTS[0].id);
  const [entries, setEntries]                     = useState<RankingEntry[]>(MOCK_RANKING);
  const [currentPage, setCurrentPage]             = useState(1);

  const [excludeNickname, setExcludeNickname] = useState('');
  const [excludeReason, setExcludeReason]     = useState('');
  const [panelMode, setPanelMode]             = useState<'exclude' | 'restore'>('exclude');

  const ranked = useMemo(() => {
    const normalEntries = entries.filter(e => e.status === 'NORMAL');
    return entries.map(e => ({
      ...e,
      rank: e.status === 'NORMAL' ? normalEntries.indexOf(e) + 1 : null,
    }));
  }, [entries]);

  const stats = useMemo(() => {
    const normal   = entries.filter(e => e.status === 'NORMAL');
    const excluded = entries.filter(e => e.status === 'EXCLUDED');
    const sorted   = [...normal].sort((a, b) => b.profitRate - a.profitRate);
    const avg      = normal.length > 0
      ? normal.reduce((sum, e) => sum + e.profitRate, 0) / normal.length
      : 0;
    return {
      avgProfitRate: avg,
      profitCount:   normal.filter(e => e.profitRate > 0).length,
      lossCount:     normal.filter(e => e.profitRate < 0).length,
      topNickname:   sorted[0]?.nickname ?? '-',
      topProfitRate: sorted[0]?.profitRate ?? 0,
      excludedCount: excluded.length,
    };
  }, [entries]);

  const totalPages = Math.max(1, Math.ceil(ranked.length / PAGE_SIZE));
  const paginated  = ranked.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function handleSelectEntry(nickname: string, mode: 'exclude' | 'restore') {
    setExcludeNickname(nickname);
    setExcludeReason('');
    setPanelMode(mode);
  }

  function handlePanelSubmit() {
    const target = entries.find(e => e.nickname === excludeNickname.trim());
    if (!target) return;
    setEntries(prev => prev.map(e =>
      e.id === target.id ? { ...e, status: panelMode === 'exclude' ? 'EXCLUDED' : 'NORMAL' } : e,
    ));
    setExcludeNickname('');
    setExcludeReason('');
    setPanelMode('exclude');
  }

  function handlePanelReset() {
    setExcludeNickname('');
    setExcludeReason('');
    setPanelMode('exclude');
  }

  useAdminPageActions(
    <div className="flex items-center gap-2">
      <span className="text-xs text-slate-500">
        최근 갱신: {LAST_REFRESH_TIME} (10분마다 자동갱신)
      </span>
      <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-600">
        정상 랭킹 집계
      </span>
      <Button variant="secondary" className="h-9 gap-1.5 text-sm">
        <Download size={14} />
        랭킹 CSV 내보내기
      </Button>
      <Button variant="brand" className="h-9 gap-1.5 text-sm">
        <RefreshCw size={14} />
        수동 갱신
      </Button>
    </div>
  );

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-5">
        {/* 좌측: 대회 선택 + 랭킹 테이블 */}
        <div className="lg:col-span-3">
          <Card className="p-0">
            {/* 대회 선택 */}
            <div className="border-b border-slate-200 p-4">
              <div className="flex items-center gap-3">
                <span className="whitespace-nowrap text-sm font-medium text-slate-700">대회 선택</span>
                <select
                  value={selectedContestId}
                  onChange={e => { setSelectedContestId(e.target.value); setCurrentPage(1); }}
                  className="h-9 flex-1 rounded-md border border-slate-300 px-3 text-sm focus:border-[#1565C0] focus:outline-none"
                >
                  {MOCK_CONTESTS.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.statusLabel})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 랭킹 테이블 */}
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
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
                  {paginated.map(entry => (
                    <tr key={entry.id} className="hover:bg-slate-50">
                      {/* 순위 */}
                      <td className={`px-3 py-3 text-center font-semibold text-slate-900 ${entry.status === 'EXCLUDED' ? 'opacity-60' : ''}`}>
                        {entry.status === 'EXCLUDED'
                          ? <span className="text-slate-400">-</span>
                          : entry.rank !== null && entry.rank <= 3
                            ? <span className="text-base">{MEDAL[entry.rank]}</span>
                            : entry.rank
                        }
                      </td>
                      {/* 닉네임 */}
                      <td className={`whitespace-nowrap px-3 py-3 text-center font-medium text-slate-900 ${entry.status === 'EXCLUDED' ? 'opacity-60' : ''}`}>
                        {entry.nickname}
                      </td>
                      {/* 수익률 */}
                      <td className={`whitespace-nowrap px-3 py-3 text-center font-semibold ${entry.profitRate >= 0 ? 'text-rose-600' : 'text-blue-600'} ${entry.status === 'EXCLUDED' ? 'opacity-60' : ''}`}>
                        {formatRate(entry.profitRate)}
                      </td>
                      {/* 손익금액 */}
                      <td className={`whitespace-nowrap px-3 py-3 text-center ${entry.profitAmount >= 0 ? 'text-rose-600' : 'text-blue-600'} ${entry.status === 'EXCLUDED' ? 'opacity-60' : ''}`}>
                        {formatAmount(entry.profitAmount)}
                      </td>
                      {/* 현재 자산 */}
                      <td className={`whitespace-nowrap px-3 py-3 text-center text-slate-600 ${entry.status === 'EXCLUDED' ? 'opacity-60' : ''}`}>
                        {formatAsset(entry.currentAsset)}
                      </td>
                      {/* 상태 */}
                      <td className={`px-3 py-3 ${entry.status === 'EXCLUDED' ? 'opacity-60' : ''}`}>
                        <div className="flex justify-center">
                          {entry.status === 'NORMAL'
                            ? <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">정상</span>
                            : <span className="inline-flex items-center rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-medium text-rose-600">제외됨</span>
                          }
                        </div>
                      </td>
                      {/* 관리 — opacity 적용 안 함 */}
                      <td className="px-3 py-3">
                        <div className="flex justify-center">
                          {entry.status === 'NORMAL'
                            ? (
                              <button
                                onClick={() => handleSelectEntry(entry.nickname, 'exclude')}
                                className="cursor-pointer rounded px-2 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50"
                              >
                                제외
                              </button>
                            )
                            : (
                              <button
                                onClick={() => handleSelectEntry(entry.nickname, 'restore')}
                                className="cursor-pointer rounded px-2 py-1 text-xs font-medium text-[#1565C0] hover:bg-[#E8F0FE]"
                              >
                                복구
                              </button>
                            )
                          }
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 페이지네이션 */}
            <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-sm text-slate-500">
              <span>전체 {ranked.length}명 중 {(currentPage - 1) * PAGE_SIZE + 1}~{Math.min(currentPage * PAGE_SIZE, ranked.length)}명</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="cursor-pointer rounded p-1 hover:bg-slate-100 disabled:opacity-40"
                >
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`min-w-7 cursor-pointer rounded px-2 py-1 text-sm font-medium ${
                      currentPage === page
                        ? 'bg-[#1565C0] text-white'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="cursor-pointer rounded p-1 hover:bg-slate-100 disabled:opacity-40"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </Card>
        </div>

        {/* 우측: 랭킹 제외/복구 패널 + 현황 통계 */}
        <div className="space-y-4 lg:col-span-2">
          {/* 패널 */}
          <Card>
            <h2 className="mb-4 text-base font-semibold text-slate-900">
              {panelMode === 'exclude' ? '랭킹 제외' : '랭킹 복구'}
            </h2>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">대상 닉네임</label>
                <input
                  type="text"
                  placeholder="닉네임 입력"
                  value={excludeNickname}
                  onChange={e => setExcludeNickname(e.target.value)}
                  className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm focus:border-[#1565C0] focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  {panelMode === 'exclude' ? '제외 사유' : '복구 사유'}
                </label>
                <textarea
                  placeholder={panelMode === 'exclude' ? '어뷰저 행위, 부정 거래 등' : '복구 사유를 입력하세요'}
                  value={excludeReason}
                  onChange={e => setExcludeReason(e.target.value)}
                  rows={3}
                  className="w-full resize-none rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-[#1565C0] focus:outline-none"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="brand"
                  className="flex-1"
                  disabled={!excludeNickname.trim() || !excludeReason.trim()}
                  onClick={handlePanelSubmit}
                >
                  {panelMode === 'exclude' ? '제외 처리' : '복구 처리'}
                </Button>
                <Button variant="secondary" onClick={handlePanelReset}>
                  초기화
                </Button>
              </div>
            </div>
          </Card>

          {/* 현황 통계 */}
          <Card>
            <h2 className="mb-4 text-base font-semibold text-slate-900">현황 통계</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">평균 수익률</span>
                <span className="font-semibold text-rose-600">{formatRate(stats.avgProfitRate)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">수익자 / 손실자</span>
                <span className="font-medium text-slate-900">
                  <span className="text-rose-600">{stats.profitCount}명</span>
                  {' / '}
                  <span className="text-blue-600">{stats.lossCount}명</span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">최고 수익률</span>
                <span className="font-semibold text-rose-600">
                  {formatRate(stats.topProfitRate)} ({stats.topNickname})
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                <span className="text-slate-500">제외된 인원</span>
                <span className="font-medium text-slate-900">{stats.excludedCount}명</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
