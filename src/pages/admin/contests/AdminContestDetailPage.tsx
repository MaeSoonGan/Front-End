import { useState, useMemo, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ChevronUp, ChevronDown } from 'lucide-react';
import { getPaginationPages } from '../../../utils/pagination';
import { Card } from '../../../components/common/Card';
import { PageHeader } from '../../../components/common/PageHeader';
import { Button } from '../../../components/common/Button';
import { contestsApi } from '../../../api/admin/contests';
import { downloadCsv } from '../../../utils/download';

type ContestStatus = 'ONGOING' | 'CLOSING_SOON' | 'SCHEDULED' | 'ENDED';
type ParticipantStatus = 'NORMAL' | 'EXCLUDED';

interface ContestDetail {
  id: string;
  name: string;
  category: string;
  startDate: string;
  endDate: string;
  seedMoney: number;
  maxParticipants: number | null;
  participants: number;
  profitStandard: string;
  status: ContestStatus;
  description: string;
  limitOrderAmount: boolean;
  limitHoldingRatio: boolean;
  allowShortSelling: boolean;
  createdAt: string;
  createdBy: string;
}

interface Participant {
  id: string;
  nickname: string;
  email: string;
  profitRate: number;
  profitAmount: number;
  currentAsset: number;
  tradeCount: number;
  joinedAt: string;
  status: ParticipantStatus;
  rank: number | null;
}

interface RankingStats {
  normalCount: number;
  excludedCount: number;
  profitCount: number;
  lossCount: number;
  avgProfitRate: number;
  topNickname: string;
  topProfitRate: number;
}

const STATUS_LABEL: Record<ContestStatus, string> = {
  ONGOING: '진행중', CLOSING_SOON: '마감임박', SCHEDULED: '예정', ENDED: '종료',
};
const STATUS_BADGE: Record<ContestStatus, string> = {
  ONGOING:      'bg-emerald-100 text-emerald-600',
  CLOSING_SOON: 'bg-orange-100 text-orange-600',
  SCHEDULED:    'bg-sky-100 text-sky-600',
  ENDED:        'bg-rose-100 text-rose-600',
};

const PAGE_SIZE = 8;

function toUiStatus(status: string): ContestStatus {
  if (status === 'ACTIVE' || status === 'ONGOING') return 'ONGOING';
  if (status === 'CLOSING_SOON') return 'CLOSING_SOON';
  if (status === 'SCHEDULED') return 'SCHEDULED';
  return 'ENDED';
}

function isoToDateStr(iso: string | null): string {
  if (!iso) return '';
  return iso.split('T')[0];
}

function isoToDisplay(iso: string | null): string {
  if (!iso) return '';
  return iso.split('T')[0];
}

function formatRate(rate: number) {
  return `${rate >= 0 ? '+' : ''}${(rate * 100).toFixed(1)}%`;
}
function formatAmount(amount: number) {
  return `${amount >= 0 ? '+' : ''}${amount.toLocaleString('ko-KR')}원`;
}
function formatMoney(amount: number) {
  return `${amount.toLocaleString('ko-KR')}원`;
}

type ContestCategory = '전체' | '코스닥' | 'IT' | '바이오' | '에너지' | '금융';
const CATEGORIES: ContestCategory[] = ['전체', '코스닥', 'IT', '바이오', '에너지', '금융'];

interface EditForm {
  name: string; category: ContestCategory; startDate: string; endDate: string;
  seedMoney: string; maxParticipants: string; profitStandard: '수익률' | '절대금액';
  description: string; limitOrderAmount: boolean; limitHoldingRatio: boolean; allowShortSelling: boolean;
}

