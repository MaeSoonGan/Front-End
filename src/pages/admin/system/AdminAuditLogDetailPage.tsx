import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../../../components/common/Card';
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

const TYPE_BADGE: Record<LogType, string> = {
  회원관리: 'bg-rose-100 text-rose-600',
  시드지급: 'bg-emerald-100 text-emerald-600',
  주문취소: 'bg-orange-100 text-orange-600',
  대회관리: 'bg-blue-100 text-blue-600',
  공지사항: 'bg-sky-100 text-sky-600',
  랭킹:     'bg-rose-100 text-rose-600',
  시스템:   'bg-slate-100 text-slate-500',
};

export function AdminAuditLogDetailPage() {
  const { logId } = useParams<{ logId: string }>();
  const navigate   = useNavigate();

  const log = MOCK_LOGS.find(l => l.id === Number(logId));

  if (!log) {
    return (
      <Card className="flex flex-col items-center justify-center py-20 text-slate-400">
        <p className="text-base">감사 로그를 찾을 수 없습니다.</p>
        <button
          onClick={() => navigate('/admin/audit-log')}
          className="mt-4 cursor-pointer text-sm text-[#1565C0] hover:underline"
        >
          목록으로 돌아가기
        </button>
      </Card>
    );
  }

  return (
    <>
      {/* 헤더 */}
      <div className="mb-6 flex items-center gap-3">
        <h1 className="text-lg font-bold text-slate-900">감사 로그 상세</h1>
        <Button variant="secondary" className="ml-auto h-9 px-5 text-sm" onClick={() => navigate('/admin/audit-log')}>
          목록으로
        </Button>
      </div>

      {/* 상세 카드 */}
      <Card>
        {/* 액션 + 유형 배지 */}
        <div className="mb-5 flex items-center gap-3">
          <span className={`inline-flex items-center rounded px-2.5 py-1 text-xs font-semibold ${TYPE_BADGE[log.type]}`}>
            {log.type}
          </span>
          <h2 className="text-xl font-bold text-slate-900">{log.action}</h2>
          <span className="ml-auto text-xs text-slate-400">No. {log.id}</span>
        </div>

        {/* 메타 정보 그리드 */}
        <div className="mb-5 grid grid-cols-2 gap-x-8 gap-y-3 rounded-lg bg-slate-50 px-5 py-4 text-sm lg:grid-cols-4">
          <div>
            <p className="mb-1 text-xs font-medium text-slate-400">대상</p>
            <p className="font-medium text-slate-800">{log.target}</p>
          </div>
          <div>
            <p className="mb-1 text-xs font-medium text-slate-400">처리 관리자</p>
            <p className="font-medium text-slate-800">{log.adminId}</p>
          </div>
          <div>
            <p className="mb-1 text-xs font-medium text-slate-400">IP 주소</p>
            <p className="font-medium text-slate-800">{log.ip}</p>
          </div>
          <div>
            <p className="mb-1 text-xs font-medium text-slate-400">처리 일시</p>
            <p className="font-medium text-slate-800">{log.createdAt}</p>
          </div>
        </div>

        {/* 구분선 */}
        <hr className="mb-5 border-slate-200" />

        {/* 상세 내용 */}
        <div>
          <p className="mb-2 text-xs font-medium text-slate-400">상세 내용</p>
          <p className="text-sm leading-relaxed text-slate-700">{log.detail}</p>
        </div>
      </Card>

</>
  );
}
