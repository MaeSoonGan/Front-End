import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { systemApi } from '../../../api/admin/system';

interface AuditLogDetail {
  id: number;
  type: string;
  action: string;
  target: string;
  detail: string;
  result: string;
  adminName: string;
  adminLoginId: string;
  adminRole: string;
  ip: string;
  userAgent: string;
  createdAt: string;
}

const TYPE_LABEL: Record<string, string> = {
  MEMBER:  '회원관리',
  SEED:    '시드지급',
  ORDER:   '주문취소',
  CONTEST: '대회관리',
  NOTICE:  '공지사항',
  RANKING: '랭킹',
  SYSTEM:  '시스템',
};

const TYPE_BADGE: Record<string, string> = {
  MEMBER:  'bg-rose-100 text-rose-600',
  SEED:    'bg-emerald-100 text-emerald-600',
  ORDER:   'bg-orange-100 text-orange-600',
  CONTEST: 'bg-blue-100 text-blue-600',
  NOTICE:  'bg-sky-100 text-sky-600',
  RANKING: 'bg-rose-100 text-rose-600',
  SYSTEM:  'bg-slate-100 text-slate-500',
};

const ACTION_LABEL: Record<string, string> = {
  CREATE_NOTICE:        '공지 등록',
  UPDATE_NOTICE:        '공지 수정',
  DELETE_NOTICE:        '공지 삭제',
  CREATE_CONTEST:       '대회 생성',
  UPDATE_CONTEST:       '대회 수정',
  END_CONTEST:          '대회 종료',
  CANCEL_CONTEST:       '대회 취소',
  REFRESH_RANKING:      '랭킹 갱신',
  EXCLUDE_RANKING:      '랭킹 제외',
  RESTORE_RANKING:      '랭킹 복구',
  SUSPEND_MEMBER:       '계정 정지',
  RELEASE_MEMBER:       '정지 해제',
  PAY_SEED_MONEY:       '시드머니 지급',
  ENABLE_MAINTENANCE:   '점검 모드 시작',
  DISABLE_MAINTENANCE:  '점검 모드 종료',
  IGNORE_ABNORMAL_ALERT: '알림 무시',
  FORCE_CANCEL_ORDER:   '주문 강제 취소',
};

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

function isoToDisplay(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${String(d.getFullYear()).slice(2)}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function AdminAuditLogDetailPage() {
  const { logId } = useParams<{ logId: string }>();
  const navigate = useNavigate();

  const [log, setLog]         = useState<AuditLogDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!logId) { setNotFound(true); setLoading(false); return; }
    systemApi.getAuditLog(Number(logId))
      .then(data => {
        setLog({
          id:           data.logId,
          type:         data.type ?? 'SYSTEM',
          action:       data.action ?? '',
          target:       formatTarget(data.targetType, data.targetId),
          detail:       data.detail ?? '',
          result:       data.result ?? '',
          adminName:    data.adminName ?? '',
          adminLoginId: data.adminLoginId ?? '',
          adminRole:    data.adminRole ?? '',
          ip:           data.ipAddress ?? '-',
          userAgent:    data.userAgent ?? '',
          createdAt:    isoToDisplay(data.createdAt),
        });
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [logId]);

  if (loading) {
    return <div className="flex items-center justify-center py-20 text-slate-400">불러오는 중...</div>;
  }

  if (notFound || !log) {
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
          <span className={`inline-flex items-center rounded px-2.5 py-1 text-xs font-semibold ${TYPE_BADGE[log.type] ?? 'bg-slate-100 text-slate-500'}`}>
            {TYPE_LABEL[log.type] ?? log.type}
          </span>
          <h2 className="text-xl font-bold text-slate-900">{ACTION_LABEL[log.action] ?? log.action}</h2>
          <span className="ml-auto text-xs text-slate-400">No. {log.id}</span>
        </div>

        {/* 메타 정보 그리드 */}
        <div className="mb-5 grid grid-cols-2 gap-x-8 gap-y-3 rounded-lg bg-slate-50 px-5 py-4 text-sm lg:grid-cols-5">
          <div>
            <p className="mb-1 text-xs font-medium text-slate-400">대상</p>
            <p className="font-medium text-slate-800">{log.target || '-'}</p>
          </div>
          <div>
            <p className="mb-1 text-xs font-medium text-slate-400">처리 관리자</p>
            <p className="font-medium text-slate-800">{log.adminName}{log.adminLoginId ? ` (${log.adminLoginId})` : ''}</p>
          </div>
          <div>
            <p className="mb-1 text-xs font-medium text-slate-400">처리 일시</p>
            <p className="font-medium text-slate-800">{log.createdAt}</p>
          </div>
          {log.result && (
            <div>
              <p className="mb-1 text-xs font-medium text-slate-400">처리 결과</p>
              <p className="font-medium text-slate-800">{log.result}</p>
            </div>
          )}
          {log.adminRole && (
            <div>
              <p className="mb-1 text-xs font-medium text-slate-400">관리자 권한</p>
              <p className="font-medium text-slate-800">{log.adminRole}</p>
            </div>
          )}
        </div>

        {/* 구분선 */}
        <hr className="mb-5 border-slate-200" />

        {/* 상세 내용 */}
        <div>
          <p className="mb-2 text-xs font-medium text-slate-400">상세 내용</p>
          <p className="text-sm leading-relaxed text-slate-700">{log.detail || '-'}</p>
        </div>

        {log.userAgent && (
          <div className="mt-4">
            <p className="mb-2 text-xs font-medium text-slate-400">User-Agent</p>
            <p className="break-all text-xs leading-relaxed text-slate-500">{log.userAgent}</p>
          </div>
        )}
      </Card>
    </>
  );
}
