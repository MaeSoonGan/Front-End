import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card } from '../../../components/common/Card';
import { useAdminPageActions } from '../../../contexts/AdminPageActionsContext';
import { Button } from '../../../components/common/Button';

type LogType = '회원관리' | '시드지급' | '주문취소' | '대회관리' | '공지사항' | '랭킹' | '시스템';
type SearchType = 'all' | 'action' | 'target';

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
  { id: 248, type: '회원관리', action: '계정 정지',       target: '이영희 (user003)',          detail: '비정상 주문 패턴 – 3분 내 50건 주문',       adminId: 'admin01', ip: '192.168.1.5', createdAt: '25.05.08 14:32' },
  { id: 247, type: '시드지급', action: '시드머니 지급',   target: '홍길동 (user001)',          detail: '+1,000,000원 · 이벤트 당첨',               adminId: 'admin01', ip: '192.168.1.5', createdAt: '25.05.07 11:15' },
  { id: 246, type: '주문취소', action: '주문 강제 취소',  target: '박민준 (user004)',          detail: '주문 #48291 취소 · 어뷰징 의심',            adminId: 'admin02', ip: '192.168.1.8', createdAt: '25.05.06 09:44' },
  { id: 245, type: '대회관리', action: '대회 생성',       target: '5월 정기 대회',            detail: '시드 1000만원, 전체 종목, 무제한 참가',    adminId: 'admin01', ip: '192.168.1.5', createdAt: '25.05.01 08:00' },
  { id: 244, type: '공지사항', action: '공지 등록',       target: '[공지] 5월 대회 시작 안내', detail: '상단 고정 · 05.01~05.31 게시',            adminId: 'admin02', ip: '192.168.1.8', createdAt: '25.04.28 15:20' },
  { id: 243, type: '회원관리', action: '계정 정지 해제',  target: '박민준 (user004)',          detail: '정지 해제 · 본인 확인 완료',              adminId: 'admin01', ip: '192.168.1.5', createdAt: '25.04.20 10:05' },
  { id: 242, type: '랭킹',    action: '랭킹 제외 처리',  target: '어뷰저123 (user099)',       detail: '어뷰징 계정 4월 대회 랭킹 제외',          adminId: 'admin01', ip: '192.168.1.5', createdAt: '25.04.18 16:30' },
  { id: 241, type: '시스템',  action: '점검 모드 종료',  target: '전체 서비스',              detail: '시스템 점검 완료 · 정상 서비스 재개',     adminId: 'admin01', ip: '192.168.1.5', createdAt: '25.04.10 12:00' },
  { id: 240, type: '회원관리', action: '계정 생성',       target: '김철수 (user101)',          detail: '신규 회원 가입',                          adminId: 'admin03', ip: '192.168.1.9', createdAt: '25.04.08 09:10' },
  { id: 239, type: '대회관리', action: '대회 종료',       target: '4월 정기 대회',            detail: '정상 종료 · 최종 랭킹 집계 완료',         adminId: 'admin01', ip: '192.168.1.5', createdAt: '25.04.30 23:59' },
  { id: 238, type: '시드지급', action: '시드머니 지급',   target: '이순신 (user005)',          detail: '+500,000원 · 프로모션 지급',              adminId: 'admin02', ip: '192.168.1.8', createdAt: '25.04.05 14:00' },
  { id: 237, type: '주문취소', action: '주문 강제 취소',  target: '최영수 (user012)',          detail: '주문 #47100 취소 · 이상 거래',            adminId: 'admin02', ip: '192.168.1.8', createdAt: '25.04.03 11:22' },
  { id: 236, type: '공지사항', action: '공지 수정',       target: '[공지] 4월 이벤트 안내',   detail: '내용 수정 · 기간 연장',                   adminId: 'admin03', ip: '192.168.1.9', createdAt: '25.04.01 09:00' },
  { id: 235, type: '랭킹',    action: '랭킹 복구',       target: '착한투자자 (user088)',      detail: '오류 복구 · 정상 처리 확인',             adminId: 'admin01', ip: '192.168.1.5', createdAt: '25.03.30 17:45' },
  { id: 234, type: '시스템',  action: '점검 모드 시작',  target: '전체 서비스',              detail: '정기 점검 · 02:00~04:00',                adminId: 'admin01', ip: '192.168.1.5', createdAt: '25.03.28 02:00' },
  { id: 233, type: '회원관리', action: '계정 정지',       target: '나쁜유저 (user077)',        detail: '악성 신고 다수 · 어뷰징 확인',           adminId: 'admin02', ip: '192.168.1.8', createdAt: '25.03.25 13:00' },
  { id: 232, type: '시드지급', action: '시드머니 회수',   target: '어뷰저123 (user099)',       detail: '부정 획득 시드 -2,000,000원 회수',       adminId: 'admin01', ip: '192.168.1.5', createdAt: '25.03.20 10:30' },
  { id: 231, type: '대회관리', action: '대회 수정',       target: '3월 특별 대회',            detail: '종료일 25.03.31 → 25.04.07 연장',        adminId: 'admin02', ip: '192.168.1.8', createdAt: '25.03.18 14:00' },
  { id: 230, type: '주문취소', action: '주문 강제 취소',  target: '정의심 (user033)',          detail: '주문 #46500 취소 · 시세 조종 의심',      adminId: 'admin03', ip: '192.168.1.9', createdAt: '25.03.15 11:05' },
  { id: 229, type: '공지사항', action: '공지 삭제',       target: '[공지] 2월 점검 안내',     detail: '만료 공지 삭제',                          adminId: 'admin02', ip: '192.168.1.8', createdAt: '25.03.10 09:00' },
  { id: 228, type: '회원관리', action: '계정 정지 해제',  target: '정의심 (user033)',          detail: '소명 완료 · 정지 해제',                  adminId: 'admin01', ip: '192.168.1.5', createdAt: '25.03.07 16:20' },
  { id: 227, type: '랭킹',    action: '랭킹 수동 갱신',  target: '3월 특별 대회',            detail: '관리자 수동 갱신 · 집계 오류 수정',      adminId: 'admin01', ip: '192.168.1.5', createdAt: '25.03.05 13:45' },
  { id: 226, type: '시드지급', action: '시드머니 지급',   target: '김운좋 (user055)',          detail: '+300,000원 · 출석 이벤트 보상',          adminId: 'admin03', ip: '192.168.1.9', createdAt: '25.03.01 10:00' },
  { id: 225, type: '시스템',  action: '설정 변경',       target: '시스템 설정',              detail: '주문 한도 50건 → 30건 변경',             adminId: 'admin01', ip: '192.168.1.5', createdAt: '25.02.28 09:00' },
  { id: 224, type: '대회관리', action: '대회 생성',       target: '3월 특별 대회',            detail: '시드 500만원, 코스닥 종목, 최대 100명',  adminId: 'admin02', ip: '192.168.1.8', createdAt: '25.02.25 11:30' },
  { id: 223, type: '회원관리', action: '계정 정지',       target: '이상한 (user060)',          detail: '복수 계정 운영 의심 · IP 대역 일치',     adminId: 'admin02', ip: '192.168.1.8', createdAt: '25.02.20 15:00' },
  { id: 222, type: '공지사항', action: '공지 등록',       target: '[공지] 3월 대회 안내',     detail: '상단 고정 · 03.01~03.31 게시',          adminId: 'admin03', ip: '192.168.1.9', createdAt: '25.02.18 10:00' },
  { id: 221, type: '주문취소', action: '주문 강제 취소',  target: '오자동 (user071)',          detail: '주문 #45900 취소 · 자동매매 봇 의심',   adminId: 'admin01', ip: '192.168.1.5', createdAt: '25.02.15 14:22' },
  { id: 220, type: '랭킹',    action: '랭킹 제외 처리',  target: '이상한 (user060)',          detail: '복수 계정 2월 대회 랭킹 제외',           adminId: 'admin01', ip: '192.168.1.5', createdAt: '25.02.10 12:00' },
  { id: 219, type: '시드지급', action: '시드머니 지급',   target: '박신규 (user200)',          detail: '+1,000,000원 · 신규 가입 이벤트',        adminId: 'admin02', ip: '192.168.1.8', createdAt: '25.02.05 09:30' },
  { id: 218, type: '시스템',  action: '점검 모드 종료',  target: '전체 서비스',              detail: '2월 정기 점검 완료',                     adminId: 'admin01', ip: '192.168.1.5', createdAt: '25.02.01 06:00' },
  { id: 217, type: '시스템',  action: '점검 모드 시작',  target: '전체 서비스',              detail: '2월 정기 점검 · 02:00~06:00',            adminId: 'admin01', ip: '192.168.1.5', createdAt: '25.02.01 02:00' },
  { id: 216, type: '대회관리', action: '대회 종료',       target: '2월 정기 대회',            detail: '정상 종료 · 최종 랭킹 집계 완료',        adminId: 'admin02', ip: '192.168.1.8', createdAt: '25.01.31 23:59' },
  { id: 215, type: '회원관리', action: '계정 생성',       target: '최신입 (user210)',          detail: '신규 회원 가입',                         adminId: 'admin03', ip: '192.168.1.9', createdAt: '25.01.28 13:10' },
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

