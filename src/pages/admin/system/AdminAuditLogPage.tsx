import { useState, useMemo } from 'react';
import { Download, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card } from '../../../components/common/Card';
import { useAdminPageActions } from '../../../contexts/AdminPageActionsContext';
import { Button } from '../../../components/common/Button';

type LogType = '회원관리' | '시드지급' | '주문취소' | '대회관리' | '공지사항' | '랭킹' | '시스템';

interface AuditLog {
  id: number;
  type: LogType;
  action: string;
  target: string;
  detail: string;
  adminId: string;
  ip: string;
  createdAt: string;
}

// GET /api/admin/audit-log
const MOCK_LOGS: AuditLog[] = [
  { id: 248, type: '회원관리', action: '계정 정지',       target: '이영희 (user003)', detail: '비정상 주문 패턴 – 3분 내 50건 주문',       adminId: 'admin01', ip: '192.168.1.5', createdAt: '25.05.08 14:32' },
  { id: 247, type: '시드지급', action: '시드머니 지급',   target: '홍길동 (user001)', detail: '+1,000,000원 · 이벤트 당첨',                adminId: 'admin01', ip: '192.168.1.5', createdAt: '25.05.07 11:15' },
  { id: 246, type: '주문취소', action: '주문 강제 취소',  target: '박민준 (user004)', detail: '주문 #48291 취소 · 어뷰징 의심',             adminId: 'admin02', ip: '192.168.1.8', createdAt: '25.05.06 09:44' },
  { id: 245, type: '대회관리', action: '대회 생성',       target: '5월 정기 대회',   detail: '시드 1000만원, 전체 종목, 무제한 참가',     adminId: 'admin01', ip: '192.168.1.5', createdAt: '25.05.01 08:00' },
  { id: 244, type: '공지사항', action: '공지 등록',       target: '[공지] 5월 대회 시작 안내', detail: '상단 고정 · 05.01~05.31 게시',      adminId: 'admin02', ip: '192.168.1.8', createdAt: '25.04.28 15:20' },
  { id: 243, type: '회원관리', action: '계정 정지 해제',  target: '박민준 (user004)', detail: '정지 해제 · 본인 확인 완료',               adminId: 'admin01', ip: '192.168.1.5', createdAt: '25.04.20 10:05' },
  { id: 242, type: '랭킹',    action: '랭킹 제외 처리',  target: '어뷰저123 (user099)', detail: '어뷰징 계정 4월 대회 랭킹 제외',         adminId: 'admin01', ip: '192.168.1.5', createdAt: '25.04.18 16:30' },
  { id: 241, type: '시스템',  action: '점검 모드 종료',  target: '전체 서비스',     detail: '시스템 점검 완료 · 정상 서비스 재개',      adminId: 'admin01', ip: '192.168.1.5', createdAt: '25.04.10 12:00' },
  { id: 240, type: '회원관리', action: '계정 생성',       target: '김철수 (user101)', detail: '신규 회원 가입',                           adminId: 'admin03', ip: '192.168.1.9', createdAt: '25.04.08 09:10' },
  { id: 239, type: '대회관리', action: '대회 종료',       target: '4월 정기 대회',   detail: '정상 종료 · 최종 랭킹 집계 완료',          adminId: 'admin01', ip: '192.168.1.5', createdAt: '25.04.30 23:59' },
  { id: 238, type: '시드지급', action: '시드머니 지급',   target: '이순신 (user005)', detail: '+500,000원 · 프로모션 지급',               adminId: 'admin02', ip: '192.168.1.8', createdAt: '25.04.05 14:00' },
  { id: 237, type: '주문취소', action: '주문 강제 취소',  target: '최영수 (user012)', detail: '주문 #47100 취소 · 이상 거래',             adminId: 'admin02', ip: '192.168.1.8', createdAt: '25.04.03 11:22' },
  { id: 236, type: '공지사항', action: '공지 수정',       target: '[공지] 4월 이벤트 안내', detail: '내용 수정 · 기간 연장',                adminId: 'admin03', ip: '192.168.1.9', createdAt: '25.04.01 09:00' },
  { id: 235, type: '랭킹',    action: '랭킹 복구',       target: '착한투자자 (user088)', detail: '오류 복구 · 정상 처리 확인',            adminId: 'admin01', ip: '192.168.1.5', createdAt: '25.03.30 17:45' },
  { id: 234, type: '시스템',  action: '점검 모드 시작',  target: '전체 서비스',     detail: '정기 점검 · 02:00~04:00',                 adminId: 'admin01', ip: '192.168.1.5', createdAt: '25.03.28 02:00' },
  { id: 233, type: '회원관리', action: '계정 정지',       target: '나쁜유저 (user077)', detail: '악성 신고 다수 · 어뷰징 확인',           adminId: 'admin02', ip: '192.168.1.8', createdAt: '25.03.25 13:00' },
];

