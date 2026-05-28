import { useState, useMemo, useEffect, useCallback } from 'react';
import { Search, Download, ChevronLeft, ChevronRight, AlertTriangle, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { Card } from '../../../components/common/Card';
import { useAdminPageActions } from '../../../contexts/AdminPageActionsContext';
import { Button } from '../../../components/common/Button';
import { TextInput } from '../../../components/common/TextInput';
import { membersApi } from '../../../api/admin/members';

type SuspensionType = 'MANUAL' | 'AUTO';
type SuspensionStatus = 'SUSPENDED' | 'RELEASED';
type ProcessType = '계정 정지' | '계정 해제';
type SortDir = 'asc' | 'desc' | null;

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

function isoToProcessedAt(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  return `${String(d.getFullYear()).slice(2)}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}\n${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

const PAGE_SIZE = 7;

function processedAtToIso(processedAt: string): string {
  const [yy, mm, dd] = processedAt.split('\n')[0].split('.');
  return `20${yy}-${mm}-${dd}`;
}

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

function DateSortIcon({ dir }: { dir: SortDir }) {
  if (!dir) return <ChevronsUpDown size={13} className="ml-1 inline opacity-30" />;
  return dir === 'asc'
    ? <ChevronUp size={13} className="ml-1 inline text-[#1565C0]" />
    : <ChevronDown size={13} className="ml-1 inline text-[#1565C0]" />;
}

export function AdminSuspensionPage() {
  const [records, setRecords]   = useState<SuspensionRecord[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [summary, setSummary]   = useState({ total: 0, currentlySuspended: 0, thisMonth: 0, autoSuspended: 0 });
  const [search, setSearch]     = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | SuspensionType>('ALL');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo]     = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortDir, setSortDir]   = useState<SortDir>(null);

  const [selectedSuspensionId, setSelectedSuspensionId] = useState<string | null>(null);
  const [targetMember, setTargetMember] = useState('');
  const [processType, setProcessType]   = useState<ProcessType>('계정 정지');
  const [reason, setReason]     = useState('');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const fetchRecords = useCallback(async () => {
    try {
      const data = await membersApi.getSuspensions({
        keyword:   appliedSearch || undefined,
        startDate: dateFrom || undefined,
        endDate:   dateTo || undefined,
        page:      currentPage - 1,
        size:      PAGE_SIZE,
      });
      setRecords(
        (data.content ?? []).map((r: any) => ({
          id:               String(r.suspensionId),
          targetNickname:   r.nickname ?? '',
          targetAccountId:  r.accountId ?? '',
          type:             'MANUAL' as SuspensionType,
          reason:           r.reason ?? '',
          adminName:        r.adminName ?? '',
          processedAt:      isoToProcessedAt(r.createdAt),
          status:           (r.status === 'ACTIVE' ? 'SUSPENDED' : 'RELEASED') as SuspensionStatus,
        }))
      );
      setTotalPages(data.totalPages ?? 1);
    } catch (e) {
      console.error(e);
    }
  }, [appliedSearch, dateFrom, dateTo, currentPage]);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  useEffect(() => {
    membersApi.getSuspensionSummary()
      .then(data => setSummary({
        total:              data.totalSuspensionCount ?? 0,
        currentlySuspended: data.activeSuspensionCount ?? 0,
        thisMonth:          data.todaySuspensionCount ?? 0,
        autoSuspended:      0,
      }))
      .catch(console.error);
  }, []);

  const filtered = useMemo(() => {
    let result = [...records];
    if (typeFilter !== 'ALL') result = result.filter(r => r.type === typeFilter);
    if (sortDir) result = [...result].sort((a, b) => {
      const cmp = a.processedAt.localeCompare(b.processedAt);
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return result;
  }, [records, typeFilter, sortDir]);

  const safePage = Math.min(currentPage, totalPages);
  const paginated = filtered;

  const isFormComplete = targetMember.trim() !== '' && reason.trim() !== '';

  function handleDateSort() {
    setSortDir(prev => (prev === null ? 'asc' : prev === 'asc' ? 'desc' : null));
    setCurrentPage(1);
  }

  function handleRowClick(record: SuspensionRecord) {
    setSelectedSuspensionId(record.id);
    setTargetMember(record.targetNickname);
    setProcessType(record.status === 'SUSPENDED' ? '계정 해제' : '계정 정지');
    setReason('');
  }

  function handleProcessSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsConfirmOpen(true);
  }

  async function handleConfirm() {
    try {
      if (processType === '계정 해제' && selectedSuspensionId) {
        await membersApi.releaseSuspension(Number(selectedSuspensionId), { reason });
      }
      setIsConfirmOpen(false);
      handleReset();
      fetchRecords();
    } catch (e) {
      console.error(e);
    }
  }

  function handleReset() {
    setSelectedSuspensionId(null);
    setTargetMember('');
    setProcessType('계정 정지');
    setReason('');
  }

  async function handleCsvExport() {
    try {
      const blob = await membersApi.exportSuspensions({
        keyword:   appliedSearch || undefined,
        startDate: dateFrom || undefined,
        endDate:   dateTo || undefined,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'suspensions.csv'; a.click();
      URL.revokeObjectURL(url);
    } catch (e) { console.error(e); }
  }

  useAdminPageActions(
    <button onClick={handleCsvExport} className="flex cursor-pointer items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
      <Download size={15} />CSV 내보내기
    </button>
  );

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
              <Button variant="brand" type="button" onClick={handleConfirm}>
                확인 후 처리
              </Button>
              <Button variant="secondary" type="button" onClick={() => setIsConfirmOpen(false)}>
                취소
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 요약 카드 */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card><p className="text-sm text-slate-500">전체 정지 이력</p><p className="mt-1 text-2xl font-bold text-slate-900">{summary.total}건</p></Card>
        <Card><p className="text-sm text-slate-500">현재 정지 중</p><p className="mt-1 text-2xl font-bold text-rose-600">{summary.currentlySuspended}명</p></Card>
        <Card><p className="text-sm text-slate-500">오늘 정지</p><p className="mt-1 text-2xl font-bold text-rose-600">{summary.thisMonth}건</p></Card>
        <Card><p className="text-sm text-slate-500">자동 정지 (로그인 실패)</p><p className="mt-1 text-2xl font-bold text-slate-900">{summary.autoSuspended}건</p></Card>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="grid items-stretch gap-6 lg:grid-cols-5">
        {/* 왼쪽: 정지 이력 목록 */}
        <div className="flex flex-col lg:col-span-3">
          <Card className="flex flex-1 flex-col">
            <h2 className="mb-4 text-base font-semibold text-slate-900">정지 이력 목록</h2>

            {/* 필터 */}
            <div className="mb-4 flex flex-wrap gap-2">
              <div className="relative min-w-36 flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="닉네임 / 관리자 검색"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { setAppliedSearch(search); setCurrentPage(1); } }}
                  className="w-full rounded-md border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-[#1565C0] focus:ring-1 focus:ring-[#1565C0]"
                />
              </div>
              <select
                value={typeFilter}
                onChange={e => { setTypeFilter(e.target.value as 'ALL' | SuspensionType); setCurrentPage(1); }}
                className="cursor-pointer rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#1565C0]"
              >
                <option value="ALL">전체</option>
                <option value="MANUAL">수동</option>
                <option value="AUTO">자동</option>
              </select>
              <input
                type="date"
                value={dateFrom}
                onChange={e => { setDateFrom(e.target.value); setCurrentPage(1); }}
                className="cursor-pointer rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#1565C0]"
              />
              <span className="flex items-center text-sm text-slate-400">~</span>
              <input
                type="date"
                value={dateTo}
                onChange={e => { setDateTo(e.target.value); setCurrentPage(1); }}
                className="cursor-pointer rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#1565C0]"
              />
            </div>

            {/* 테이블 */}
            <div className="flex-1 overflow-x-auto overflow-y-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-xs text-slate-500">
                    <th className="pb-2 pr-3 font-medium">대상 회원</th>
                    <th className="pb-2 pr-3 text-center font-medium">유형</th>
                    <th className="pb-2 pr-3 text-center font-medium">사유</th>
                    <th className="pb-2 pr-3 font-medium">처리 관리자</th>
                    <th
                      className="cursor-pointer whitespace-nowrap pb-2 pr-3 text-center font-medium hover:text-slate-700"
                      onClick={handleDateSort}
                    >
                      일시<DateSortIcon dir={sortDir} />
                    </th>
                    <th className="pb-2 text-center font-medium">상태</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginated.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        검색 결과가 없습니다.
                      </td>
                    </tr>
                  ) : (
                    paginated.map(record => (
                      <tr
                        key={record.id}
                        className="cursor-pointer hover:bg-slate-50"
                        onClick={() => handleRowClick(record)}
                      >
                        <td className="py-3 pr-3 font-medium text-slate-900">
                          {record.targetNickname}
                        </td>
                        <td className="py-3 pr-3">
                          <div className="flex justify-center">
                            <TypeBadge type={record.type} />
                          </div>
                        </td>
                        <td className="max-w-28 py-3 pr-3 text-center">
                          <p className="truncate text-slate-700" title={record.reason}>
                            {record.reason}
                          </p>
                        </td>
                        <td className="py-3 pr-3 text-slate-600">{record.adminName}</td>
                        <td className="whitespace-pre-line py-3 pr-3 text-center text-xs text-slate-500">
                          {record.processedAt}
                        </td>
                        <td className="py-3">
                          <div className="flex justify-center">
                            <StatusBadge status={record.status} />
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* 페이지네이션 */}
            <div className="mt-4 flex items-center justify-center">
              <div className="flex items-center gap-1">
                <button
                  disabled={safePage === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                  className="cursor-pointer rounded p-1 text-slate-500 hover:bg-slate-100 disabled:cursor-default disabled:opacity-40"
                >
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`cursor-pointer rounded px-2.5 py-0.5 text-sm ${
                      page === safePage
                        ? 'bg-[#1565C0] text-white'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  disabled={safePage === totalPages}
                  onClick={() => setCurrentPage(p => p + 1)}
                  className="cursor-pointer rounded p-1 text-slate-500 hover:bg-slate-100 disabled:cursor-default disabled:opacity-40"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </Card>
        </div>

        {/* 오른쪽: 계정 정지 관리 */}
        <div className="flex flex-col lg:col-span-2">
          <Card className="flex-1">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900">계정 정지 관리</h2>
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
                  className="w-full cursor-pointer rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#1565C0] focus:ring-1 focus:ring-[#1565C0]"
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
                <Button variant="brand" type="submit" className="flex-1" disabled={!isFormComplete}>
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
