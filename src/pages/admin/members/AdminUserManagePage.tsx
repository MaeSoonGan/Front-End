import { useState, useMemo } from 'react';
import { Download, UserPlus, Search } from 'lucide-react';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { AddMemberModal } from './AddMemberModal';
import { SeedMoneyModal } from './SeedMoneyModal';
import { cn } from '../../../utils/cn';
import type { StatusTone } from '../../../types/common';

// ---- Types ----

type MemberStatus = 'ACTIVE' | 'SUSPENDED';
type FilterTab = 'ALL' | 'ACTIVE' | 'SUSPENDED' | 'TODAY';

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
const TOTAL_MEMBER_COUNT = 1234;
const TOTAL_PAGES = Math.ceil(TOTAL_MEMBER_COUNT / ITEMS_PER_PAGE);

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
];

const FILTER_TABS: { value: FilterTab; label: string }[] = [
  { value: 'ALL', label: '전체' },
  { value: 'ACTIVE', label: '활성' },
  { value: 'SUSPENDED', label: '정지' },
  { value: 'TODAY', label: '오늘가입' },
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

// ---- Page ----

export function AdminUserManagePage() {
  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSeedModalOpen, setIsSeedModalOpen] = useState(false);

  const hasSelectedMembers = selectedIds.length > 0;

  const filteredMembers = useMemo(() => {
    return members.filter(member => {
      if (activeTab === 'ACTIVE') return member.memberStatus === 'ACTIVE';
      if (activeTab === 'SUSPENDED') return member.memberStatus === 'SUSPENDED';
      return true;
    });
  }, [members, activeTab]);

  const isAllSelected =
    filteredMembers.length > 0 && filteredMembers.every(m => selectedIds.includes(m.id));
  const isIndeterminate =
    !isAllSelected && filteredMembers.some(m => selectedIds.includes(m.id));

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

  function handleSearch() {
    // GET /api/admin/members?query={searchQuery}&status={statusFilter}&from={dateFrom}&to={dateTo}
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

  function handleSuspendMember(memberId: string) {
    // POST /api/admin/members/{memberId}/suspend
    setMembers(prev =>
      prev.map(m => (m.id === memberId ? { ...m, memberStatus: 'SUSPENDED' as MemberStatus } : m)),
    );
  }

  function handleUnsuspendMember(memberId: string) {
    // PATCH /api/admin/members/{memberId}/unsuspend
    setMembers(prev =>
      prev.map(m => (m.id === memberId ? { ...m, memberStatus: 'ACTIVE' as MemberStatus } : m)),
    );
  }

  function handleTabChange(tab: FilterTab) {
    setActiveTab(tab);
    setSelectedIds([]);
    setCurrentPage(1);
  }

  const paginationPages = getPaginationPages(currentPage, TOTAL_PAGES);

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-950">회원 목록</h1>
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
      </div>

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
              전체 회원 {MOCK_SUMMARY.total.toLocaleString()}명
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
              className="h-8 px-3 text-xs text-rose-600 border-rose-300 hover:bg-rose-50"
              disabled={!hasSelectedMembers}
              onClick={handleSuspendSelected}
            >
              선택 계정 정지
            </Button>
            <Button
              variant="secondary"
              className="h-8 px-3 text-xs"
              disabled={!hasSelectedMembers}
              onClick={() => setIsSeedModalOpen(true)}
            >
              선택 시드 지급
            </Button>
          </div>
        </div>

        {/* 필터 행 */}
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 px-6 py-3">
          <div className="relative min-w-48 flex-1">
            <Search
              size={15}
              className="absolute inset-y-0 left-3 my-auto text-slate-400"
            />
            <input
              type="text"
              placeholder="닉네임 / 이메일 / 아이디 검색"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              className="h-9 w-full rounded-md border border-slate-300 pl-9 pr-3 text-sm focus:border-slate-500 focus:outline-none"
            />
          </div>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="h-9 rounded-md border border-slate-300 px-3 text-sm text-slate-700 focus:outline-none"
          >
            {STATUS_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={dateFrom}
            onChange={e => setDateFrom(e.target.value)}
            className="h-9 rounded-md border border-slate-300 px-3 text-sm text-slate-700 focus:outline-none"
          />
          <input
            type="date"
            value={dateTo}
            onChange={e => setDateTo(e.target.value)}
            className="h-9 rounded-md border border-slate-300 px-3 text-sm text-slate-700 focus:outline-none"
          />

          <Button
            className="h-9 bg-[#1565C0] px-5 text-sm hover:bg-[#0f55a5]"
            onClick={handleSearch}
          >
            검색
          </Button>

          {/* 필터 탭 */}
          <div className="ml-auto flex overflow-hidden rounded-md border border-slate-200">
            {FILTER_TABS.map(tab => (
              <button
                key={tab.value}
                onClick={() => handleTabChange(tab.value)}
                className={cn(
                  'border-r border-slate-200 px-3 py-1.5 text-sm font-medium transition-colors last:border-none',
                  activeTab === tab.value
                    ? 'bg-[#1565C0] text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-50',
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* 테이블 */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-left text-slate-500">
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={el => {
                      if (el) el.indeterminate = isIndeterminate;
                    }}
                    onChange={handleSelectAll}
                    className="h-4 w-4 rounded border-slate-300 accent-[#1565C0]"
                  />
                </th>
                <th className="px-4 py-3 font-medium">닉네임</th>
                <th className="px-4 py-3 font-medium">계정</th>
                <th className="px-4 py-3 font-medium">이메일</th>
                <th className="px-4 py-3 font-medium">가입일</th>
                <th className="px-4 py-3 text-center font-medium">참여 대회</th>
                <th className="px-4 py-3 text-right font-medium">총 자산</th>
                <th className="px-4 py-3 text-right font-medium">수익률</th>
                <th className="px-4 py-3 text-center font-medium">로그인 실패</th>
                <th className="px-4 py-3 font-medium">상태</th>
                <th className="px-4 py-3 font-medium">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMembers.map(member => {
                const isSelected = selectedIds.includes(member.id);
                const isActive = member.memberStatus === 'ACTIVE';

                return (
                  <tr
                    key={member.id}
                    className={cn(
                      'transition-colors hover:bg-slate-50',
                      isSelected && 'bg-[#E8F0FE] hover:bg-[#dce8fd]',
                    )}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectOne(member.id)}
                        className="h-4 w-4 rounded border-slate-300 accent-[#1565C0]"
                      />
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900">{member.nickname}</td>
                    <td className="px-4 py-3 text-slate-500">{member.accountId}</td>
                    <td className="px-4 py-3 text-slate-600">{member.email}</td>
                    <td className="px-4 py-3 text-slate-600">{member.joinedAt}</td>
                    <td className="px-4 py-3 text-center text-slate-600">
                      {member.contestCount}개
                    </td>
                    <td className="px-4 py-3 text-right text-slate-600">
                      {member.totalAsset ?? '—'}
                    </td>
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
                    <td className="px-4 py-3 text-center text-slate-600">
                      {member.loginFailCount}회
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge tone={MEMBER_STATUS_TONE[member.memberStatus]}>
                        {MEMBER_STATUS_LABEL[member.memberStatus]}
                      </StatusBadge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button className="rounded border border-slate-200 px-2 py-1 text-xs text-slate-600 hover:bg-slate-50">
                          상세
                        </button>
                        <button
                          onClick={() =>
                            isActive
                              ? handleSuspendMember(member.id)
                              : handleUnsuspendMember(member.id)
                          }
                          className={cn(
                            'rounded border px-2 py-1 text-xs',
                            isActive
                              ? 'border-rose-200 text-rose-600 hover:bg-rose-50'
                              : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50',
                          )}
                        >
                          {isActive ? '정지' : '해제'}
                        </button>
                        <button className="rounded border border-[#bdd3f5] px-2 py-1 text-xs text-[#1565C0] hover:bg-[#E8F0FE]">
                          시드
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* 페이지네이션 */}
        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
          <p className="text-sm text-slate-500">
            총 {MOCK_SUMMARY.total.toLocaleString()}명 중 1~{filteredMembers.length}번 표시
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="rounded px-2 py-1 text-sm text-slate-600 hover:bg-slate-100 disabled:opacity-40"
            >
              이전
            </button>
            {paginationPages.map((page, idx) =>
              page === '...' ? (
                <span key={`ellipsis-${idx}`} className="px-2 py-1 text-sm text-slate-400">
                  …
                </span>
              ) : (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page as number)}
                  className={cn(
                    'min-w-8 rounded px-2 py-1 text-sm',
                    currentPage === page
                      ? 'bg-[#1565C0] text-white'
                      : 'text-slate-600 hover:bg-slate-100',
                  )}
                >
                  {page}
                </button>
              ),
            )}
            <button
              onClick={() => setCurrentPage(p => Math.min(TOTAL_PAGES, p + 1))}
              disabled={currentPage === TOTAL_PAGES}
              className="rounded px-2 py-1 text-sm text-slate-600 hover:bg-slate-100 disabled:opacity-40"
            >
              다음
            </button>
          </div>
        </div>
      </Card>

      <AddMemberModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
      <SeedMoneyModal
        isOpen={isSeedModalOpen}
        targetCount={selectedIds.length}
        onClose={() => setIsSeedModalOpen(false)}
      />
    </div>
  );
}