const SEARCH_OPTIONS: { value: SearchType; label: string }[] = [
  { value: 'all',    label: '전체' },
  { value: 'action', label: '액션' },
  { value: 'target', label: '대상' },
];

const PAGE_SIZE = 8;

function logDateKey(createdAt: string): string {
  const [datePart] = createdAt.split(' ');
  const [yy, mm, dd] = datePart.split('.');
  return `20${yy}-${mm}-${dd}`;
}

export function AdminAuditLogPage() {
  const navigate = useNavigate();
  const [keyword, setKeyword]         = useState('');
  const [searchType, setSearchType]   = useState<SearchType>('all');
  const [startDate, setStartDate]     = useState('');
  const [endDate, setEndDate]         = useState('');
  const [typeFilter, setTypeFilter]   = useState<LogType | ''>('');
  const [adminFilter, setAdminFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  function handleReset() {
    setKeyword('');
    setSearchType('all');
    setStartDate('');
    setEndDate('');
    setTypeFilter('');
    setAdminFilter('');
    setCurrentPage(1);
  }

  const filtered = useMemo(() => {
    return MOCK_LOGS.filter(log => {
      if (typeFilter  && log.type    !== typeFilter)  return false;
      if (adminFilter && log.adminId !== adminFilter) return false;
      if (startDate && logDateKey(log.createdAt) < startDate) return false;
      if (endDate   && logDateKey(log.createdAt) > endDate)   return false;
      if (keyword) {
        const q = keyword.toLowerCase();
        const hit = (() => {
          switch (searchType) {
            case 'action': return log.action.toLowerCase().includes(q);
            case 'target': return log.target.toLowerCase().includes(q);
            default:       return (
              log.action.toLowerCase().includes(q) ||
              log.target.toLowerCase().includes(q) ||
              log.detail.toLowerCase().includes(q)
            );
          }
        })();
        if (!hit) return false;
      }
      return true;
    });
  }, [keyword, searchType, startDate, endDate, typeFilter, adminFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage   = Math.min(currentPage, totalPages);
  const paginated  = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const ghostCount = PAGE_SIZE - Math.max(paginated.length, paginated.length === 0 ? 1 : 0);

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
          {/* 검색 타입 + 키워드 */}
          <div className="flex h-9 flex-1 min-w-52 overflow-hidden rounded-md border border-slate-300 focus-within:border-[#1565C0]">
            <select
              value={searchType}
              onChange={e => { setSearchType(e.target.value as SearchType); setCurrentPage(1); }}
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
                onChange={e => { setKeyword(e.target.value); setCurrentPage(1); }}
                className="h-full w-full pl-8 pr-3 text-sm focus:outline-none"
              />
            </div>
          </div>

          {/* 날짜 */}
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

          {/* 유형 */}
          <select
            value={typeFilter}
            onChange={e => { setTypeFilter(e.target.value as LogType | ''); setCurrentPage(1); }}
            className="h-9 rounded-md border border-slate-300 px-3 text-sm focus:border-[#1565C0] focus:outline-none"
          >
            <option value="">전체 유형</option>
            {TYPE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>

          {/* 관리자 */}
          <select
            value={adminFilter}
            onChange={e => { setAdminFilter(e.target.value); setCurrentPage(1); }}
            className="h-9 rounded-md border border-slate-300 px-3 text-sm focus:border-[#1565C0] focus:outline-none"
          >
            <option value="">전체 관리자</option>
            {ADMINS.map(a => <option key={a} value={a}>{a}</option>)}
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
              {paginated.length === 0 ? (
                <tr className="h-11">
                  <td colSpan={8} className="px-3 text-center text-sm text-slate-400">
                    검색 결과가 없습니다.
                  </td>
                </tr>
              ) : (
                paginated.map(log => (
                  <tr key={log.id} className="h-11 cursor-pointer hover:bg-slate-50" onClick={() => navigate(`/admin/audit-log/${log.id}`)}>
                    <td className="px-3 text-center text-slate-400">{log.id}</td>
                    <td className="px-3 text-center">
                      <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold ${TYPE_BADGE[log.type]}`}>
                        {log.type}
                      </span>
                    </td>
                    <td className="truncate px-3 text-center font-semibold text-slate-900">
                      {log.action}
                    </td>
                    <td className="truncate px-3 text-center text-slate-700">
                      {log.target}
                    </td>
                    <td className="truncate px-3 text-center text-slate-500">
                      {log.detail}
                    </td>
                    <td className="px-3 text-center text-slate-700">
                      {log.adminId}
                    </td>
                    <td className="px-3 text-center text-slate-400">
                      {log.ip}
                    </td>
                    <td className="px-3 text-center text-slate-400">
                      {log.createdAt}
                    </td>
                  </tr>
                ))
              )}
              {Array.from({ length: ghostCount }).map((_, i) => (
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
                      safePage === page
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
