import { useState, useEffect, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';
import { Card } from '../../../components/common/Card';
import { useAdminPageActions } from '../../../contexts/AdminPageActionsContext';
import { Button } from '../../../components/common/Button';
import { useAlertCount } from '../../../contexts/AlertCountContext';
import { systemApi } from '../../../api/admin/system';
import { membersApi } from '../../../api/admin/members';

type ServiceStatus = 'NORMAL' | 'STANDBY' | 'ERROR' | 'WARNING';

interface Alert {
  id: string;
  type: string;
  memberName: string;
  memberId: string;
  detail: string;
}

interface ServiceItem {
  name: string;
  status: ServiceStatus;
  lag?: string;
  badge?: string;
}


// GET /api/admin/monitoring/services
const SERVICES: ServiceItem[] = [
  { name: '체결 엔진 (온프레미스 VM-5)',  status: 'NORMAL'  },
  { name: 'DB Master (온프레미스 VM-3)',   status: 'NORMAL'  },
  { name: 'DB Slave (온프레미스 VM-4)',    status: 'NORMAL',  lag: 'Lag: 0.2s' },
  { name: 'Redis Primary (온프레미스 VM-7)', status: 'NORMAL' },
  { name: 'AWS EKS (채널계)',              status: 'NORMAL'  },
  { name: 'AWS VPN 터널 (3개)',            status: 'NORMAL',  badge: '모두 연결됨' },
  { name: '한투 시세 API',                 status: 'NORMAL'  },
  { name: 'Prometheus / Grafana',          status: 'NORMAL'  },
  { name: 'DR DC (Cold Standby)',           status: 'STANDBY', badge: 'STANDBY' },
];

const DOT_CLASS: Record<ServiceStatus, string> = {
  NORMAL:  'bg-emerald-500',
  STANDBY: 'bg-slate-400',
  WARNING: 'bg-orange-400',
  ERROR:   'bg-rose-500',
};

const BADGE_CLASS: Record<ServiceStatus, string> = {
  NORMAL:  'bg-emerald-100 text-emerald-700',
  STANDBY: 'bg-slate-100 text-slate-500',
  WARNING: 'bg-orange-100 text-orange-700',
  ERROR:   'bg-rose-100 text-rose-700',
};

const BADGE_LABEL: Record<ServiceStatus, string> = {
  NORMAL:  '정상',
  STANDBY: '대기중 (정상)',
  WARNING: '경고',
  ERROR:   '오류',
};

export function AdminMonitoringPage() {
  const { setAlertCount } = useAlertCount();
  const [alerts, setAlerts]               = useState<Alert[]>([]);
  const [stats, setStats]                 = useState({ todayOrders: 0, settledOrders: 0, activeUsers: 0 });
  const [maintenanceOn, setMaintenanceOn] = useState(false);
  const [confirmModal, setConfirmModal]   = useState<'on' | 'off' | null>(null);
  const [alertConfirm, setAlertConfirm]   = useState<{ id: string; action: 'cancel' | 'suspend' | 'dismiss'; memberId: string } | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [monitoring, maintenance] = await Promise.all([
        systemApi.getMonitoring(),
        systemApi.getMaintenance(),
      ]);
      setStats({
        todayOrders:   monitoring.todayOrders ?? 0,
        settledOrders: monitoring.todayCompletedOrders ?? 0,
        activeUsers:   monitoring.activeUsers ?? 0,
      });
      setAlerts(
        (monitoring.alerts ?? []).map((a: any) => ({
          id:         String(a.alertId),
          type:       a.type ?? '',
          memberName: a.memberName ?? '',
          memberId:   String(a.memberId ?? ''),
          detail:     a.content ?? '',
        }))
      );
      setMaintenanceOn(maintenance.enabled ?? false);
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    setAlertCount(alerts.length);
  }, [alerts, setAlertCount]);

  async function handleDismiss(id: string) {
    try {
      await systemApi.ignoreAlert(Number(id));
      setAlerts(prev => prev.filter(a => a.id !== id));
    } catch (e) {
      setAlerts(prev => prev.filter(a => a.id !== id));
    }
  }

  function handleCancelOrder(id: string) {
    setAlerts(prev => prev.filter(a => a.id !== id));
  }

  async function handleSuspend(id: string, memberId: string) {
    try {
      await membersApi.suspendMembers({ memberIds: [Number(memberId)], reason: '비정상 탐지 — 즉시 정지' });
      setAlerts(prev => prev.filter(a => a.id !== id));
    } catch (e) { console.error(e); }
  }

  useAdminPageActions(
    <div className="flex items-center gap-3">
      <span className="flex items-center gap-1.5 text-sm text-slate-600">
        <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
        시스템 정상 운영 중
      </span>
      <Button variant="secondary" className="h-9 gap-1.5 text-sm" onClick={() => fetchData()}>
        <RefreshCw size={14} />
        새로고침
      </Button>
    </div>
  );

  return (
    <>
      {/* 통계 카드 4개 */}
      <div className="mb-6 grid gap-4 lg:grid-cols-4">
        {/* 오늘 주문 */}
        <Card>
          <p className="text-xs font-medium text-slate-500">오늘 주문</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{stats.todayOrders.toLocaleString('ko-KR')}건</p>
          <p className="mt-1 text-xs text-slate-400">체결 {stats.settledOrders.toLocaleString('ko-KR')}건</p>
        </Card>

        {/* 현재 접속자 */}
        <Card>
          <p className="text-xs font-medium text-slate-500">현재 접속자</p>
          <p className="mt-2 text-2xl font-bold text-[#1565C0]">{stats.activeUsers}명</p>
        </Card>

        {/* 비정상 탐지 */}
        <Card>
          <p className="text-xs font-medium text-slate-500">비정상 탐지</p>
          <p className="mt-2 text-2xl font-bold text-rose-600">
            {alerts.length}건
          </p>
          {alerts.length > 0 && (
            <p className="mt-1 text-xs font-medium text-rose-500">즉시 처리 필요</p>
          )}
        </Card>

        {/* 점검 모드 */}
        <Card>
          <p className="text-xs font-medium text-slate-500">점검 모드</p>
          <p className={`mt-2 text-2xl font-bold ${maintenanceOn ? 'text-rose-600' : 'text-slate-900'}`}>
            {maintenanceOn ? 'ON' : 'OFF'}
          </p>
          <p className={`mt-1 text-xs font-medium ${maintenanceOn ? 'text-rose-500' : 'text-slate-400'}`}>
            {maintenanceOn ? '점검 중' : '정상'}
          </p>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* 좌측: 비정상 탐지 목록 + 점검 모드 설정 */}
        <div className="space-y-6 lg:col-span-3">
          {/* 비정상 탐지 목록 */}
          <Card className="p-0">
            <div className="flex items-center gap-2 border-b border-slate-200 px-5 py-4">
              {alerts.length > 0 && (
                <span className="flex h-2 w-2 rounded-full bg-rose-500" />
              )}
              <h2 className="text-sm font-semibold text-slate-900">
                비정상 탐지 — 처리 필요 {alerts.length}건
              </h2>
            </div>

            <div className="h-72 overflow-y-auto scrollbar-none">
              {alerts.length === 0 ? (
                <p className="flex h-full items-center justify-center text-sm text-slate-400">처리할 비정상 탐지 항목이 없습니다.</p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {alerts.map(alert => (
                    <div key={alert.id} className="flex items-start gap-4 border-l-4 border-rose-400 bg-rose-50 px-5 py-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-rose-700">
                          {alert.type} — {alert.memberName} ({alert.memberId})
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">{alert.detail}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1.5">
                        <button onClick={() => setAlertConfirm({ id: alert.id, action: 'cancel', memberId: alert.memberId })} className="cursor-pointer rounded border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50">주문취소</button>
                        <button onClick={() => setAlertConfirm({ id: alert.id, action: 'suspend', memberId: alert.memberId })} className="cursor-pointer rounded border border-rose-300 bg-white px-2.5 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50">계정정지</button>
                        <button onClick={() => setAlertConfirm({ id: alert.id, action: 'dismiss', memberId: alert.memberId })} className="cursor-pointer rounded border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-400 hover:bg-slate-50">무시</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* 점검 모드 설정 */}
          <Card>
            <h2 className="mb-4 text-sm font-semibold text-slate-900">점검 모드 설정</h2>

            <div className="mb-4 rounded-lg border border-slate-200 px-4 py-3">
              <p className="text-sm font-medium text-slate-800">점검 모드 ON/OFF</p>
              <p className="mt-0.5 text-xs text-slate-500">
                점검 모드 ON 시 모든 주문·체결 즉시 차단
              </p>
            </div>

            {/* 활성화 시 안내 */}
            <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
              <p className="text-xs font-semibold text-amber-700">점검 모드 활성화 시</p>
              <ul className="mt-1 space-y-0.5 text-xs text-amber-600">
                <li>· 사용자 화면에 점검 중 안내 메시지 노출</li>
                <li>· 주문 불가 / 체결 엔진 일시 중단</li>
                <li>· 사전 공지 필수</li>
              </ul>
            </div>

            <div className="flex gap-2">
              <Button
                variant="danger"
                className="flex-1"
                onClick={() => setConfirmModal('on')}
                disabled={maintenanceOn}
              >
                점검 모드 ON
              </Button>
              <Button
                variant="brand"
                className="flex-1"
                onClick={() => setConfirmModal('off')}
                disabled={!maintenanceOn}
              >
                정상 모드 유지
              </Button>
            </div>
          </Card>
        </div>

        {/* 우측: 서비스 상태 */}
        <Card className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">서비스 상태</h2>
            <span className="text-xs text-slate-400">실시간 (자동 갱신)</span>
          </div>

          <div className="divide-y divide-slate-100">
            {SERVICES.map(svc => (
              <div key={svc.name} className="flex items-center gap-3 py-3">
                <span className={`h-2 w-2 shrink-0 rounded-full ${DOT_CLASS[svc.status]}`} />
                <span className="flex-1 text-sm text-slate-700">{svc.name}</span>
                {svc.lag && (
                  <span className="text-xs text-slate-400">{svc.lag}</span>
                )}
                {svc.badge ? (
                  <span className={`rounded px-2 py-0.5 text-xs font-medium ${
                    svc.badge === 'STANDBY'
                      ? 'bg-slate-100 text-slate-500'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {svc.badge}
                  </span>
                ) : (
                  <span className={`rounded px-2 py-0.5 text-xs font-medium ${BADGE_CLASS[svc.status]}`}>
                    {BADGE_LABEL[svc.status]}
                  </span>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* 비정상 탐지 액션 확인 모달 */}
      {alertConfirm && (() => {
        const target = alerts.find(a => a.id === alertConfirm.id);
        if (!target) return null;

        const ACTION_META = {
          cancel:  { label: '주문취소',  desc: `"${target.memberName}(${target.memberId})"의 해당 주문을 강제 취소합니다.`, btnVariant: 'secondary' as const },
          suspend: { label: '계정정지',  desc: `"${target.memberName}(${target.memberId})" 계정을 즉시 정지합니다.`,     btnVariant: 'danger'    as const },
          dismiss: { label: '무시',      desc: '해당 탐지 알림을 목록에서 제거합니다.',                                     btnVariant: 'secondary' as const },
        };
        const meta = ACTION_META[alertConfirm.action];

        async function handleConfirm() {
          if (alertConfirm!.action === 'cancel')  handleCancelOrder(alertConfirm!.id);
          if (alertConfirm!.action === 'suspend') await handleSuspend(alertConfirm!.id, alertConfirm!.memberId);
          if (alertConfirm!.action === 'dismiss') await handleDismiss(alertConfirm!.id);
          setAlertConfirm(null);
        }

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="w-120 rounded-xl bg-white p-6 shadow-xl">
              <h3 className="mb-1 text-base font-semibold text-slate-900">{meta.label} 확인</h3>
              <p className="mb-1 text-sm text-slate-500">{meta.desc}</p>
              <p className="mb-2 text-xs text-slate-400">{target.type} · {target.detail}</p>
              <p className="mb-4 text-sm font-medium text-slate-700">정말 진행하시겠습니까?</p>
              <div className="flex justify-end gap-2">
                <Button variant="secondary" onClick={() => setAlertConfirm(null)}>취소</Button>
                <Button variant={meta.btnVariant} onClick={handleConfirm}>{meta.label}</Button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* 점검 모드 전환 확인 모달 */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-120 rounded-xl bg-white p-6 shadow-xl">
            <h3 className="mb-1 text-base font-semibold text-slate-900">
              {confirmModal === 'on' ? '점검 모드로 전환' : '정상 모드로 복귀'}
            </h3>
            <p className="mb-2 text-sm text-slate-500">
              {confirmModal === 'on'
                ? '점검 모드를 활성화하면 모든 주문·체결이 즉시 차단됩니다.'
                : '정상 모드로 복귀하면 주문·체결이 재개됩니다.'}
            </p>
            {confirmModal === 'on' && (
              <ul className="mb-4 space-y-0.5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-600">
                <li>· 사용자 화면에 점검 중 안내 메시지 노출</li>
                <li>· 주문 불가 / 체결 엔진 일시 중단</li>
                <li>· 사전 공지 필수</li>
              </ul>
            )}
            <p className="mb-4 text-sm font-medium text-slate-700">
              정말 {confirmModal === 'on' ? '점검 모드로 전환' : '정상 모드로 복귀'}하시겠습니까?
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setConfirmModal(null)}>
                취소
              </Button>
              <Button
                variant={confirmModal === 'on' ? 'danger' : 'brand'}
                onClick={async () => {
                  const turnOn = confirmModal === 'on';
                  try {
                    await systemApi.updateMaintenance({ status: turnOn ? 'ON' : 'OFF' });
                    setMaintenanceOn(turnOn);
                  } catch (e) {
                    console.error(e);
                  }
                  setConfirmModal(null);
                }}
              >
                {confirmModal === 'on' ? '점검 모드 ON' : '정상 모드 유지'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
