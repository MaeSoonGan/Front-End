import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plus, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { getPaginationPages } from '../../../utils/pagination';
import { Card } from '../../../components/common/Card';
import { useAdminPageActions } from '../../../contexts/AdminPageActionsContext';
import { Button } from '../../../components/common/Button';
import { contestsApi } from '../../../api/admin/contests';

type ContestStatus = 'ONGOING' | 'CLOSING_SOON' | 'SCHEDULED' | 'ENDED';
type TabFilter = 'ALL' | 'ONGOING' | 'SCHEDULED' | 'ENDED';
type ProfitStandard = '수익률' | '금액';
type ContestCategory = '전체' | '반도체' | 'IT' | '바이오' | '금융' | '기타';

interface Contest {
  id: string;
  name: string;
  category: ContestCategory;
  startDate: string;
  endDate: string;
  seedMoney: number;
  maxParticipants: number | null;
  participants: number;
  profitStandard: ProfitStandard;
  status: ContestStatus;
}

interface FormState {
  name: string;
  category: ContestCategory;
  startDate: string;
  endDate: string;
  seedMoney: string;
  maxParticipants: string;
  profitStandard: ProfitStandard;
  description: string;
  limitOrderAmount: boolean;
  limitHoldingRatio: boolean;
  allowShortSelling: boolean;
}

const STATUS_LABEL: Record<ContestStatus, string> = {
  ONGOING:      '진행중',
  CLOSING_SOON: '마감임박',
  SCHEDULED:    '예정',
  ENDED:        '종료',
};

const STATUS_BADGE_CLASS: Record<ContestStatus, string> = {
  ONGOING:      'bg-emerald-100 text-emerald-600',
  CLOSING_SOON: 'bg-orange-100 text-orange-600',
  SCHEDULED:    'bg-sky-100 text-sky-600',
  ENDED:        'bg-rose-100 text-rose-600',
};

const TAB_LIST: { label: string; value: TabFilter }[] = [
  { label: '전체',   value: 'ALL'       },
  { label: '진행중', value: 'ONGOING'   },
  { label: '예정',   value: 'SCHEDULED' },
  { label: '종료',   value: 'ENDED'     },
];

const CATEGORY_OPTIONS: ContestCategory[] = ['전체', '반도체', 'IT', '바이오', '금융', '기타'];

const EMPTY_FORM: FormState = {
  name: '', category: '전체', startDate: '', endDate: '',
  seedMoney: '', maxParticipants: '', profitStandard: '수익률',
  description: '', limitOrderAmount: false, limitHoldingRatio: false, allowShortSelling: false,
};

const PAGE_SIZE = 10;

function toApiStatus(tab: TabFilter): string | undefined {
  if (tab === 'ALL') return undefined;
  if (tab === 'ONGOING') return 'ACTIVE';
  return tab;
}

function toUiStatus(status: string): ContestStatus {
  if (status === 'ACTIVE' || status === 'ONGOING') return 'ONGOING';
  if (status === 'CLOSING_SOON') return 'CLOSING_SOON';
  if (status === 'SCHEDULED') return 'SCHEDULED';
  return 'ENDED';
}

function isoToDisplay(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  return `${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

function formatSeedMoney(amount: number): string {
  return `${(amount / 10000).toLocaleString('ko-KR')}만원`;
}

function toDisplayDate(d: string): string {
  if (!d) return '';
  const parts = d.split('-');
  if (parts.length !== 3) return '';
  return `${parts[1]}.${parts[2]}`;
}

function StatusBadge({ status }: { status: ContestStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_BADGE_CLASS[status] ?? 'bg-slate-100 text-slate-500'}`}>
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}

