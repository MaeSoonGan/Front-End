import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card } from '../../../components/common/Card';
import { useAdminPageActions } from '../../../contexts/AdminPageActionsContext';
import { Button } from '../../../components/common/Button';
import { systemApi } from '../../../api/admin/system';

type SearchType = 'all' | 'action' | 'target';

interface AuditLog {
  id: number;
  type: string;
  action: string;
  target: string;
  detail: string;
  adminId: string;
  ip: string;
  createdAt: string;
}

interface AdminItem {
  id: number;
  name: string;
}

// 백엔드 type enum → 화면 표시 라벨
const TYPE_LABEL: Record<string, string> = {
  MEMBER:  '회원관리',
  SEED:    '시드지급',
  ORDER:   '주문취소',
  CONTEST: '대회관리',
  NOTICE:  '공지사항',
  RANKING: '랭킹',
  SYSTEM:  '시스템',
};

const TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: 'MEMBER',  label: '회원관리' },
  { value: 'SEED',    label: '시드지급' },
  { value: 'ORDER',   label: '주문취소' },
  { value: 'CONTEST', label: '대회관리' },
  { value: 'NOTICE',  label: '공지사항' },
  { value: 'RANKING', label: '랭킹' },
  { value: 'SYSTEM',  label: '시스템' },
];

const TYPE_BADGE: Record<string, string> = {
  MEMBER:  'bg-rose-100 text-rose-600',
  SEED:    'bg-emerald-100 text-emerald-600',
  ORDER:   'bg-orange-100 text-orange-600',
  CONTEST: 'bg-blue-100 text-blue-600',
  NOTICE:  'bg-sky-100 text-sky-600',
  RANKING: 'bg-rose-100 text-rose-600',
  SYSTEM:  'bg-slate-100 text-slate-500',
};

// 백엔드 action 코드 → 화면 표시 라벨
const ACTION_LABEL: Record<string, string> = {
  CREATE_NOTICE:        '공지 등록',
  UPDATE_NOTICE:        '공지 수정',
  DELETE_NOTICE:        '공지 삭제',
  CREATE_CONTEST:       '대회 생성',
  UPDATE_CONTEST:       '대회 수정',
  END_CONTEST:          '대회 종료',
  CANCEL_CONTEST:       '대회 취소',
  EXCLUDE_RANKING:      '랭킹 제외',
  RESTORE_RANKING:      '랭킹 복구',
  SUSPEND_MEMBER:       '계정 정지',
  RELEASE_MEMBER:       '정지 해제',
  PAY_SEED_MONEY:       '시드머니 지급',
  ENABLE_MAINTENANCE:   '점검 모드 시작',
  DISABLE_MAINTENANCE:  '점검 모드 종료',
  IGNORE_ABNORMAL_ALERT: '알림 무시',
};

// 백엔드 targetType → 화면 표시 라벨
const TARGET_TYPE_LABEL: Record<string, string> = {
  MEMBER:     '회원',
  NOTICE:     '공지',
  CONTEST:    '대회',
  SYSTEM:     '시스템',
  MONITORING: '모니터링',
  ORDER:      '주문',
  SEED:       '시드',
};

function formatTarget(targetType: string | null, targetId: number | null): string {
  if (!targetType) return '';
  const label = TARGET_TYPE_LABEL[targetType] ?? targetType;
  return targetId ? `${label} #${targetId}` : label;
}

const SEARCH_OPTIONS: { value: SearchType; label: string }[] = [
  { value: 'all',    label: '전체' },
  { value: 'action', label: '액션' },
  { value: 'target', label: '대상' },
];

const PAGE_SIZE = 8;

