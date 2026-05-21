import { useState } from 'react';
import { Search, Download, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import { Card } from '../../../components/common/Card';
import { useAdminPageActions } from '../../../contexts/AdminPageActionsContext';
import { Button } from '../../../components/common/Button';
import { TextInput } from '../../../components/common/TextInput';

type SuspensionType = 'MANUAL' | 'AUTO';
type SuspensionStatus = 'SUSPENDED' | 'RELEASED';
type ProcessType = '계정 정지' | '계정 해제';

interface SuspensionRecord {
  id: string;
  targetNickname: string;
  targetAccountId: string;
  type: SuspensionType;
  reason: string;
  adminName: string;
  processedAt: string;
  status: SuspensionStatus;
}

// GET /api/admin/members/suspensions
const MOCK_SUSPENSIONS: SuspensionRecord[] = [
  {
    id: 's1',
    targetNickname: '이영희',
    targetAccountId: 'younghee',
    type: 'MANUAL',
    reason: '비정상 주문',
    adminName: 'admin01',
    processedAt: '25.05.08\n14:32',
    status: 'SUSPENDED',
  },
  {
    id: 's2',
    targetNickname: '홍길동',
    targetAccountId: 'gildong',
    type: 'AUTO',
    reason: '로그인 5회 실패',
    adminName: '시스템',
    processedAt: '25.04.22\n09:14',
    status: 'RELEASED',
  },
  {
    id: 's3',
    targetNickname: '박민준',
    targetAccountId: 'minjun',
    type: 'MANUAL',
    reason: '중복 계정 어뷰징 의심',
    adminName: 'admin01',
    processedAt: '25.04.15\n11:30',
    status: 'RELEASED',
  },
  {
    id: 's4',
    targetNickname: '김태스트',
    targetAccountId: 'testkim',
    type: 'AUTO',
    reason: '로그인 5회 실패',
    adminName: '시스템',
    processedAt: '25.04.10\n16:05',
    status: 'RELEASED',
  },
  {
    id: 's5',
    targetNickname: '최의심',
    targetAccountId: 'suspicious',
    type: 'MANUAL',
    reason: '타인 계정 도용 의심',
    adminName: 'admin02',
    processedAt: '25.03.28\n13:20',
    status: 'SUSPENDED',
  },
];

const SUMMARY_STATS = {
  total: 84,
  currentlySuspended: 36,
  thisMonth: 5,
  autoSuspended: 12,
};

const PAGE_SIZE = 5;

function TypeBadge({ type }: { type: SuspensionType }) {
  if (type === 'MANUAL') {
    return (
      <span className="inline-flex items-center rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-medium text-rose-600">
        수동 정지
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-600">
      자동 정지
    </span>
  );
}

function StatusBadge({ status }: { status: SuspensionStatus }) {
  if (status === 'SUSPENDED') {
    return (
      <span className="inline-flex items-center rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-medium text-rose-600">
        정지
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-600">
      해제
    </span>
  );
}

export function AdminSuspensionPage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | SuspensionType>('ALL');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const [targetMember, setTargetMember] = useState('');
  const [processType, setProcessType] = useState<ProcessType>('계정 정지');
  const [reason, setReason] = useState('');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const filtered = MOCK_SUSPENSIONS.filter(r => {
    const q = searchQuery || search;
    const matchSearch =
      !q || r.targetNickname.includes(q) || r.targetAccountId.includes(q) || r.adminName.includes(q);
    const matchType = typeFilter === 'ALL' || r.type === typeFilter;
    return matchSearch && matchType;
  });

  const totalCount = SUMMARY_STATS.total;
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const startIdx = (currentPage - 1) * PAGE_SIZE + 1;
  const endIdx = Math.min(currentPage * PAGE_SIZE, filtered.length);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearchQuery(search);
    setCurrentPage(1);
  }

  function handleProcessSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsConfirmOpen(true);
  }

  function handleConfirm() {
    // POST /api/admin/members/suspensions
    setIsConfirmOpen(false);
    handleReset();
  }

  function handleReset() {
    setTargetMember('');
    setProcessType('계정 정지');
    setReason('');
  }

  function handleReleaseRow(record: SuspensionRecord) {
    // PATCH /api/admin/members/suspensions/:id/release
    console.log('release', record.id);
  }

  function handleDetailRow(record: SuspensionRecord) {
    // GET /api/admin/members/suspensions/:id
    console.log('detail', record.id);
  }

  const csvAction = (
    <button
      onClick={() => {/* GET /api/admin/members/suspensions/export */}}
      className="flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
    >
      <Download size={15} />
      CSV 내보내기
    </button>
  );

  useAdminPageActions(csvAction);

  return (
    <>
      {/* 처리 확인 모달 */}
      {isConfirmOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setIsConfirmOpen(false)}
        >
          <div
            className="w-105 rounded-lg bg-white p-6 shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="mb-4 text-base font-bold text-slate-900">처리 내용 확인</h3>
            <div className="mb-5 space-y-3 rounded-md bg-slate-50 p-4 text-sm">
              <div className="flex gap-2">
                <span className="w-24 shrink-0 text-slate-500">대상 회원</span>
                <span className="font-medium text-slate-900">{targetMember}</span>
              </div>
              <div className="flex gap-2">
                <span className="w-24 shrink-0 text-slate-500">처리 유형</span>
                <span className={`font-semibold ${processType === '계정 정지' ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {processType}
                </span>
              </div>
              <div className="flex gap-2">
                <span className="w-24 shrink-0 text-slate-500">사유</span>
                <span className="text-slate-700">{reason}</span>
              </div>
            </div>
            {processType === '계정 정지' && (
              <div className="mb-5 flex gap-2 rounded-md bg-rose-50 p-3 text-xs text-rose-700">
                <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                <p>처리 즉시 해당 회원의 로그인 및 모든 거래가 차단됩니다.</p>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="secondary" type="button" onClick={() => setIsConfirmOpen(false)}>
                취소
              </Button>
              <Button variant="brand" type="button" onClick={handleConfirm}>
                확인 후 처리
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 요약 카드 */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <p className="text-sm text-slate-500">전체 정지 이력</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{SUMMARY_STATS.total}건</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">현재 정지 중</p>
          <p className="mt-1 text-2xl font-bold text-rose-600">{SUMMARY_STATS.currentlySuspended}명</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">이번 달 정지</p>
          <p className="mt-1 text-2xl font-bold text-rose-600">{SUMMARY_STATS.thisMonth}건</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">자동 정지 (로그인 실패)</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{SUMMARY_STATS.autoSuspended}건</p>
        </Card>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* 왼쪽: 정지 이력 목록 */}
        <div className="lg:col-span-3">
          <Card>
            <h2 className="mb-4 text-base font-semibold text-slate-900">정지 이력 목록</h2>

            {/* 필터 - 1행 구조 */}
            <form onSubmit={handleSearch} className="mb-4 flex flex-wrap gap-2">
              <div className="relative min-w-36 flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="닉네임 / 관리자 검색"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full rounded-md border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-[#1565C0] focus:ring-1 focus:ring-[#1565C0]"
                />
              </div>
              <select
                value={typeFilter}
                onChange={e => { setTypeFilter(e.target.value as 'ALL' | SuspensionType); setCurrentPage(1); }}
                className="rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#1565C0]"
              >
                <option value="ALL">전체</option>
                <option value="MANUAL">수동</option>
                <option value="AUTO">자동</option>
              </select>
              <input
                type="date"
                value={dateFrom}
                onChange={e => setDateFrom(e.target.value)}
                className="rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#1565C0]"
              />
              <span className="flex items-center text-sm text-slate-400">~</span>
              <input
                type="date"
                value={dateTo}
                onChange={e => setDateTo(e.target.value)}
                className="rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#1565C0]"
              />
              <button
                type="submit"
                className="rounded-md bg-[#1565C0] px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
              >
                검색
              </button>
            </form>

            {/* 테이블 */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-xs text-slate-500">
                    <th className="pb-2 pr-3 font-medium">대상 회원</th>
                    <th className="pb-2 pr-3 text-center font-medium">유형</th>
                    <th className="pb-2 pr-3 text-center font-medium">사유</th>
                    <th className="pb-2 pr-3 font-medium">처리 관리자</th>
                    <th className="pb-2 pr-3 text-center font-medium">일시</th>
                    <th className="pb-2 pr-3 text-center font-medium">상태</th>
                    <th className="pb-2 text-center font-medium">관리</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginated.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        검색 결과가 없습니다.
                      </td>
                    </tr>
                  ) : (
                    paginated.map(record => (
                      <tr key={record.id} className="hover:bg-slate-50">
                        <td className="py-3 pr-3 font-medium text-slate-900">
                          {record.targetNickname}
                        </td>
                        <td className="py-3 pr-3">
                          <div className="flex justify-center">
                            <TypeBadge type={record.type} />
                          </div>
                        </td>
                        <td className="py-3 pr-3 max-w-28 text-center">
                          <p className="truncate text-slate-700" title={record.reason}>
                            {record.reason}
                          </p>
                        </td>
                        <td className="py-3 pr-3 text-slate-600">{record.adminName}</td>
                        <td className="py-3 pr-3 text-center text-slate-500 whitespace-pre-line text-xs">
                          {record.processedAt}
                        </td>
                        <td className="py-3 pr-3">
                          <div className="flex justify-center">
                            <StatusBadge status={record.status} />
                          </div>
                        </td>
                        <td className="py-3">
                          <div className="flex justify-center">
                            {record.status === 'SUSPENDED' ? (
                              <button
                                onClick={() => handleReleaseRow(record)}
                                className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-600 hover:bg-emerald-200"
                              >
                                해제
                              </button>
                            ) : (
                              <button
                                onClick={() => handleDetailRow(record)}
                                className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 hover:bg-slate-200"
                              >
                                상세
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* 페이지네이션 */}
            <div className="mt-4 flex items-center justify-between">
              <p className="text-xs text-slate-500">
                총 {totalCount}건 중 {startIdx}-{endIdx}번
              </p>
              <div className="flex items-center gap-1">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                  className="rounded p-1 text-slate-500 hover:bg-slate-100 disabled:opacity-40"
                >
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`rounded px-2.5 py-0.5 text-sm ${
                      page === currentPage
                        ? 'bg-[#1565C0] text-white'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => p + 1)}
                  className="rounded p-1 text-slate-500 hover:bg-slate-100 disabled:opacity-40"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </Card>
        </div>

        {/* 오른쪽: 계정 정지 처리 */}
        <div className="lg:col-span-2">
          <Card>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900">계정 정지 처리</h2>
              <span className="text-xs text-slate-400">직접 정지 / 해제</span>
            </div>

            <form onSubmit={handleProcessSubmit} className="space-y-4">
              <TextInput
                label="대상 회원 (닉네임 또는 이메일)"
                placeholder="예) 홍길동 또는 hong@..."
                value={targetMember}
                onChange={e => setTargetMember(e.target.value)}
                required
              />

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">처리 유형</label>
                <select
                  value={processType}
                  onChange={e => setProcessType(e.target.value as ProcessType)}
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#1565C0] focus:ring-1 focus:ring-[#1565C0]"
                >
                  <option value="계정 정지">계정 정지</option>
                  <option value="계정 해제">계정 해제</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  정지 사유 (필수)
                </label>
                <textarea
                  placeholder={`정지 사유를 상세히 입력하세요.\n예) 비정상적인 주문 패턴 감지 — 3분 내 50건 주문`}
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  required
                  rows={4}
                  className="w-full resize-none rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#1565C0] focus:ring-1 focus:ring-[#1565C0]"
                />
              </div>

              {processType === '계정 정지' && (
                <div className="flex gap-2 rounded-md bg-rose-50 p-3 text-xs text-rose-700">
                  <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                  <p>
                    계정 정지 시 해당 회원은 로그인 및 모든 거래가 즉시 차단됩니다. 처리 후 감사 로그에 자동 기록됩니다.
                  </p>
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <Button variant="brand" type="submit" className="flex-1">
                  처리하기
                </Button>
                <Button variant="secondary" type="button" onClick={handleReset}>
                  초기화
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </>
  );
}