export function AdminContestDetailPage() {
  const { contestId } = useParams<{ contestId: string }>();
  const navigate = useNavigate();

  const [contest, setContest]   = useState<ContestDetail | null>(null);
  const [loading, setLoading]   = useState(true);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [rankStats, setRankStats]       = useState<RankingStats>({ normalCount: 0, excludedCount: 0, profitCount: 0, lossCount: 0, avgProfitRate: 0, topNickname: '-', topProfitRate: 0 });

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<EditForm>({
    name: '', category: '전체', startDate: '', endDate: '',
    seedMoney: '', maxParticipants: '', profitStandard: '수익률',
    description: '', limitOrderAmount: false, limitHoldingRatio: false, allowShortSelling: false,
  });

  const [search, setSearch]         = useState('');
  const [searchType, setSearchType] = useState<'all' | 'nickname' | 'email'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmAction, setConfirmAction] = useState<'end' | 'cancel' | null>(null);
  const [confirmReason, setConfirmReason] = useState('');
  type SortKey = 'profitRate' | 'profitAmount' | 'currentAsset' | 'tradeCount' | 'joinedAt';
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    if (!contestId) return;
    contestsApi.getContest(Number(contestId))
      .then(data => {
        setContest({
          id:               String(data.contestId),
          name:             data.title ?? '',
          category:         data.stockType ?? '전체',
          startDate:        isoToDisplay(data.startAt),
          endDate:          isoToDisplay(data.endAt),
          seedMoney:        data.seedMoney ?? 0,
          maxParticipants:  data.maxParticipants ?? null,
          participants:     data.participantCount ?? 0,
          profitStandard:   data.profitCriteria ?? '수익률',
          status:           toUiStatus(data.status ?? ''),
          description:      data.description ?? '',
          limitOrderAmount: data.maxOrderAmount != null,
          limitHoldingRatio: data.maxStockRatio != null,
          allowShortSelling: false,
          createdAt:        isoToDateStr(data.createdAt),
          createdBy:        data.adminName ?? '',
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [contestId]);

  const fetchRankings = useCallback(async () => {
    if (!contestId) return;
    try {
      // 전체 참가자를 받아 클라이언트에서 검색/정렬/페이지네이션 (전체 데이터 기준 정렬)
      // 백엔드 size 상한이 100 → 1000으로 호출하면 400. 최대 100건 조회(클라이언트 검색/정렬/페이지네이션).
      const data = await contestsApi.getRankings(Number(contestId), { page: 0, size: 100 });
      setParticipants(
        (data.content ?? []).map((r: any) => ({
          id:           String(r.memberId),
          nickname:     r.nickname ?? '',
          email:        r.accountId ?? '',
          profitRate:   (r.profitRate ?? 0) / 100,
          profitAmount: r.profitAmount ?? 0,
          currentAsset: r.totalAsset ?? 0,
          tradeCount:   0,
          joinedAt:     '',
          status:       r.isExcluded ? 'EXCLUDED' : 'NORMAL' as ParticipantStatus,
          rank:         r.isExcluded ? null : (r.rankNo ?? null),
        }))
      );
    } catch (e) {
      console.error(e);
    }
  }, [contestId]);

  useEffect(() => { fetchRankings(); }, [fetchRankings]);

  useEffect(() => {
    if (!contestId) return;
    contestsApi.getRankingStats(Number(contestId))
      .then(data => {
        setRankStats({
          normalCount:   data.rankedCount ?? 0,
          excludedCount: data.excludedCount ?? 0,
          profitCount:   0,
          lossCount:     0,
          avgProfitRate: (data.averageProfitRate ?? 0) / 100,
          topNickname:   '-',
          topProfitRate: (data.highestProfitRate ?? 0) / 100,
        });
      })
      .catch(console.error);
  }, [contestId]);

  async function handleCsvExport() {
    if (!contestId) return;
    try {
      const blob = await contestsApi.exportRankings(Number(contestId), { keyword: search.trim() || undefined });
      downloadCsv(blob, `contest-${contestId}-rankings`);
    } catch (e) {
      console.error(e);
    }
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return participants.filter(p => {
      if (!q) return true;
      if (searchType === 'nickname') return p.nickname.toLowerCase().includes(q);
      if (searchType === 'email') return p.email.toLowerCase().includes(q);
      return p.nickname.toLowerCase().includes(q) || p.email.toLowerCase().includes(q);
    });
  }, [participants, search, searchType]);

  const ranked = useMemo(() => {
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDir === 'desc' ? bVal.localeCompare(aVal) : aVal.localeCompare(bVal);
      }
      return sortDir === 'desc' ? (bVal as number) - (aVal as number) : (aVal as number) - (bVal as number);
    });
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(ranked.length / PAGE_SIZE));
  const paginated = ranked.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      if (sortDir === 'desc') { setSortDir('asc'); } else { setSortKey(null); }
    } else {
      setSortKey(key); setSortDir('desc');
    }
    setCurrentPage(1);
  }

  function handleEditOpen() {
    if (!contest) return;
    setEditForm({
      name:              contest.name,
      category:          contest.category as ContestCategory,
      startDate:         contest.startDate,
      endDate:           contest.endDate,
      seedMoney:         String(contest.seedMoney / 10000),
      maxParticipants:   contest.maxParticipants ? String(contest.maxParticipants) : '',
      profitStandard:    (contest.profitStandard as '수익률' | '절대금액') ?? '수익률',
      description:       contest.description,
      limitOrderAmount:  contest.limitOrderAmount,
      limitHoldingRatio: contest.limitHoldingRatio,
      allowShortSelling: contest.allowShortSelling,
    });
    setIsEditOpen(true);
  }

  async function handleEditSave(e: { preventDefault(): void }) {
    e.preventDefault();
    if (!contest) return;
    try {
      await contestsApi.updateContest(Number(contest.id), {
        title:           editForm.name,
        description:     editForm.description,
        seedMoney:       (Number(editForm.seedMoney) || 0) * 10000,
        maxParticipants: editForm.maxParticipants ? Number(editForm.maxParticipants) : undefined,
        stockType:       editForm.category,
        profitCriteria:  editForm.profitStandard,
        startAt:         editForm.startDate ? `${editForm.startDate}T00:00:00` : undefined,
        endAt:           editForm.endDate ? `${editForm.endDate}T23:59:59` : undefined,
      });
      setContest(prev => prev ? {
        ...prev,
        name:              editForm.name,
        category:          editForm.category,
        startDate:         editForm.startDate,
        endDate:           editForm.endDate,
        seedMoney:         (Number(editForm.seedMoney) || 0) * 10000,
        maxParticipants:   editForm.maxParticipants ? Number(editForm.maxParticipants) : null,
        profitStandard:    editForm.profitStandard,
        description:       editForm.description,
        limitOrderAmount:  editForm.limitOrderAmount,
        limitHoldingRatio: editForm.limitHoldingRatio,
        allowShortSelling: editForm.allowShortSelling,
      } : prev);
      setIsEditOpen(false);
    } catch (e) {
      console.error(e);
    }
  }

  async function handleConfirm() {
    if (!contest) return;
    try {
      if (confirmAction === 'end') {
        await contestsApi.endContest(Number(contest.id));
        setContest(prev => prev ? { ...prev, status: 'ENDED' } : prev);
      } else {
        await contestsApi.cancelContest(Number(contest.id));
        navigate('/admin/contests');
      }
      setConfirmAction(null);
      setConfirmReason('');
    } catch (e) {
      console.error(e);
    }
  }

  if (loading) return <div className="flex items-center justify-center py-20 text-slate-400">불러오는 중...</div>;
  if (!contest) return <div className="flex items-center justify-center py-20 text-slate-400">대회를 찾을 수 없습니다.</div>;

  return (
    <>
      <PageHeader
        title={contest.name}
        description={`${contest.startDate} ~ ${contest.endDate} · ${contest.category}`}
        actions={
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/admin/contests')} className="flex cursor-pointer items-center gap-1 rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50">
              <ArrowLeft size={14} />목록으로
            </button>
            {contest.status === 'ONGOING' && (
              <>
                <Button variant="secondary" className="h-9 text-sm" onClick={() => isEditOpen ? setIsEditOpen(false) : handleEditOpen()}>수정</Button>
                <Button variant="danger" className="h-9 text-sm" onClick={() => { setConfirmReason(''); setConfirmAction('end'); }}>대회 종료</Button>
              </>
            )}
            {(contest.status === 'CLOSING_SOON' || contest.status === 'SCHEDULED') && (
              <>
                <Button variant="secondary" className="h-9 text-sm" onClick={() => isEditOpen ? setIsEditOpen(false) : handleEditOpen()}>수정</Button>
                <Button variant="danger" className="h-9 text-sm" onClick={() => { setConfirmReason(''); setConfirmAction('cancel'); }}>대회 취소</Button>
              </>
            )}
            {contest.status === 'ENDED' && <Button variant="secondary" className="h-9 text-sm" onClick={handleCsvExport}>결과 내보내기</Button>}
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">대회 정보</h2>
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_BADGE[contest.status]}`}>{STATUS_LABEL[contest.status]}</span>
          </div>
          <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
            <div className="flex items-center justify-between"><span className="text-slate-500">기간</span><span className="font-medium text-slate-900">{contest.startDate} ~ {contest.endDate}</span></div>
            <div className="flex items-center justify-between"><span className="text-slate-500">시드머니</span><span className="font-medium text-slate-900">{formatMoney(contest.seedMoney)}</span></div>
            <div className="flex items-center justify-between"><span className="text-slate-500">분야</span><span className="font-medium text-slate-900">{contest.category}</span></div>
            <div className="flex items-center justify-between"><span className="text-slate-500">최대 인원</span><span className="font-medium text-slate-900">{contest.maxParticipants ? `${contest.maxParticipants}명` : '제한없음'}</span></div>
            <div className="flex items-center justify-between"><span className="text-slate-500">수익 기준</span><span className="font-medium text-slate-900">{contest.profitStandard}</span></div>
            <div className="flex items-center justify-between"><span className="text-slate-500">생성일</span><span className="font-medium text-slate-900">{contest.createdAt} ({contest.createdBy})</span></div>
            <div className="col-span-2 flex items-center justify-between border-t border-slate-100 pt-3"><span className="text-slate-500">대회 설명</span><span className="font-medium text-slate-900">{contest.description}</span></div>
            <div className="col-span-2 flex items-center gap-6 border-t border-slate-100 pt-3">
              <span className="text-slate-500">거래 제한</span>
              <span className={`text-xs font-medium ${contest.limitOrderAmount ? 'text-emerald-600' : 'text-slate-400'}`}>주문 금액 제한 {contest.limitOrderAmount ? '적용' : '미적용'}</span>
              <span className={`text-xs font-medium ${contest.limitHoldingRatio ? 'text-emerald-600' : 'text-slate-400'}`}>보유 비중 제한 {contest.limitHoldingRatio ? '적용' : '미적용'}</span>
              <span className={`text-xs font-medium ${contest.allowShortSelling ? 'text-emerald-600' : 'text-slate-400'}`}>공매도 {contest.allowShortSelling ? '허용' : '비허용'}</span>
            </div>
          </div>
        </Card>

        <div className="space-y-3">
          <Card className="py-3"><p className="text-xs text-slate-500">참가자 수 / 제외</p><p className="mt-1 text-xl font-bold text-slate-900">{rankStats.normalCount}명<span className="ml-2 text-sm font-medium text-rose-500">(제외 {rankStats.excludedCount}명)</span></p></Card>
          <Card className="py-3"><p className="text-xs text-slate-500">평균 수익률</p><p className={`mt-1 text-xl font-bold ${rankStats.avgProfitRate >= 0 ? 'text-rose-600' : 'text-blue-600'}`}>{formatRate(rankStats.avgProfitRate)}</p></Card>
          <Card className="py-3"><p className="text-xs text-slate-500">최고 수익률</p><p className="mt-1 text-sm font-bold text-rose-600">{formatRate(rankStats.topProfitRate)}<span className="ml-1 text-xs font-medium text-slate-500">({rankStats.topNickname})</span></p></Card>
        </div>
      </div>

      {isEditOpen && (
        <Card>
          <h2 className="mb-4 text-base font-semibold text-slate-900">대회 정보 수정</h2>
          <form onSubmit={handleEditSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="mb-1 block text-sm font-medium text-slate-700">대회명</label><input type="text" value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm focus:border-[#1565C0] focus:outline-none" /></div>
              <div><label className="mb-1 block text-sm font-medium text-slate-700">분야</label><select value={editForm.category} onChange={e => setEditForm(f => ({ ...f, category: e.target.value as ContestCategory }))} className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm focus:border-[#1565C0] focus:outline-none">{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
              <div><label className="mb-1 block text-sm font-medium text-slate-700">시작일</label><input type="date" value={editForm.startDate} onChange={e => setEditForm(f => ({ ...f, startDate: e.target.value }))} className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm focus:border-[#1565C0] focus:outline-none" /></div>
              <div><label className="mb-1 block text-sm font-medium text-slate-700">종료일</label><input type="date" value={editForm.endDate} onChange={e => setEditForm(f => ({ ...f, endDate: e.target.value }))} className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm focus:border-[#1565C0] focus:outline-none" /></div>
              <div><label className="mb-1 block text-sm font-medium text-slate-700">시드머니 (만원)</label><input type="number" value={editForm.seedMoney} onChange={e => setEditForm(f => ({ ...f, seedMoney: e.target.value }))} className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm focus:border-[#1565C0] focus:outline-none" /></div>
              <div><label className="mb-1 block text-sm font-medium text-slate-700">최대 인원 (빈칸 = 제한없음)</label><input type="number" value={editForm.maxParticipants} onChange={e => setEditForm(f => ({ ...f, maxParticipants: e.target.value }))} className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm focus:border-[#1565C0] focus:outline-none" /></div>
              <div><label className="mb-1 block text-sm font-medium text-slate-700">수익 기준</label><select value={editForm.profitStandard} onChange={e => setEditForm(f => ({ ...f, profitStandard: e.target.value as '수익률' | '절대금액' }))} className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm focus:border-[#1565C0] focus:outline-none"><option value="수익률">수익률</option><option value="절대금액">절대금액</option></select></div>
            </div>
            <div><label className="mb-1 block text-sm font-medium text-slate-700">대회 설명</label><textarea value={editForm.description} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} rows={2} className="w-full resize-none rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-[#1565C0] focus:outline-none" /></div>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={editForm.limitOrderAmount} onChange={e => setEditForm(f => ({ ...f, limitOrderAmount: e.target.checked }))} />주문 금액 제한</label>
              <label className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={editForm.limitHoldingRatio} onChange={e => setEditForm(f => ({ ...f, limitHoldingRatio: e.target.checked }))} />보유 비중 제한</label>
              <label className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={editForm.allowShortSelling} onChange={e => setEditForm(f => ({ ...f, allowShortSelling: e.target.checked }))} />공매도 허용</label>
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
              <Button variant="secondary" type="button" onClick={() => setIsEditOpen(false)}>취소</Button>
              <Button variant="brand" type="submit">저장</Button>
            </div>
          </form>
        </Card>
      )}

      <Card className="p-0">
        <div className="flex items-center justify-between border-b border-slate-200 p-4">
          <h2 className="text-base font-semibold text-slate-900">참가자 목록</h2>
          <div className="flex items-center gap-2">
            <div className="flex overflow-hidden rounded-md border border-slate-300 focus-within:border-slate-500">
              <select value={searchType} onChange={e => { setSearchType(e.target.value as typeof searchType); setCurrentPage(1); }} className="h-9 cursor-pointer border-r border-slate-300 bg-slate-50 px-2 text-xs text-slate-600 focus:outline-none">
                <option value="all">전체</option><option value="nickname">닉네임</option><option value="email">이메일</option>
              </select>
              <input type="text" placeholder={searchType === 'nickname' ? '닉네임 검색' : searchType === 'email' ? '이메일 검색' : '닉네임/이메일 검색'} value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }} className="h-9 w-44 px-3 text-sm focus:outline-none" />
            </div>
            <Button variant="secondary" className="h-9 gap-1.5 text-sm" onClick={handleCsvExport}><Download size={14} />CSV 내보내기</Button>
          </div>
        </div>

        <div className="overflow-x-auto min-h-105">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="whitespace-nowrap px-3 py-3 text-center font-medium">순위</th>
                <th className="whitespace-nowrap px-3 py-3 text-center font-medium">닉네임</th>
                <th className="whitespace-nowrap px-3 py-3 text-left font-medium">계정</th>
                {(['profitRate', 'profitAmount', 'currentAsset', 'tradeCount', 'joinedAt'] as const).map((key, i) => (
                  <th key={key} className="whitespace-nowrap px-3 py-3 text-center font-medium">
                    <button onClick={() => handleSort(key)} className="inline-flex cursor-pointer items-center gap-1 hover:text-[#1565C0]">
                      {['수익률', '손익금액', '현재 자산', '거래 횟수', '참가일'][i]}
                      {sortKey === key ? sortDir === 'desc' ? <ChevronDown size={13} className="text-[#1565C0]" /> : <ChevronUp size={13} className="text-[#1565C0]" /> : <ChevronDown size={13} className="text-slate-300" />}
                    </button>
                  </th>
                ))}
                <th className="whitespace-nowrap px-3 py-3 text-center font-medium">상태</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginated.map(p => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className={`px-3 py-3 text-center font-semibold ${p.status === 'EXCLUDED' ? 'text-slate-300' : 'text-slate-900'}`}>
                    {p.status === 'EXCLUDED' ? '-' : p.rank !== null && p.rank <= 3 ? ['🥇', '🥈', '🥉'][(p.rank ?? 1) - 1] : p.rank}
                  </td>
                  <td className={`whitespace-nowrap px-3 py-3 text-center font-medium ${p.status === 'EXCLUDED' ? 'text-slate-400' : 'text-slate-900'}`}>{p.nickname}</td>
                  <td className={`whitespace-nowrap px-3 py-3 text-left ${p.status === 'EXCLUDED' ? 'text-slate-400' : 'text-slate-600'}`}>{p.email}</td>
                  <td className={`whitespace-nowrap px-3 py-3 text-center font-semibold ${p.status === 'EXCLUDED' ? 'text-slate-400' : p.profitRate >= 0 ? 'text-rose-600' : 'text-blue-600'}`}>{formatRate(p.profitRate)}</td>
                  <td className={`whitespace-nowrap px-3 py-3 text-center ${p.status === 'EXCLUDED' ? 'text-slate-400' : p.profitAmount >= 0 ? 'text-rose-600' : 'text-blue-600'}`}>{formatAmount(p.profitAmount)}</td>
                  <td className={`whitespace-nowrap px-3 py-3 text-center ${p.status === 'EXCLUDED' ? 'text-slate-400' : 'text-slate-600'}`}>{formatMoney(p.currentAsset)}</td>
                  <td className={`whitespace-nowrap px-3 py-3 text-center ${p.status === 'EXCLUDED' ? 'text-slate-400' : 'text-slate-600'}`}>{p.tradeCount}회</td>
                  <td className={`whitespace-nowrap px-3 py-3 text-center ${p.status === 'EXCLUDED' ? 'text-slate-400' : 'text-slate-500'}`}>{p.joinedAt}</td>
                  <td className="px-3 py-3"><div className="flex justify-center">{p.status === 'NORMAL' ? <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">정상</span> : <span className="inline-flex items-center rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-medium text-rose-600">제외됨</span>}</div></td>
                </tr>
              ))}
              {paginated.length === 0 && <tr><td colSpan={9} className="py-12 text-center text-sm text-slate-400">검색 결과가 없습니다.</td></tr>}
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

      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-96 rounded-xl bg-white p-6 shadow-xl">
            <h3 className="mb-1 text-base font-semibold text-slate-900">대회 {confirmAction === 'end' ? '종료' : '취소'}</h3>
            <p className="mb-4 text-sm text-slate-500"><span className="font-medium text-slate-800">"{contest.name}"</span>을 {confirmAction === 'end' ? '종료하시겠습니까?' : '취소하시겠습니까?'}{confirmAction === 'cancel' && ' 취소 시 복구할 수 없습니다.'}</p>
            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-slate-700">{confirmAction === 'end' ? '종료 사유' : '취소 사유'}</label>
              <textarea placeholder="사유를 입력하세요" value={confirmReason} onChange={e => setConfirmReason(e.target.value)} rows={3} className="w-full resize-none rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-[#1565C0] focus:outline-none" />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="danger" disabled={!confirmReason.trim()} onClick={handleConfirm}>{confirmAction === 'end' ? '종료' : '취소'}</Button>
              <Button variant="secondary" onClick={() => { setConfirmAction(null); setConfirmReason(''); }}>취소하기</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
