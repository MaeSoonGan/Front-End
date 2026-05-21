import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card } from '../../../components/common/Card';
import { PageHeader } from '../../../components/common/PageHeader';
import { Button } from '../../../components/common/Button';

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

const MOCK_CONTESTS: Contest[] = [
  { id: 'c1',  name: '5월 정기 대회',  category: '전체',   startDate: '05.01', endDate: '05.31', seedMoney: 10000000, maxParticipants: null, participants: 234, profitStandard: '수익률', status: 'ONGOING'     },
  { id: 'c2',  name: '반도체 특별전',  category: '반도체', startDate: '05.05', endDate: '05.20', seedMoney:  5000000, maxParticipants: 100,  participants:  89, profitStandard: '수익률', status: 'CLOSING_SOON' },
  { id: 'c3',  name: '6월 대회',       category: '전체',   startDate: '06.01', endDate: '06.30', seedMoney: 10000000, maxParticipants: null, participants:   0, profitStandard: '수익률', status: 'SCHEDULED'   },
  { id: 'c4',  name: '4월 정기 대회',  category: '전체',   startDate: '04.01', endDate: '04.30', seedMoney: 10000000, maxParticipants: null, participants: 312, profitStandard: '수익률', status: 'ENDED'       },
  { id: 'c5',  name: 'IT 섹터 챌린지', category: 'IT',     startDate: '03.01', endDate: '03.31', seedMoney:  8000000, maxParticipants:  50,  participants:  48, profitStandard: '금액',   status: 'ENDED'       },
  { id: 'c6',  name: '3월 정기 대회',  category: '전체',   startDate: '03.01', endDate: '03.31', seedMoney: 10000000, maxParticipants: null, participants: 287, profitStandard: '수익률', status: 'ENDED'       },
  { id: 'c7',  name: '바이오 챌린지',  category: '바이오', startDate: '02.15', endDate: '03.15', seedMoney:  5000000, maxParticipants:  80,  participants:  76, profitStandard: '수익률', status: 'ENDED'       },
  { id: 'c8',  name: '2월 정기 대회',  category: '전체',   startDate: '02.01', endDate: '02.28', seedMoney: 10000000, maxParticipants: null, participants: 198, profitStandard: '수익률', status: 'ENDED'       },
  { id: 'c9',  name: '금융 섹터전',    category: '금융',   startDate: '01.15', endDate: '02.15', seedMoney:  7000000, maxParticipants:  60,  participants:  55, profitStandard: '수익률', status: 'ENDED'       },
  { id: 'c10', name: '1월 정기 대회',  category: '전체',   startDate: '01.01', endDate: '01.31', seedMoney: 10000000, maxParticipants: null, participants: 245, profitStandard: '수익률', status: 'ENDED'       },
  { id: 'c11', name: '기타 챌린지',    category: '기타',   startDate: '12.01', endDate: '12.31', seedMoney:  3000000, maxParticipants:  30,  participants:  28, profitStandard: '금액',   status: 'ENDED'       },
  { id: 'c12', name: '특별 이벤트',    category: '전체',   startDate: '11.01', endDate: '11.30', seedMoney:  5000000, maxParticipants: null, participants: 401, profitStandard: '수익률', status: 'ENDED'       },
];

const SUMMARY_STATS = {
  total: 12,
  ongoing: 2,
  scheduled: 1,
  totalParticipants: 323,
};

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
  name: '',
  category: '전체',
  startDate: '',
  endDate: '',
  seedMoney: '',
  maxParticipants: '',
  profitStandard: '수익률',
  description: '',
  limitOrderAmount: false,
  limitHoldingRatio: false,
  allowShortSelling: false,
};