// GET /api/admin/admins
const ADMINS = ['admin01', 'admin02', 'admin03'];

const STATS = {
  total:     248,
  today:     3,
  thisMonth: 47,
};

const TYPE_OPTIONS: LogType[] = ['회원관리', '시드지급', '주문취소', '대회관리', '공지사항', '랭킹', '시스템'];

const TYPE_BADGE: Record<LogType, string> = {
  회원관리: 'bg-rose-100 text-rose-600',
  시드지급: 'bg-emerald-100 text-emerald-600',
  주문취소: 'bg-orange-100 text-orange-600',
  대회관리: 'bg-blue-100 text-blue-600',
  공지사항: 'bg-sky-100 text-sky-600',
  랭킹:     'bg-rose-100 text-rose-600',
  시스템:   'bg-slate-100 text-slate-500',
};

const PAGE_SIZE = 8;

export function AdminAuditLogPage() {
  const [keyword, setKeyword]     = useState('');
  const [startDate, setStartDate] = useState('2025-05-01');
  const [endDate, setEndDate]     = useState('2025-05-08');
  const [typeFilter, setTypeFilter]   = useState<LogType | ''>('');
  const [adminFilter, setAdminFilter] = useState('');
  const [applied, setApplied] = useState<{
    keyword: string; startDate: string; endDate: string; type: LogType | ''; admin: string;
  }>({ keyword: '', startDate: '2025-05-01', endDate: '2025-05-08', type: '', admin: '' });
  const [currentPage, setCurrentPage] = useState(1);

  function handleSearch() {
    setApplied({ keyword, startDate, endDate, type: typeFilter, admin: adminFilter });
    setCurrentPage(1);
  }

  const filtered = useMemo(() => {
    return MOCK_LOGS.filter(log => {
      if (applied.type  && log.type    !== applied.type)  return false;
      if (applied.admin && log.adminId !== applied.admin) return false;
      if (applied.keyword) {
        const q = applied.keyword.toLowerCase();
        if (
          !log.action.toLowerCase().includes(q) &&
          !log.target.toLowerCase().includes(q) &&
          !log.adminId.toLowerCase().includes(q) &&
          !log.detail.toLowerCase().includes(q)
        ) return false;
      }
      return true;
    });
  }, [applied]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function getPageNumbers() {
    const pages: (number | '...')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1, 2, 3);
      if (currentPage > 5) pages.push('...');
      if (currentPage > 3 && currentPage < totalPages - 2) pages.push(currentPage);
      if (currentPage < totalPages - 4) pages.push('...');
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
          <p className="mt-2 text-2xl font-bold text-slate-900">{STATS.total.toLocaleString('ko-KR')}건</p>
        </Card>
        <Card className="py-6">
          <p className="text-xs font-medium text-slate-500">오늘 로그</p>
          <p className="mt-2 text-2xl font-bold text-[#1565C0]">{STATS.today}건</p>
        </Card>
        <Card className="py-6">
          <p className="text-xs font-medium text-slate-500">이번 달 로그</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{STATS.thisMonth}건</p>
        </Card>
        <Card className="py-6">
          <p className="text-xs font-medium text-slate-500">관리자 수</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{ADMINS.length}명</p>
          <p className="mt-1 text-xs text-slate-400">{ADMINS.join(', ')}</p>
        </Card>
      </div>

      {/* 검색 영역 */}
      <Card className="mb-6">
        <h2 className="mb-3 text-sm font-semibold text-slate-900">로그 검색</h2>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-48">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="액션 / 관리자 / 대상 검색"
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              className="h-9 w-full rounded-md border border-slate-300 pl-8 pr-3 text-sm focus:border-[#1565C0] focus:outline-none"
            />
          </div>
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className="h-9 rounded-md border border-slate-300 px-3 text-sm focus:border-[#1565C0] focus:outline-none"
          />
          <span className="text-slate-400">~</span>
          <input
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            className="h-9 rounded-md border border-slate-300 px-3 text-sm focus:border-[#1565C0] focus:outline-none"
          />
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value as LogType | '')}
            className="h-9 rounded-md border border-slate-300 px-3 text-sm focus:border-[#1565C0] focus:outline-none"
          >
            <option value="">전체 유형</option>
            {TYPE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select
            value={adminFilter}
            onChange={e => setAdminFilter(e.target.value)}
            className="h-9 rounded-md border border-slate-300 px-3 text-sm focus:border-[#1565C0] focus:outline-none"
          >
            <option value="">전체 관리자</option>
            {ADMINS.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
          <Button variant="brand" className="h-9 px-5 text-sm" onClick={handleSearch}>
            검색
          </Button>
        </div>
      </Card>

      {/* 로그 테이블 */}
      <Card className="p-0">
        <div className="overflow-x-auto min-h-96">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="whitespace-nowrap px-3 py-3 text-center font-medium">No.</th>
                <th className="whitespace-nowrap px-3 py-3 text-center font-medium">유형</th>
                <th className="whitespace-nowrap px-3 py-3 text-center font-medium">액션</th>
                <th className="whitespace-nowrap px-3 py-3 text-center font-medium">대상</th>
                <th className="whitespace-nowrap px-4 py-3 text-left font-medium">상세 내용</th>
                <th className="whitespace-nowrap px-3 py-3 text-center font-medium">처리 관리자</th>
                <th className="whitespace-nowrap px-3 py-3 text-center font-medium">IP</th>
                <th className="whitespace-nowrap px-3 py-3 text-center font-medium">처리 일시</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-sm text-slate-400">
                    검색 결과가 없습니다.
                  </td>
                </tr>
              ) : (
                paginated.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="px-3 py-3 text-center text-slate-400">{log.id}</td>
                    <td className="px-3 py-3 text-center">
                      <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold ${TYPE_BADGE[log.type]}`}>
                        {log.type}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-center font-semibold text-slate-900">
                      {log.action}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-center text-slate-700">
                      {log.target}
                    </td>
                    <td className="px-4 py-3 text-left text-slate-500">
                      {log.detail}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-center text-slate-700">
                      {log.adminId}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-center text-slate-400">
                      {log.ip}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-center text-slate-400">
                      {log.createdAt}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 페이지네이션 */}
        <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-sm text-slate-500">
          <span>
            총 {filtered.length}건 중 {(currentPage - 1) * PAGE_SIZE + 1}~{Math.min(currentPage * PAGE_SIZE, filtered.length)}번 표시
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="cursor-pointer rounded px-2 py-1 text-xs hover:bg-slate-100 disabled:opacity-40"
            >
              이전
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="cursor-pointer rounded p-1 hover:bg-slate-100 disabled:opacity-40"
            >
              <ChevronLeft size={14} />
            </button>
            {getPageNumbers().map((page, idx) =>
              page === '...'
                ? <span key={`dots-${idx}`} className="px-1 text-slate-400">···</span>
                : (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page as number)}
                    className={`min-w-7 cursor-pointer rounded px-2 py-1 text-sm font-medium ${
                      currentPage === page
                        ? 'bg-[#1565C0] text-white'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {page}
                  </button>
                )
            )}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="cursor-pointer rounded p-1 hover:bg-slate-100 disabled:opacity-40"
            >
              <ChevronRight size={14} />
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="cursor-pointer rounded px-2 py-1 text-xs hover:bg-slate-100 disabled:opacity-40"
            >
              다음
            </button>
          </div>
        </div>
      </Card>
    </>
  );
}