function isoToDisplay(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${String(d.getFullYear()).slice(2)}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function AdminAuditLogPage() {
  const navigate = useNavigate();
  const [keyword, setKeyword]         = useState('');
  const [appliedKeyword, setAppliedKeyword] = useState('');
  const [searchType, setSearchType]   = useState<SearchType>('all');
  const [startDate, setStartDate]     = useState('');
  const [endDate, setEndDate]         = useState('');
  const [typeFilter, setTypeFilter]   = useState<string>('');
  const [adminFilter, setAdminFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const [logs, setLogs]               = useState<AuditLog[]>([]);
  const [totalPages, setTotalPages]   = useState(1);
  const [admins, setAdmins]           = useState<AdminItem[]>([]);
  const [stats, setStats]             = useState({ total: 0, today: 0, thisMonth: 0 });
  const [loading, setLoading]         = useState(false);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await systemApi.getAuditLogs({
        keyword:   appliedKeyword || undefined,
        startDate: startDate || undefined,
        endDate:   endDate || undefined,
        type:      typeFilter || undefined,
        adminId:   adminFilter ? Number(adminFilter) : undefined,
        page:      currentPage - 1,
        size:      PAGE_SIZE,
      });
      setLogs(
        (data.content ?? []).map((l: any) => ({
          id:        l.logId,
          type:      l.type ?? 'SYSTEM',
          action:    l.action ?? '',
          target:    formatTarget(l.targetType, l.targetId),
          detail:    l.detail ?? '',
          adminId:   l.adminName ?? String(l.adminId ?? ''),
          ip:        l.ipAddress ?? '-',
          createdAt: isoToDisplay(l.createdAt),
        }))
      );
      setTotalPages(data.totalPages ?? 1);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [appliedKeyword, startDate, endDate, typeFilter, adminFilter, currentPage]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  useEffect(() => {
    systemApi.getAuditLogSummary()
      .then(data => setStats({
        total:     data.totalLogCount ?? 0,
        today:     data.todayLogCount ?? 0,
        thisMonth: data.monthLogCount ?? 0,
      }))
      .catch(console.error);

    systemApi.getAdmins()
      .then(data => setAdmins(
        (data ?? []).map((a: any) => ({
          id:   a.adminId,
          name: a.nickname ?? a.loginId ?? '',
        }))
      ))
      .catch(console.error);
  }, []);

  function handleReset() {
    setKeyword('');
    setAppliedKeyword('');
    setSearchType('all');
    setStartDate('');
    setEndDate('');
    setTypeFilter('');
    setAdminFilter('');
    setCurrentPage(1);
  }

  const safePage   = Math.min(currentPage, totalPages);
  const ghostCount = PAGE_SIZE - Math.max(logs.length, logs.length === 0 ? 1 : 0);

  function getPageNumbers() {
    const pages: (number | '...')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1, 2, 3);
      if (safePage > 5) pages.push('...');
      if (safePage > 3 && safePage < totalPages - 2) pages.push(safePage);
      if (safePage < totalPages - 4) pages.push('...');
      pages.push(totalPages);
    }
    return [...new Set(pages)];
  }

  useAdminPageActions(
    <Button variant="secondary" className="h-9 gap-1.5 text-sm">
      <Download size={14} />
      CSV 내보내기
    </Button>
  );

  return (
    <>
      {/* 통계 카드 */}
      <div className="mb-6 grid gap-4 lg:grid-cols-4">
        <Card className="py-6">
          <p className="text-xs font-medium text-slate-500">전체 로그</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{stats.total.toLocaleString('ko-KR')}건</p>
        </Card>
        <Card className="py-6">
          <p className="text-xs font-medium text-slate-500">오늘 로그</p>
          <p className="mt-2 text-2xl font-bold text-[#1565C0]">{stats.today}건</p>
        </Card>
        <Card className="py-6">
          <p className="text-xs font-medium text-slate-500">이번 달 로그</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{stats.thisMonth}건</p>
        </Card>
        <Card className="py-6">
          <p className="text-xs font-medium text-slate-500">관리자 수</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{admins.length}명</p>
          <p className="mt-1 text-xs text-slate-400">{admins.map(a => a.name).join(', ')}</p>
        </Card>
      </div>

      {/* 검색 영역 */}
      <Card className="mb-6">
        <h2 className="mb-3 text-sm font-semibold text-slate-900">로그 검색</h2>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex h-9 flex-1 min-w-52 overflow-hidden rounded-md border border-slate-300 focus-within:border-[#1565C0]">
            <select
              value={searchType}
              onChange={e => setSearchType(e.target.value as SearchType)}
              className="border-r border-slate-300 bg-slate-50 px-2 text-xs text-slate-600 focus:outline-none"
            >
              {SEARCH_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <div className="relative flex flex-1 items-center">
              <Search size={13} className="absolute left-2.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="검색어 입력"
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { setAppliedKeyword(keyword); setCurrentPage(1); } }}
                className="h-full w-full pl-8 pr-3 text-sm focus:outline-none"
              />
            </div>
          </div>

          <input
            type="date"
            value={startDate}
            onChange={e => { setStartDate(e.target.value); setCurrentPage(1); }}
            className="h-9 rounded-md border border-slate-300 px-3 text-sm focus:border-[#1565C0] focus:outline-none"
          />
          <span className="text-slate-400">~</span>
          <input
            type="date"
            value={endDate}
            onChange={e => { setEndDate(e.target.value); setCurrentPage(1); }}
            className="h-9 rounded-md border border-slate-300 px-3 text-sm focus:border-[#1565C0] focus:outline-none"
          />

          <select
            value={typeFilter}
            onChange={e => { setTypeFilter(e.target.value as LogType | ''); setCurrentPage(1); }}
            className="h-9 rounded-md border border-slate-300 px-3 text-sm focus:border-[#1565C0] focus:outline-none"
          >
            <option value="">전체 유형</option>
            {TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>

          <select
            value={adminFilter}
            onChange={e => { setAdminFilter(e.target.value); setCurrentPage(1); }}
            className="h-9 rounded-md border border-slate-300 px-3 text-sm focus:border-[#1565C0] focus:outline-none"
          >
            <option value="">전체 관리자</option>
            {admins.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>

          <Button variant="secondary" className="h-9 px-4 text-sm" onClick={handleReset}>
            초기화
          </Button>
        </div>
      </Card>

      {/* 로그 테이블 */}
      <Card className="p-0">
        <div className="overflow-hidden">
          <table className="w-full table-fixed text-sm">
            <colgroup>
              <col className="w-10" />
              <col className="w-20" />
              <col className="w-24" />
              <col className="w-32" />
              <col className="w-48" />
              <col className="w-20" />
              <col className="w-28" />
              <col className="w-32" />
            </colgroup>
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="whitespace-nowrap px-3 py-3 text-center font-medium">No.</th>
                <th className="whitespace-nowrap px-3 py-3 text-center font-medium">유형</th>
                <th className="whitespace-nowrap px-3 py-3 text-center font-medium">액션</th>
                <th className="whitespace-nowrap px-3 py-3 text-center font-medium">대상</th>
                <th className="whitespace-nowrap px-3 py-3 text-center font-medium">상세 내용</th>
                <th className="whitespace-nowrap px-3 py-3 text-center font-medium">처리 관리자</th>
                <th className="whitespace-nowrap px-3 py-3 text-center font-medium">IP</th>
                <th className="whitespace-nowrap px-3 py-3 text-center font-medium">처리 일시</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr className="h-11"><td colSpan={8} className="px-3 text-center text-sm text-slate-400">불러오는 중...</td></tr>
              ) : logs.length === 0 ? (
                <tr className="h-11"><td colSpan={8} className="px-3 text-center text-sm text-slate-400">검색 결과가 없습니다.</td></tr>
              ) : (
                logs.map(log => (
                  <tr key={log.id} className="h-11 cursor-pointer hover:bg-slate-50" onClick={() => navigate(`/admin/audit-log/${log.id}`, { state: { log } })}>
                    <td className="px-3 text-center text-slate-400">{log.id}</td>
                    <td className="px-3 text-center">
                      <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold ${TYPE_BADGE[log.type] ?? 'bg-slate-100 text-slate-500'}`}>
                        {TYPE_LABEL[log.type] ?? log.type}
                      </span>
                    </td>
                    <td className="truncate px-3 text-center font-semibold text-slate-900">{ACTION_LABEL[log.action] ?? log.action}</td>
                    <td className="truncate px-3 text-center text-slate-700">{log.target}</td>
                    <td className="truncate px-3 text-center text-slate-500">{log.detail}</td>
                    <td className="px-3 text-center text-slate-700">{log.adminId}</td>
                    <td className="px-3 text-center text-slate-400">{log.ip}</td>
                    <td className="px-3 text-center text-slate-400">{log.createdAt}</td>
                  </tr>
                ))
              )}
              {!loading && Array.from({ length: ghostCount }).map((_, i) => (
                <tr key={`ghost-${i}`} className="h-11">
                  <td /><td /><td /><td /><td /><td /><td /><td />
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 페이지네이션 */}
        <div className="flex items-center justify-center border-t border-slate-200 px-4 py-3">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="cursor-pointer rounded p-1 hover:bg-slate-100 disabled:opacity-40"
            >
              <ChevronLeft size={16} />
            </button>
            {getPageNumbers().map((page, idx) =>
              page === '...'
                ? <span key={`dots-${idx}`} className="px-1 text-slate-400">···</span>
                : (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page as number)}
                    className={`min-w-7 cursor-pointer rounded px-2 py-1 text-sm font-medium ${
                      safePage === page ? 'bg-[#1565C0] text-white' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {page}
                  </button>
                )
            )}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="cursor-pointer rounded p-1 hover:bg-slate-100 disabled:opacity-40"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </Card>
    </>
  );
}