const PAGE_SIZE = 5;

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
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_BADGE_CLASS[status]}`}>
      {STATUS_LABEL[status]}
    </span>
  );
}

export function AdminContestManagePage() {
  const [activeTab, setActiveTab]     = useState<TabFilter>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [contests, setContests]       = useState<Contest[]>(MOCK_CONTESTS);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId]   = useState<string | null>(null);
  const [form, setForm]             = useState<FormState>({ ...EMPTY_FORM });

  const filtered = useMemo(() => {
    return contests.filter(c => {
      if (activeTab === 'ALL') return true;
      if (activeTab === 'ONGOING') return c.status === 'ONGOING';
      if (activeTab === 'SCHEDULED') return c.status === 'SCHEDULED' || c.status === 'CLOSING_SOON';
      return c.status === activeTab;
    });
  }, [contests, activeTab]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function handleTabChange(tab: TabFilter) {
    setActiveTab(tab);
    setCurrentPage(1);
  }

  function handleNewContest() {
    if (isFormOpen && editingId === null) {
      setIsFormOpen(false);
      return;
    }
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
    setIsFormOpen(true);
  }

  function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    const now = new Date();
    const start = form.startDate ? new Date(form.startDate) : now;
    const resolvedStatus: ContestStatus = start > now ? 'SCHEDULED' : 'ONGOING';

    const updated: Contest = {
      id:              editingId ?? `c${Date.now()}`,
      name:            form.name,
      category:        form.category,
      startDate:       toDisplayDate(form.startDate),
      endDate:         toDisplayDate(form.endDate),
      seedMoney:       (Number(form.seedMoney) || 0) * 10000,
      maxParticipants: form.maxParticipants ? Number(form.maxParticipants) : null,
      participants:    0,
      profitStandard:  form.profitStandard,
      status:          editingId
        ? (contests.find(c => c.id === editingId)?.status ?? resolvedStatus)
        : resolvedStatus,
    };
    setContests(prev =>
      editingId
        ? prev.map(c => (c.id === editingId ? updated : c))
        : [updated, ...prev],
    );
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
    setIsFormOpen(false);
  }

  const isFormValid =
    form.name.trim() !== '' &&
    form.startDate !== '' &&
    form.endDate !== '' &&
    form.seedMoney !== '';

  function handleFormCancel() {
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
    setIsFormOpen(false);
  }

  return (
    <>
      <PageHeader
        title="대회 목록"
        actions={
          <Button variant="brand" onClick={handleNewContest}>
            <Plus size={16} className="mr-1.5" />
            새 대회 생성
          </Button>
        }
      />

      {/* 요약 카드 */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="py-6">
          <p className="text-xs text-slate-500">전체 대회</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{SUMMARY_STATS.total}개</p>
        </Card>
        <Card className="py-6">
          <p className="text-xs text-slate-500">진행 중</p>
          <p className="mt-2 text-2xl font-bold text-emerald-600">{SUMMARY_STATS.ongoing}개</p>
        </Card>
        <Card className="py-6">
          <p className="text-xs text-slate-500">예정</p>
          <p className="mt-2 text-2xl font-bold text-sky-600">{SUMMARY_STATS.scheduled}개</p>
        </Card>
        <Card className="py-6">
          <p className="text-xs text-slate-500">총 참가자</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{SUMMARY_STATS.totalParticipants.toLocaleString('ko-KR')}명</p>
        </Card>
      </div>

      <div className={`grid gap-6 ${isFormOpen ? 'lg:grid-cols-5' : ''}`}>
        <div className={isFormOpen ? 'lg:col-span-3' : ''}>
          <Card className="p-0">
            {/* 탭 필터 */}
            <div className="border-b border-slate-200 px-4 pt-4">
              <div className="flex gap-1">
                {TAB_LIST.map(tab => (
                  <button
                    key={tab.value}
                    onClick={() => handleTabChange(tab.value)}
                    className={`cursor-pointer rounded-t-md px-4 py-2 text-sm font-medium transition-colors ${
                      activeTab === tab.value
                        ? 'border-b-2 border-[#1565C0] text-[#1565C0]'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 테이블 */}
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
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
                  {paginated.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-sm text-slate-400">
                        대회가 없습니다.
                      </td>
                    </tr>
                  ) : (
                    paginated.map(contest => {
                      const remaining = contest.maxParticipants
                        ? (contest.maxParticipants - contest.participants) / contest.maxParticipants
                        : null;
                      const participantColor =
                        contest.status === 'ENDED' ? 'text-slate-900' :
                        remaining !== null && remaining <= 0.1 ? 'text-rose-600 font-semibold' :
                        remaining !== null && remaining <= 0.2 ? 'text-orange-500 font-semibold' :
                        'text-slate-900';

                      return (
                        <tr key={contest.id} className="hover:bg-slate-50">
                          <td className="whitespace-nowrap px-3 py-3 text-center font-medium text-slate-900">
                            <Link
                              to={`/admin/contests/${contest.id}`}
                              className="hover:text-[#1565C0] hover:underline"
                            >
                              {contest.name}
                            </Link>
                          </td>
                          <td className="whitespace-nowrap px-3 py-3 text-center text-slate-600">
                            {contest.category}
                          </td>
                          <td className="whitespace-nowrap px-3 py-3 text-center text-slate-600">
                            {contest.startDate}~{contest.endDate}
                          </td>
                          <td className="whitespace-nowrap px-3 py-3 text-center text-slate-600">
                            {formatSeedMoney(contest.seedMoney)}
                          </td>
                          <td className="whitespace-nowrap px-3 py-3 text-center text-slate-600">
                            {contest.maxParticipants ? `${contest.maxParticipants}명` : '무제한'}
                          </td>
                          <td className={`whitespace-nowrap px-3 py-3 text-center ${participantColor}`}>
                            {(contest.status === 'ONGOING' || contest.status === 'ENDED')
                              ? `${contest.participants}명`
                              : contest.maxParticipants
                                ? `${contest.participants}/${contest.maxParticipants}명`
                                : `${contest.participants}명`
                            }
                          </td>
                          <td className="whitespace-nowrap px-3 py-3 text-center text-slate-600">
                            {contest.profitStandard}
                          </td>
                          <td className="px-3 py-3">
                            <div className="flex justify-center">
                              <StatusBadge status={contest.status} />
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* 페이지네이션 */}
            <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-sm text-slate-500">
              <span>총 {filtered.length}건</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="cursor-pointer rounded p-1 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`cursor-pointer min-w-7 rounded px-2 py-1 text-sm font-medium ${
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
                  className="cursor-pointer rounded p-1 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </Card>
        </div>

        {/* 새 대회 생성 / 수정 폼 */}
        {isFormOpen && (
          <div className="lg:col-span-2">
            <Card>
              <h2 className="mb-4 text-base font-semibold text-slate-900">
                {editingId ? '대회 수정' : '새 대회 생성'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* 대회명 + 종목 제한 */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">대회명</label>
                    <input
                      type="text"
                      placeholder="대회 이름 입력"
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm focus:border-[#1565C0] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">종목 제한</label>
                    <select
                      value={form.category}
                      onChange={e => setForm(f => ({ ...f, category: e.target.value as ContestCategory }))}
                      className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm focus:border-[#1565C0] focus:outline-none"
                    >
                      {CATEGORY_OPTIONS.map(c => (
                        <option key={c} value={c}>{c === '전체' ? '전체 종목' : c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 시작일 + 종료일 */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">시작일</label>
                    <input
                      type="date"
                      value={form.startDate}
                      onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                      className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm focus:border-[#1565C0] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">종료일</label>
                    <input
                      type="date"
                      value={form.endDate}
                      onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                      className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm focus:border-[#1565C0] focus:outline-none"
                    />
                  </div>
                </div>

                {/* 시드머니 + 최대 참여 인원 */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">시드머니 (만원)</label>
                    <input
                      type="number"
                      placeholder="1,000"
                      value={form.seedMoney}
                      onChange={e => setForm(f => ({ ...f, seedMoney: e.target.value }))}
                      className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm focus:border-[#1565C0] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">최대 참여 인원</label>
                    <input
                      type="number"
                      placeholder="공백 시 무제한"
                      value={form.maxParticipants}
                      onChange={e => setForm(f => ({ ...f, maxParticipants: e.target.value }))}
                      className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm focus:border-[#1565C0] focus:outline-none"
                    />
                  </div>
                </div>

                {/* 수익률 산정 기준 */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">수익률 산정 기준</label>
                  <select
                    value={form.profitStandard}
                    onChange={e => setForm(f => ({ ...f, profitStandard: e.target.value as ProfitStandard }))}
                    className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm focus:border-[#1565C0] focus:outline-none"
                  >
                    <option value="수익률">수익률 기준 (%)</option>
                    <option value="금액">금액 기준 (원)</option>
                  </select>
                </div>

                {/* 대회 설명 */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">대회 설명</label>
                  <textarea
                    placeholder="대회 설명"
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    rows={3}
                    className="w-full resize-none rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-[#1565C0] focus:outline-none"
                  />
                </div>

                {/* 거래 제한 옵션 */}
                <div className="space-y-2">
                  {[
                    { key: 'limitOrderAmount',  label: '1회 최대 주문 금액 제한' },
                    { key: 'limitHoldingRatio', label: '1종목 최대 보유 비율 제한' },
                    { key: 'allowShortSelling', label: '공매도 허용' },
                  ].map(opt => (
                    <label key={opt.key} className="flex items-center gap-2 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        checked={form[opt.key as keyof FormState] as boolean}
                        onChange={e => setForm(f => ({ ...f, [opt.key]: e.target.checked }))}
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>

                <div className="flex gap-2 border-t border-slate-100 pt-3">
                  <Button variant="brand" type="submit" className="flex-1" disabled={!isFormValid}>
                    {editingId ? '저장' : '생성'}
                  </Button>
                  <Button variant="secondary" type="button" onClick={handleFormCancel}>
                    취소
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}
      </div>
    </>
  );
}
