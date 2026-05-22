import { useState, useMemo } from 'react';
import { Download, UserPlus, Search, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { useAdminPageActions } from '../../../contexts/AdminPageActionsContext';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { AddMemberModal } from './AddMemberModal';
import { SeedMoneyModal } from './SeedMoneyModal';
import { cn } from '../../../utils/cn';
import type { StatusTone } from '../../../types/common';

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

const MOCK_SUMMARY = {
  total: 1234,
  active: 1198,
  suspended: 36,
  todayJoined: 12,
};

const INITIAL_MEMBERS: Member[] = [
  {
    id: 'member-1',
    nickname: '홍길동',
    accountId: 'user001',
    email: 'hong***@naver.com',
    joinedAt: '25.01.15',
    contestCount: 2,
    totalAsset: '11.2M원',
    profitRate: 12.4,
    loginFailCount: 0,
    memberStatus: 'ACTIVE',
  },
  {
    id: 'member-2',
    nickname: '김철수',
    accountId: 'user002',
    email: 'kim***@gmail.com',
    joinedAt: '25.02.03',
    contestCount: 1,
    totalAsset: '9.8M원',
    profitRate: -2.1,
    loginFailCount: 0,
    memberStatus: 'ACTIVE',
  },
  {
    id: 'member-3',
    nickname: '이영희',
    accountId: 'user003',
    email: 'lee***@kakao.com',
    joinedAt: '25.03.21',
    contestCount: 0,
    totalAsset: null,
    profitRate: null,
    loginFailCount: 5,
    memberStatus: 'SUSPENDED',
  },
  {
    id: 'member-4',
    nickname: '박민준',
    accountId: 'user004',
    email: 'park***@naver.com',
    joinedAt: '25.04.02',
    contestCount: 1,
    totalAsset: '10.5M원',
    profitRate: 5.3,
    loginFailCount: 1,
    memberStatus: 'ACTIVE',
  },
  {
    id: 'member-5',
    nickname: '최수진',
    accountId: 'user005',
    email: 'choi***@gmail.com',
    joinedAt: '25.04.18',
    contestCount: 2,
    totalAsset: '12.8M원',
    profitRate: 28.1,
    loginFailCount: 0,
    memberStatus: 'ACTIVE',
  },
  {
    id: 'member-6',
    nickname: '정재현',
    accountId: 'user006',
    email: 'jung***@hanmail.net',
    joinedAt: '25.04.25',
    contestCount: 1,
    totalAsset: '10.1M원',
    profitRate: 1.2,
    loginFailCount: 0,
    memberStatus: 'ACTIVE',
  },
];

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

function getPaginationPages(currentPage: number, totalPages: number): (number | '...')[] {
  const pages: (number | '...')[] = [1];
  if (currentPage > 3) pages.push('...');
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);
  for (let i = start; i <= end; i++) pages.push(i);
  if (currentPage < totalPages - 2) pages.push('...');
  if (totalPages > 1) pages.push(totalPages);
  return pages;
}

function joinedAtToIso(joinedAt: string): string {
  const [yy, mm, dd] = joinedAt.split('.');
  return `20${yy}-${mm}-${dd}`;
}

function parseAsset(asset: string | null): number {
  if (!asset) return -1;
  const m = asset.match(/^([\d.]+)M원$/);
  return m ? parseFloat(m[1]) : 0;
}

function SortIcon({ field, currentField, dir }: { field: SortField; currentField: SortField | null; dir: SortDir }) {
  if (currentField !== field || !dir) return <ChevronsUpDown size={13} className="ml-1 inline opacity-30" />;
  return dir === 'asc'
    ? <ChevronUp size={13} className="ml-1 inline text-[#1565C0]" />
    : <ChevronDown size={13} className="ml-1 inline text-[#1565C0]" />;
}

// ---- Page ----

