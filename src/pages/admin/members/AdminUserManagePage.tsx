import { useState, useEffect, useCallback } from 'react';
import { Download, Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { useAdminPageActions } from '../../../contexts/AdminPageActionsContext';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { SeedMoneyModal } from './SeedMoneyModal';
import { cn } from '../../../utils/cn';
import { getPaginationPages } from '../../../utils/pagination';
import type { StatusTone } from '../../../types/common';
import { membersApi } from '../../../api/admin/members';
import { downloadCsv } from '../../../utils/download';

// ---- Types ----

type MemberStatus = 'ACTIVE' | 'SUSPENDED';
type SortField = 'joinedAt' | 'contestCount' | 'totalAsset' | 'profitRate' | 'loginFailCount';
type SortDir = 'asc' | 'desc' | null;

interface Member {
  id: string;
  nickname: string;
  accountId: string;
  email: string;
  joinedAt: string;
  contestCount: number;
  totalAsset: string | null;
  profitRate: number | null;
  loginFailCount: number;
  memberStatus: MemberStatus;
}

// ---- Constants ----

const ITEMS_PER_PAGE = 6;

const STATUS_OPTIONS = [
  { value: '', label: '전체 상태' },
  { value: 'ACTIVE', label: '활성' },
  { value: 'SUSPENDED', label: '정지' },
  { value: 'TODAY', label: '오늘 가입' },
];

const MEMBER_STATUS_TONE: Record<MemberStatus, StatusTone> = {
  ACTIVE: 'success',
  SUSPENDED: 'danger',
};

const MEMBER_STATUS_LABEL: Record<MemberStatus, string> = {
  ACTIVE: '활성',
  SUSPENDED: '정지',
};

// ---- Helpers ----


function joinedAtToIso(joinedAt: string): string {
  const [yy, mm, dd] = joinedAt.split('.');
  return `20${yy}-${mm}-${dd}`;
}


function SortIcon({ field, currentField, dir }: { field: SortField; currentField: SortField | null; dir: SortDir }) {
  if (currentField !== field || !dir) return <ChevronsUpDown size={13} className="ml-1 inline opacity-30" />;
  return dir === 'asc'
    ? <ChevronUp size={13} className="ml-1 inline text-[#1565C0]" />
    : <ChevronDown size={13} className="ml-1 inline text-[#1565C0]" />;
}

// ---- Page ----

export function AdminUserManagePage() {
  const [members, setMembers]   = useState<Member[]>([]);
  const [summary, setSummary]   = useState({ total: 0, active: 0, suspended: 0, todayJoined: 0 });
  const [totalPages, setTotalPages] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [searchType, setSearchType] = useState<'all' | 'nickname' | 'email' | 'accountId'>('all');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
const [isSeedModalOpen, setIsSeedModalOpen] = useState(false);
  const [showSuspendConfirm, setShowSuspendConfirm] = useState(false);
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);

  const fetchMembers = useCallback(async () => {
    try {
      const data = await membersApi.getMembers({
        keyword:    appliedSearch || undefined,
        status:     statusFilter || undefined,
        startDate:  dateFrom || undefined,
        endDate:    dateTo || undefined,
        page:       currentPage - 1,
        size:       ITEMS_PER_PAGE,
        sort:       sortField && sortDir ? `${sortField},${sortDir}` : undefined,
      });
      setMembers(
        (data.content ?? []).map((m: any) => ({
          id:             String(m.memberId),
          nickname:       m.nickname ?? '',
          accountId:      m.accountId ?? '',
          email:          m.email ?? '',
          joinedAt:       m.joinDate ?? '',
          contestCount:   m.contestCount ?? 0,
          totalAsset:     m.totalAsset ?? null,
          profitRate:     m.profitRate ?? null,
          loginFailCount: m.loginFailCount ?? 0,
          memberStatus:   (m.status as MemberStatus) ?? 'ACTIVE',
        }))
      );
      setTotalPages(data.totalPages ?? 1);
    } catch (e) {
      console.error(e);
    }
  }, [appliedSearch, statusFilter, dateFrom, dateTo, currentPage, sortField, sortDir]);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  useEffect(() => {
    membersApi.getMemberSummary()
      .then(data => setSummary({
        total:       data.totalCount ?? 0,
        active:      data.activeCount ?? 0,
        suspended:   data.suspendedCount ?? 0,
        todayJoined: data.todayJoinCount ?? 0,
      }))
      .catch(console.error);
  }, []);

  // 정렬은 서버에서 전체 데이터 기준으로 처리됨(fetchMembers의 sort 파라미터)
  const filteredMembers = members;

  const selectedMembers = members.filter(m => selectedIds.includes(m.id));
  const hasSelectedMembers = selectedIds.length > 0;
  const hasAnySelectedSuspended = selectedMembers.some(m => m.memberStatus === 'SUSPENDED');
  const canBulkSuspend = hasSelectedMembers && !hasAnySelectedSuspended;
  const canBulkSeed = hasSelectedMembers && !hasAnySelectedSuspended;

  const isAllSelected =
    filteredMembers.length > 0 && filteredMembers.every(m => selectedIds.includes(m.id));
  const isIndeterminate =
    !isAllSelected && filteredMembers.some(m => selectedIds.includes(m.id));

  function handleSort(field: SortField) {
    setCurrentPage(1); // 정렬 변경 시 전체 정렬 기준 첫 페이지부터
    if (sortField !== field) {
      setSortField(field);
      setSortDir('asc');
    } else if (sortDir === 'asc') {
      setSortDir('desc');
    } else {
      setSortField(null);
      setSortDir(null);
    }
  }

  function handleSelectAll() {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredMembers.map(m => m.id));
    }
  }

  function handleSelectOne(id: string) {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id],
    );
  }

  async function handleCsvExport() {
    try {
      const blob = await membersApi.exportMembers({
        keyword:   appliedSearch || undefined,
        status:    statusFilter || undefined,
        startDate: dateFrom || undefined,
        endDate:   dateTo || undefined,
      });
      downloadCsv(blob, 'members');
    } catch (e) {
      console.error(e);
    }
  }

  async function handleSuspendSelected() {
    try {
      // 감사로그 상세에 정지 대상 회원 이름들이 남도록 reason 구성
      const names = selectedMembers.map((m) => m.nickname).filter(Boolean).join(', ');
      const reason = names ? `${names} 정지` : '계정 정지';
      await membersApi.suspendMembers({
        memberIds: selectedIds.map(Number),
        reason,
      });
      setSelectedIds([]);
      // 정지는 온프렘 처리 후 결과 이벤트로 반영되는 비동기 작업 → 즉시 + 잠시 뒤 재조회로 확정 상태 반영
      fetchMembers();
      window.setTimeout(fetchMembers, 1500);
    } catch (e) {
      console.error(e);
    }
  }

  const safePage = Math.min(currentPage, totalPages);
  const pagedMembers = filteredMembers;
  const paginationPages = getPaginationPages(safePage, totalPages);

  useAdminPageActions(
    <div className="flex items-center gap-2">
      <Button variant="secondary" onClick={handleCsvExport} className="gap-2">
        <Download size={16} />
        CSV 내보내기
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* 선택 계정 정지 재확인 모달 */}
      {showSuspendConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-96 rounded-xl bg-white p-6 shadow-xl">
            <h3 className="mb-1 text-base font-semibold text-slate-900">선택 계정 정지 확인</h3>
            <p className="mb-4 text-sm text-slate-500">
              선택된 <span className="font-semibold text-slate-900">{selectedIds.length}명</span>의 계정을 정지합니다. 정말 진행하시겠습니까?
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="danger" onClick={() => { handleSuspendSelected(); setShowSuspendConfirm(false); }}>정지</Button>
              <Button variant="secondary" onClick={() => setShowSuspendConfirm(false)}>취소</Button>
            </div>
          </div>
        </div>
      )}

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <p className="text-sm font-medium text-slate-500">전체 회원</p>
          <p className="mt-2 text-3xl font-bold text-slate-950">{summary.total.toLocaleString()}명</p>
        </Card>
        <Card>
          <p className="text-sm font-medium text-slate-500">활성</p>
          <p className="mt-2 text-3xl font-bold text-emerald-600">{summary.active.toLocaleString()}명</p>
        </Card>
        <Card>
          <p className="text-sm font-medium text-slate-500">정지</p>
          <p className="mt-2 text-3xl font-bold text-rose-600">{summary.suspended}명</p>
        </Card>
        <Card>
          <p className="text-sm font-medium text-slate-500">오늘 가입</p>
          <p className="mt-2 text-3xl font-bold text-[#1565C0]">{summary.todayJoined}명</p>
        </Card>
      </div>

      {/* 메인 테이블 카드 — GET /api/admin/members */}
      <Card className="overflow-hidden p-0">
        {/* 툴바 */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-700">
              전체 회원 {summary.total.toLocaleString()}명
            </span>
            {hasSelectedMembers && (
              <span className="inline-flex items-center rounded-full bg-[#E8F0FE] px-2.5 py-0.5 text-xs font-medium text-[#1565C0]">
                {selectedIds.length}명 선택됨
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              className="h-8 cursor-pointer px-3 text-xs text-rose-600 border-rose-300 hover:bg-rose-50"
              disabled={!canBulkSuspend}
              onClick={() => setShowSuspendConfirm(true)}
            >
              선택 계정 정지
            </Button>
            <Button
              variant="secondary"
              className="h-8 cursor-pointer px-3 text-xs"
              disabled={!canBulkSeed}
              onClick={() => setIsSeedModalOpen(true)}
            >
              선택 시드 지급
            </Button>
          </div>
        </div>

        {/* 필터 행 */}
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 px-6 py-3">
          <div className="flex min-w-64 flex-1 overflow-hidden rounded-md border border-slate-300 focus-within:border-slate-500">
            <select
              value={searchType}
              onChange={e => { setSearchType(e.target.value as typeof searchType); setCurrentPage(1); }}
              className="h-9 cursor-pointer border-r border-slate-300 bg-slate-50 px-2 text-xs text-slate-600 focus:outline-none"
            >
              <option value="all">전체</option>
              <option value="nickname">닉네임</option>
              <option value="accountId">계정</option>
              <option value="email">이메일</option>
            </select>
            <div className="relative flex-1">
              <Search size={14} className="absolute inset-y-0 left-2.5 my-auto text-slate-400" />
              <input
                type="text"
                placeholder={
                  searchType === 'nickname' ? '닉네임 검색' :
                  searchType === 'email' ? '이메일 검색' :
                  searchType === 'accountId' ? '계정 검색' :
                  '검색어 입력'
                }
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { setAppliedSearch(searchQuery); setCurrentPage(1); } }}
                className="h-9 w-full pl-7 pr-3 text-sm focus:outline-none"
              />
            </div>
          </div>

          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="h-9 cursor-pointer rounded-md border border-slate-300 px-3 text-sm text-slate-700 focus:outline-none"
          >
            {STATUS_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

          <input
            type="date"
            value={dateFrom}
            onChange={e => { setDateFrom(e.target.value); setCurrentPage(1); }}
            className="h-9 cursor-pointer rounded-md border border-slate-300 px-3 text-sm text-slate-700 focus:outline-none"
          />
          <span className="text-sm text-slate-400">~</span>
          <input
            type="date"
            value={dateTo}
            onChange={e => { setDateTo(e.target.value); setCurrentPage(1); }}
            className="h-9 cursor-pointer rounded-md border border-slate-300 px-3 text-sm text-slate-700 focus:outline-none"
          />

        </div>

        {/* 테이블 */}
        <div className="h-84 overflow-hidden">
          <div className="h-full overflow-x-auto overflow-y-hidden">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 z-10">
              <tr className="border-b border-slate-100 bg-slate-50 text-left text-slate-500">
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={el => { if (el) el.indeterminate = isIndeterminate; }}
                    onChange={handleSelectAll}
                    className="h-4 w-4 cursor-pointer rounded border-slate-300 accent-[#1565C0]"
                  />
                </th>
                <th className="px-4 py-3 font-medium">닉네임</th>
                <th className="px-4 py-3 text-center font-medium">계정</th>
                <th className="px-4 py-3 text-center font-medium">이메일</th>
                <th
                  className="cursor-pointer whitespace-nowrap px-4 py-3 text-center font-medium hover:text-slate-700"
                  onClick={() => handleSort('joinedAt')}
                >
                  가입일<SortIcon field="joinedAt" currentField={sortField} dir={sortDir} />
                </th>
                <th
                  className="cursor-pointer whitespace-nowrap px-4 py-3 text-center font-medium hover:text-slate-700"
                  onClick={() => handleSort('contestCount')}
                >
                  참여 대회<SortIcon field="contestCount" currentField={sortField} dir={sortDir} />
                </th>
                <th
                  className="cursor-pointer whitespace-nowrap px-4 py-3 text-right font-medium hover:text-slate-700"
                  onClick={() => handleSort('totalAsset')}
                >
                  총 자산<SortIcon field="totalAsset" currentField={sortField} dir={sortDir} />
                </th>
                <th
                  className="cursor-pointer whitespace-nowrap px-4 py-3 text-right font-medium hover:text-slate-700"
                  onClick={() => handleSort('profitRate')}
                >
                  수익률<SortIcon field="profitRate" currentField={sortField} dir={sortDir} />
                </th>
                <th
                  className="cursor-pointer whitespace-nowrap px-4 py-3 text-center font-medium hover:text-slate-700"
                  onClick={() => handleSort('loginFailCount')}
                >
                  로그인 실패<SortIcon field="loginFailCount" currentField={sortField} dir={sortDir} />
                </th>
                <th className="px-4 py-3 text-center font-medium">상태</th>
              </tr>
            </thead>
            <tbody>
              {pagedMembers.length === 0 && (
                <tr className="h-10.25">
                  <td colSpan={10} className="px-4 py-3 text-center text-sm text-slate-400">
                    검색 결과가 없습니다.
                  </td>
                </tr>
              )}
              {pagedMembers.map(member => {
                const isSelected = selectedIds.includes(member.id);
                return (
                  <tr
                    key={member.id}
                    onClick={() => handleSelectOne(member.id)}
                    className={cn(
                      'h-10.25 cursor-pointer border-t border-slate-100 transition-colors hover:bg-slate-50',
                      isSelected && 'bg-[#E8F0FE] hover:bg-[#dce8fd]',
                    )}
                  >
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectOne(member.id)}
                        className="h-4 w-4 cursor-pointer rounded border-slate-300 accent-[#1565C0]"
                      />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900">{member.nickname}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-center text-slate-500">{member.accountId}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-center text-slate-600">{member.email}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-center text-slate-600">{member.joinedAt}</td>
                    <td className="px-4 py-3 text-center text-slate-600">{member.contestCount}개</td>
                    <td className="px-4 py-3 text-right text-slate-600">{member.totalAsset ?? '—'}</td>
                    <td
                      className={cn(
                        'px-4 py-3 text-right font-medium',
                        member.profitRate === null
                          ? 'text-slate-400'
                          : member.profitRate > 0
                            ? 'text-emerald-600'
                            : 'text-rose-600',
                      )}
                    >
                      {member.profitRate === null
                        ? '—'
                        : `${member.profitRate > 0 ? '+' : ''}${member.profitRate}%`}
                    </td>
                    <td className="px-4 py-3 text-center text-slate-600">{member.loginFailCount}회</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center">
                        <StatusBadge tone={MEMBER_STATUS_TONE[member.memberStatus]}>
                          {MEMBER_STATUS_LABEL[member.memberStatus]}
                        </StatusBadge>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {Array.from({ length: ITEMS_PER_PAGE - Math.max(pagedMembers.length, pagedMembers.length === 0 ? 1 : 0) }).map((_, i) => (
                <tr key={`ghost-${i}`}>
                  <td colSpan={10} className="px-4 py-3">
                    <span className="invisible select-none text-sm leading-6">x</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>

        {/* 페이지네이션 */}
        <div className="flex items-center justify-center border-t border-slate-100 px-6 py-4">
          <div className="flex items-center gap-1">
            <button onClick={() => setCurrentPage(1)} disabled={safePage === 1} className="cursor-pointer rounded p-1.5 text-slate-600 hover:bg-slate-100 disabled:cursor-default disabled:opacity-40"><ChevronsLeft size={16} /></button>
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={safePage === 1} className="cursor-pointer rounded p-1.5 text-slate-600 hover:bg-slate-100 disabled:cursor-default disabled:opacity-40"><ChevronLeft size={16} /></button>
            {paginationPages.map(page => (
              <button key={page} onClick={() => setCurrentPage(page)} className={cn('min-w-8 cursor-pointer rounded px-2 py-1 text-sm', safePage === page ? 'bg-[#1565C0] text-white' : 'text-slate-600 hover:bg-slate-100')}>{page}</button>
            ))}
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages} className="cursor-pointer rounded p-1.5 text-slate-600 hover:bg-slate-100 disabled:cursor-default disabled:opacity-40"><ChevronRight size={16} /></button>
            <button onClick={() => setCurrentPage(totalPages)} disabled={safePage === totalPages} className="cursor-pointer rounded p-1.5 text-slate-600 hover:bg-slate-100 disabled:cursor-default disabled:opacity-40"><ChevronsRight size={16} /></button>
          </div>
        </div>
      </Card>

<SeedMoneyModal
        isOpen={isSeedModalOpen}
        targetCount={selectedIds.length}
        memberIds={selectedIds.map(Number)}
        onClose={() => setIsSeedModalOpen(false)}
        onSuccess={() => {
          setIsSeedModalOpen(false);
          setSelectedIds([]);
          fetchMembers();
        }}
      />
    </div>
  );
}