export function AdminContestManagePage() {
  const [activeTab, setActiveTab]     = useState<TabFilter>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [contests, setContests]       = useState<Contest[]>([]);
  const [totalPages, setTotalPages]   = useState(1);
  const [totalCount, setTotalCount]   = useState(0);
  const [summary, setSummary]         = useState({ total: 0, ongoing: 0, scheduled: 0, totalParticipants: 0 });
  const [loading, setLoading]         = useState(false);

  const [isFormOpen, setIsFormOpen]       = useState(false);
  const [editingId, setEditingId]         = useState<string | null>(null);
  const [form, setForm]                   = useState<FormState>({ ...EMPTY_FORM });
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const fetchContests = useCallback(async () => {
    setLoading(true);
    try {
      const data = await contestsApi.getContests({
        status: toApiStatus(activeTab),
        page:   currentPage - 1,
        size:   PAGE_SIZE,
      });
      setContests(
        (data.content ?? []).map((c: any) => ({
          id:             String(c.contestId),
          name:           c.title ?? '',
          category:       '전체' as ContestCategory,
          startDate:      isoToDisplay(c.startAt),
          endDate:        isoToDisplay(c.endAt),
          seedMoney:      c.seedMoney ?? 0,
          maxParticipants: c.maxParticipants ?? null,
          participants:   c.participantCount ?? 0,
          profitStandard: '수익률' as ProfitStandard,
          status:         toUiStatus(c.status ?? ''),
        }))
      );
      setTotalPages(data.totalPages ?? 1);
      setTotalCount(data.totalElements ?? 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [activeTab, currentPage]);

  useEffect(() => { fetchContests(); }, [fetchContests]);

  useEffect(() => {
    contestsApi.getContestSummary()
      .then(data => setSummary({
        total:            data.totalContestCount ?? 0,
        ongoing:          data.activeContestCount ?? 0,
        scheduled:        data.scheduledContestCount ?? 0,
        totalParticipants: data.totalParticipantCount ?? 0,
      }))
      .catch(console.error);
  }, []);

  const filtered    = contests;
  const safePage    = Math.min(currentPage, totalPages);
  const ghostCount  = PAGE_SIZE - Math.max(filtered.length, filtered.length === 0 ? 1 : 0);

  function handleTabChange(tab: TabFilter) {
    setActiveTab(tab);
    setCurrentPage(1);
  }

  function handleNewContest() {
    if (isFormOpen && editingId === null) { setIsFormOpen(false); return; }
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
    setIsFormOpen(true);
  }

  function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    setIsConfirmOpen(true);
  }

  async function handleConfirm() {
    try {
      const payload = {
        title:           form.name,
        description:     form.description,
        seedMoney:       (Number(form.seedMoney) || 0) * 10000,
        maxParticipants: form.maxParticipants ? Number(form.maxParticipants) : undefined,
        stockType:       form.category === '전체' ? undefined : form.category,
        profitCriteria:  form.profitStandard,
        startAt:         form.startDate ? `${form.startDate}T00:00:00` : undefined,
        endAt:           form.endDate ? `${form.endDate}T23:59:59` : undefined,
      };

      if (editingId) {
        await contestsApi.updateContest(Number(editingId), payload);
      } else {
        await contestsApi.createContest(payload);
      }

      setEditingId(null);
      setForm({ ...EMPTY_FORM });
      setIsConfirmOpen(false);
      setIsFormOpen(false);
      fetchContests();
    } catch (e) {
      console.error(e);
    }
  }

  const isFormValid = form.name.trim() !== '' && form.startDate !== '' && form.endDate !== '' && form.seedMoney !== '';

  function handleFormCancel() {
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
    setIsFormOpen(false);
  }

  const handleNewContestRef = useRef(handleNewContest);
  useEffect(() => { handleNewContestRef.current = handleNewContest; });

  useAdminPageActions(
    <Button variant="brand" onClick={() => handleNewContestRef.current()} className="cursor-pointer">
      <Plus size={16} className="mr-1.5" />
      새 대회 생성
    </Button>
  );

  return (
    <>
      {/* 생성/수정 확인 모달 */}
      {isConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setIsConfirmOpen(false)}>
          <div className="w-96 rounded-lg bg-white p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="mb-4 text-base font-bold text-slate-900">{editingId ? '대회 수정 확인' : '대회 생성 확인'}</h3>
            <div className="mb-5 space-y-2.5 rounded-md bg-slate-50 p-4 text-sm">
              {[
                { label: '대회명',    value: form.name },
                { label: '종목',      value: form.category === '전체' ? '전체 종목' : form.category },
                { label: '기간',      value: `${toDisplayDate(form.startDate)} ~ ${toDisplayDate(form.endDate)}` },
                { label: '시드머니',  value: `${Number(form.seedMoney).toLocaleString('ko-KR')}만원` },
                { label: '최대 인원', value: form.maxParticipants ? `${form.maxParticipants}명` : '무제한' },
                { label: '수익 기준', value: form.profitStandard },
              ].map(({ label, value }) => (
                <div key={label} className="flex gap-2">
                  <span className="w-20 shrink-0 text-slate-500">{label}</span>
                  <span className="font-medium text-slate-900">{value}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="brand" onClick={handleConfirm} className="cursor-pointer">{editingId ? '수정' : '생성'}</Button>
              <Button variant="secondary" onClick={() => setIsConfirmOpen(false)} className="cursor-pointer">취소</Button>
            </div>
          </div>
        </div>
      )}

      {/* 요약 카드 */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="py-6"><p className="text-xs text-slate-500">전체 대회</p><p className="mt-2 text-2xl font-bold text-slate-900">{summary.total}개</p></Card>
        <Card className="py-6"><p className="text-xs text-slate-500">진행 중</p><p className="mt-2 text-2xl font-bold text-emerald-600">{summary.ongoing}개</p></Card>
        <Card className="py-6"><p className="text-xs text-slate-500">예정</p><p className="mt-2 text-2xl font-bold text-sky-600">{summary.scheduled}개</p></Card>
        <Card className="py-6"><p className="text-xs text-slate-500">총 참가자</p><p className="mt-2 text-2xl font-bold text-slate-900">{summary.totalParticipants.toLocaleString('ko-KR')}명</p></Card>
      </div>

      <div className={`grid gap-6 ${isFormOpen ? 'items-stretch lg:grid-cols-5' : ''}`}>
        <div className={isFormOpen ? 'flex flex-col lg:col-span-3' : ''}>
          <Card className={`flex flex-col p-0 ${isFormOpen ? 'flex-1' : ''}`}>
            <div className="border-b border-slate-200 px-4 pt-4">
              <div className="flex gap-1">
                {TAB_LIST.map(tab => (
                  <button key={tab.value} onClick={() => handleTabChange(tab.value)} className={`cursor-pointer rounded-t-md px-4 py-2 text-sm font-medium transition-colors ${activeTab === tab.value ? 'border-b-2 border-[#1565C0] text-[#1565C0]' : 'text-slate-500 hover:text-slate-700'}`}>
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-160 table-fixed text-sm">
                <colgroup>
                  <col className="w-44" /><col className="w-16" /><col className="w-26" />
                  <col className="w-22" /><col className="w-24" /><col className="w-20" />
                  <col className="w-22" /><col className="w-20" />
                </colgroup>
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="whitespace-nowrap px-3 py-3 text-center font-medium">대회명</th>
                    <th className="whitespace-nowrap px-3 py-3 text-center font-medium">종목</th>
                    <th className="whitespace-nowrap px-3 py-3 text-center font-medium">기간</th>
                    <th className="whitespace-nowrap px-3 py-3 text-center font-medium">시드머니</th>
                    <th className="whitespace-nowrap px-3 py-3 text-center font-medium">최대 인원</th>
                    <th className="whitespace-nowrap px-3 py-3 text-center font-medium">참가자</th>
                    <th className="whitespace-nowrap px-3 py-3 text-center font-medium">수익 기준</th>
                    <th className="whitespace-nowrap px-3 py-3 text-center font-medium">상태</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading && <tr><td colSpan={8} className="px-3 py-3 text-center text-sm text-slate-400">불러오는 중...</td></tr>}
                  {!loading && filtered.length === 0 && <tr><td colSpan={8} className="px-3 py-3 text-center text-sm text-slate-400">대회가 없습니다.</td></tr>}
                  {!loading && filtered.map(contest => {
                    const remaining = contest.maxParticipants ? (contest.maxParticipants - contest.participants) / contest.maxParticipants : null;
                    const participantColor = contest.status === 'ENDED' ? 'text-slate-900' : remaining !== null && remaining <= 0.1 ? 'text-rose-600 font-semibold' : remaining !== null && remaining <= 0.2 ? 'text-orange-500 font-semibold' : 'text-slate-900';
                    return (
                      <tr key={contest.id} className="hover:bg-slate-50">
                        <td className="truncate px-3 py-3 text-center font-medium text-slate-900" title={contest.name}>
                          <Link to={`/admin/contests/${contest.id}`} className="hover:text-[#1565C0] hover:underline">{contest.name}</Link>
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-center text-slate-600">{contest.category}</td>
                        <td className="whitespace-nowrap px-3 py-3 text-center text-slate-600">{contest.startDate}~{contest.endDate}</td>
                        <td className="whitespace-nowrap px-3 py-3 text-center text-slate-600">{formatSeedMoney(contest.seedMoney)}</td>
                        <td className="whitespace-nowrap px-3 py-3 text-center text-slate-600">{contest.maxParticipants ? `${contest.maxParticipants}명` : '무제한'}</td>
                        <td className={`whitespace-nowrap px-3 py-3 text-center ${participantColor}`}>
                          {(contest.status === 'ONGOING' || contest.status === 'ENDED') ? `${contest.participants}명` : contest.maxParticipants ? `${contest.participants}/${contest.maxParticipants}명` : `${contest.participants}명`}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-center text-slate-600">{contest.profitStandard}</td>
                        <td className="px-3 py-3"><div className="flex justify-center whitespace-nowrap"><StatusBadge status={contest.status} /></div></td>
                      </tr>
                    );
                  })}
                  {!loading && Array.from({ length: ghostCount }).map((_, i) => (
                    <tr key={`ghost-${i}`}><td colSpan={8} className="px-3 py-3"><span className="invisible select-none text-sm leading-5">x</span></td></tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center border-t border-slate-200 px-4 py-3 text-sm text-slate-500">
              <span className="flex-1">총 {totalCount}건</span>
              <div className="flex items-center gap-1">
                <button onClick={() => setCurrentPage(1)} disabled={safePage === 1} className="cursor-pointer rounded p-1 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"><ChevronsLeft size={16} /></button>
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={safePage === 1} className="cursor-pointer rounded p-1 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"><ChevronLeft size={16} /></button>
                {getPaginationPages(safePage, totalPages).map(page => (
                  <button key={page} onClick={() => setCurrentPage(page)} className={`cursor-pointer min-w-7 rounded px-2 py-1 text-sm font-medium ${safePage === page ? 'bg-[#1565C0] text-white' : 'text-slate-600 hover:bg-slate-100'}`}>{page}</button>
                ))}
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages} className="cursor-pointer rounded p-1 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"><ChevronRight size={16} /></button>
                <button onClick={() => setCurrentPage(totalPages)} disabled={safePage === totalPages} className="cursor-pointer rounded p-1 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"><ChevronsRight size={16} /></button>
              </div>
              <div className="flex-1" />
            </div>
          </Card>
        </div>

        {isFormOpen && (
          <div className="flex flex-col lg:col-span-2">
            <Card className="flex-1">
              <h2 className="mb-4 text-base font-semibold text-slate-900">{editingId ? '대회 수정' : '새 대회 생성'}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">대회명</label>
                    <input type="text" placeholder="대회 이름 입력" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm focus:border-[#1565C0] focus:outline-none" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">종목 제한</label>
                    <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value as ContestCategory }))} className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm focus:border-[#1565C0] focus:outline-none">
                      {CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{c === '전체' ? '전체 종목' : c}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">시작일</label>
                    <input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm focus:border-[#1565C0] focus:outline-none" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">종료일</label>
                    <input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm focus:border-[#1565C0] focus:outline-none" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">시드머니 (만원)</label>
                    <input type="number" placeholder="1,000" value={form.seedMoney} onChange={e => setForm(f => ({ ...f, seedMoney: e.target.value }))} className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm focus:border-[#1565C0] focus:outline-none" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">최대 참여 인원</label>
                    <input type="number" placeholder="공백 시 무제한" value={form.maxParticipants} onChange={e => setForm(f => ({ ...f, maxParticipants: e.target.value }))} className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm focus:border-[#1565C0] focus:outline-none" />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">수익률 산정 기준</label>
                  <select value={form.profitStandard} onChange={e => setForm(f => ({ ...f, profitStandard: e.target.value as ProfitStandard }))} className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm focus:border-[#1565C0] focus:outline-none">
                    <option value="수익률">수익률 기준 (%)</option>
                    <option value="금액">금액 기준 (원)</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">대회 설명</label>
                  <textarea placeholder="대회 설명" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} className="w-full resize-none rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-[#1565C0] focus:outline-none" />
                </div>
                <div className="space-y-2">
                  {[
                    { key: 'limitOrderAmount',  label: '1회 최대 주문 금액 제한' },
                    { key: 'limitHoldingRatio', label: '1종목 최대 보유 비율 제한' },
                    { key: 'allowShortSelling', label: '공매도 허용' },
                  ].map(opt => (
                    <label key={opt.key} className="flex items-center gap-2 text-sm text-slate-700">
                      <input type="checkbox" checked={form[opt.key as keyof FormState] as boolean} onChange={e => setForm(f => ({ ...f, [opt.key]: e.target.checked }))} />
                      {opt.label}
                    </label>
                  ))}
                </div>
                <div className="flex gap-2 border-t border-slate-100 pt-3">
                  <Button variant="brand" type="submit" className="flex-1" disabled={!isFormValid}>{editingId ? '저장' : '생성'}</Button>
                  <Button variant="secondary" type="button" onClick={handleFormCancel}>취소</Button>
                </div>
              </form>
            </Card>
          </div>
        )}
      </div>
    </>
  );
}