export function AdminUserManagePage() {
  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'all' | 'nickname' | 'email' | 'accountId'>('all');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSeedModalOpen, setIsSeedModalOpen] = useState(false);
  const [showSuspendConfirm, setShowSuspendConfirm] = useState(false);
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);

  const filteredMembers = useMemo(() => {
    const today = new Date();
    const todayStr = `${String(today.getFullYear()).slice(2)}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}`;

    let result = [...members];

    if (statusFilter === 'ACTIVE') {
      result = result.filter(m => m.memberStatus === 'ACTIVE');
    } else if (statusFilter === 'SUSPENDED') {
      result = result.filter(m => m.memberStatus === 'SUSPENDED');
    } else if (statusFilter === 'TODAY') {
      result = result.filter(m => m.joinedAt === todayStr);
    }

    if (dateFrom || dateTo) {
      result = result.filter(m => {
        const d = joinedAtToIso(m.joinedAt);
        if (dateFrom && d < dateFrom) return false;
        if (dateTo && d > dateTo) return false;
        return true;
      });
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(m => {
        if (searchType === 'nickname') return m.nickname.toLowerCase().includes(q);
        if (searchType === 'email') return m.email.toLowerCase().includes(q);
        if (searchType === 'accountId') return m.accountId.toLowerCase().includes(q);
        return (
          m.nickname.toLowerCase().includes(q) ||
          m.email.toLowerCase().includes(q) ||
          m.accountId.toLowerCase().includes(q)
        );
      });
    }

    if (sortField && sortDir) {
      result = [...result].sort((a, b) => {
        const dir = sortDir === 'asc' ? 1 : -1;
        switch (sortField) {
          case 'joinedAt':
            return dir * a.joinedAt.localeCompare(b.joinedAt);
          case 'contestCount':
            return dir * (a.contestCount - b.contestCount);
          case 'totalAsset':
            return dir * (parseAsset(a.totalAsset) - parseAsset(b.totalAsset));
          case 'profitRate':
            return dir * ((a.profitRate ?? -Infinity) - (b.profitRate ?? -Infinity));
          case 'loginFailCount':
            return dir * (a.loginFailCount - b.loginFailCount);
          default:
            return 0;
        }
      });
    }

    return result;
  }, [members, searchQuery, searchType, statusFilter, dateFrom, dateTo, sortField, sortDir]);

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

  function handleAddMember(data: { nickname: string; email: string; accountId: string }) {
    const today = new Date();
    const joinedAt = `${String(today.getFullYear()).slice(2)}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}`;
    const newMember: Member = {
      id: `member-${Date.now()}`,
      nickname: data.nickname,
      email: data.email,
      accountId: data.accountId,
      joinedAt,
      contestCount: 0,
      totalAsset: null,
      profitRate: null,
      loginFailCount: 0,
      memberStatus: 'ACTIVE',
    };
    setMembers(prev => [newMember, ...prev]);
    setCurrentPage(1);
  }

  function handleCsvExport() {
    // GET /api/admin/members/export/csv
  }

  function handleSuspendSelected() {
    // POST /api/admin/members/suspend (batch)
    setMembers(prev =>
      prev.map(m =>
        selectedIds.includes(m.id) ? { ...m, memberStatus: 'SUSPENDED' as MemberStatus } : m,
      ),
    );
    setSelectedIds([]);
  }

  const totalPages = Math.max(1, Math.ceil(filteredMembers.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const pagedMembers = filteredMembers.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);
  const paginationPages = getPaginationPages(safePage, totalPages);

  useAdminPageActions(
    <div className="flex items-center gap-2">
      <Button variant="secondary" onClick={handleCsvExport} className="gap-2">
        <Download size={16} />
        CSV 내보내기
      </Button>
      <Button variant="brand" onClick={() => setIsAddModalOpen(true)} className="gap-2">
        <UserPlus size={16} />
        회원 직접 추가
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

      {/* 통계 카드 — GET /api/admin/members/count */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <p className="text-sm font-medium text-slate-500">전체 회원</p>
          <p className="mt-2 text-3xl font-bold text-slate-950">
            {MOCK_SUMMARY.total.toLocaleString()}명
          </p>
        </Card>
        <Card>
          <p className="text-sm font-medium text-slate-500">활성</p>
          <p className="mt-2 text-3xl font-bold text-emerald-600">
            {MOCK_SUMMARY.active.toLocaleString()}명
          </p>
        </Card>
        <Card>
          <p className="text-sm font-medium text-slate-500">정지</p>
          <p className="mt-2 text-3xl font-bold text-rose-600">{MOCK_SUMMARY.suspended}명</p>
        </Card>
        <Card>
          <p className="text-sm font-medium text-slate-500">오늘 가입</p>
          <p className="mt-2 text-3xl font-bold text-[#1565C0]">{MOCK_SUMMARY.todayJoined}명</p>
        </Card>
      </div>

      {/* 메인 테이블 카드 — GET /api/admin/members */}
      <Card className="overflow-hidden p-0">
        {/* 툴바 */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-700">
              전체 회원 {members.length.toLocaleString()}명
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
                onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
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
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="cursor-pointer rounded p-1.5 text-slate-600 hover:bg-slate-100 disabled:cursor-default disabled:opacity-40"
            >
              <ChevronLeft size={16} />
            </button>
            {paginationPages.map((page, idx) =>
              page === '...' ? (
                <span key={`ellipsis-${idx}`} className="px-2 py-1 text-sm text-slate-400">…</span>
              ) : (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page as number)}
                  className={cn(
                    'min-w-8 cursor-pointer rounded px-2 py-1 text-sm',
                    safePage === page
                      ? 'bg-[#1565C0] text-white'
                      : 'text-slate-600 hover:bg-slate-100',
                  )}
                >
                  {page}
                </button>
              ),
            )}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="cursor-pointer rounded p-1.5 text-slate-600 hover:bg-slate-100 disabled:cursor-default disabled:opacity-40"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </Card>

      <AddMemberModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onAdd={handleAddMember} />
      <SeedMoneyModal
        isOpen={isSeedModalOpen}
        targetCount={selectedIds.length}
        onClose={() => setIsSeedModalOpen(false)}
      />
    </div>
  );
}
