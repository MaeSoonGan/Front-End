import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { getPaginationPages } from '../../../utils/pagination';
import { Card } from '../../../components/common/Card';
import { useAdminPageActions } from '../../../contexts/AdminPageActionsContext';
import { Button } from '../../../components/common/Button';
import { useAlertCount } from '../../../contexts/AlertCountContext';
import { systemApi } from '../../../api/admin/system';
import { membersApi } from '../../../api/admin/members';

interface Alert {
  id: string;
  type: string;
  memberName: string;
  memberId: string;
  orderId: string;
  detail: string;
}


export function AdminMonitoringPage() {
  const { setAlertCount } = useAlertCount();
  const [alerts, setAlerts]               = useState<Alert[]>([]);
  const [stats, setStats]                 = useState({ todayOrders: 0, settledOrders: 0, activeUsers: 0 });
  const [maintenanceOn, setMaintenanceOn] = useState(false);
  const [confirmModal, setConfirmModal]   = useState<'on' | 'off' | null>(null);
  const [alertConfirm, setAlertConfirm]   = useState<{ id: string; action: 'cancel' | 'suspend' | 'release' | 'dismiss'; memberId: string } | null>(null);
  const [alertPage, setAlertPage]         = useState(1);

  const ALERT_PAGE_SIZE = 5;

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
          orderId:    a.orderId ? String(a.orderId) : '',
          detail:     a.content ?? '',
        }))
      );
      setMaintenanceOn(maintenance.enabled ?? false);
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    setAlertCount(alerts.length);
    setAlertPage(1);
  }, [alerts, setAlertCount]);

  const totalAlertPages = Math.max(1, Math.ceil(alerts.length / ALERT_PAGE_SIZE));
  const safeAlertPage   = Math.min(alertPage, totalAlertPages);
  const pagedAlerts     = alerts.slice((safeAlertPage - 1) * ALERT_PAGE_SIZE, safeAlertPage * ALERT_PAGE_SIZE);

  async function handleDismiss(id: string) {
    try {
      await systemApi.ignoreAlert(Number(id));
      setAlerts(prev => prev.filter(a => a.id !== id));
    } catch (e) {
      setAlerts(prev => prev.filter(a => a.id !== id));
    }
  }

  async function handleCancelOrder(id: string) {
    const target = alerts.find(a => a.id === id);
    if (target?.orderId) {
      try {
        await systemApi.forceCancelOrder(Number(target.orderId), { reason: '비정상 탐지 — 관리자 강제 취소' });
      } catch (e) {
        console.error(e);
      }
    }
    setAlerts(prev => prev.filter(a => a.id !== id));
  }

  async function handleSuspend(id: string, memberId: string) {
    try {
      await membersApi.suspendMembers({ memberIds: [Number(memberId)], reason: '비정상 탐지 — 즉시 정지' });
      setAlerts(prev => prev.filter(a => a.id !== id));
    } catch (e) { console.error(e); }
  }

  // 로그인 다수 실패로 자동 정지된 회원 알림 → 정지 해제 (대시보드와 동일)
  async function handleRelease(id: string) {
    try {
      await systemApi.releaseAlert(Number(id));
    } catch (e) {
      console.error(e);
    }
    setAlerts(prev => prev.filter(a => a.id !== id));
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

      <div className="grid gap-6 lg:grid-cols-2">
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

            <div className="divide-y divide-slate-100">
              {alerts.length === 0 ? (
                <p className="flex items-center justify-center py-4 text-sm text-slate-400">처리할 비정상 탐지 항목이 없습니다.</p>
              ) : (
                pagedAlerts.map(alert => (
                  <div key={alert.id} className="flex items-start gap-4 border-l-4 border-rose-400 bg-rose-50 px-5 py-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-rose-700">
                        {alert.type} — {alert.memberName} ({alert.memberId})
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">{alert.detail}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      {alert.orderId ? (
                        // 거래 관련 비정상 탐지: 주문 강제 취소
                        <button onClick={() => setAlertConfirm({ id: alert.id, action: 'cancel', memberId: alert.memberId })} className="cursor-pointer rounded border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50">주문취소</button>
                      ) : (
                        // 로그인 다수 실패 등 회원 비정상 탐지(자동 정지): 정지 해제
                        <button onClick={() => setAlertConfirm({ id: alert.id, action: 'release', memberId: alert.memberId })} className="cursor-pointer rounded border border-rose-300 bg-white px-2.5 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50">정지 해제</button>
                      )}
                      <button onClick={() => setAlertConfirm({ id: alert.id, action: 'dismiss', memberId: alert.memberId })} className="cursor-pointer rounded border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-400 hover:bg-slate-50">무시</button>
                    </div>
                  </div>
                ))
              )}
              {Array.from({ length: Math.max(0, ALERT_PAGE_SIZE - (alerts.length === 0 ? 1 : pagedAlerts.length)) }).map((_, i) => (
                <div key={`ghost-${i}`} className="px-5 py-4">
                  <span className="invisible select-none text-sm leading-5">x</span>
                  <span className="invisible block text-xs leading-4">x</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center border-t border-slate-100 px-5 py-3">
              <div className="flex items-center gap-1">
                <button onClick={() => setAlertPage(1)} disabled={safeAlertPage === 1} className="cursor-pointer rounded p-1 text-slate-500 hover:bg-slate-100 disabled:cursor-default disabled:opacity-40"><ChevronsLeft size={15} /></button>
                <button onClick={() => setAlertPage(p => Math.max(1, p - 1))} disabled={safeAlertPage === 1} className="cursor-pointer rounded p-1 text-slate-500 hover:bg-slate-100 disabled:cursor-default disabled:opacity-40"><ChevronLeft size={15} /></button>
                {getPaginationPages(safeAlertPage, totalAlertPages).map(page => (
                  <button key={page} onClick={() => setAlertPage(page)} className={`min-w-7 cursor-pointer rounded px-2 py-0.5 text-sm ${page === safeAlertPage ? 'bg-[#1565C0] text-white' : 'text-slate-600 hover:bg-slate-100'}`}>{page}</button>
                ))}
                <button onClick={() => setAlertPage(p => Math.min(totalAlertPages, p + 1))} disabled={safeAlertPage === totalAlertPages} className="cursor-pointer rounded p-1 text-slate-500 hover:bg-slate-100 disabled:cursor-default disabled:opacity-40"><ChevronRight size={15} /></button>
                <button onClick={() => setAlertPage(totalAlertPages)} disabled={safeAlertPage === totalAlertPages} className="cursor-pointer rounded p-1 text-slate-500 hover:bg-slate-100 disabled:cursor-default disabled:opacity-40"><ChevronsRight size={15} /></button>
              </div>
            </div>
          </Card>

          {/* 점검 모드 설정 */}
          <Card className="flex flex-col">
            <h2 className="mb-6 text-sm font-semibold text-slate-900">점검 모드 설정</h2>

            <div className="flex flex-1 flex-col gap-4">
              <div className="rounded-lg border border-slate-200 px-4 py-4">
                <p className="text-sm font-medium text-slate-800">점검 모드 ON/OFF</p>
                <p className="mt-1 text-xs text-slate-500">
                  점검 모드 ON 시 모든 주문·체결이 즉시 차단되며, 사용자 접근이 제한됩니다.
                </p>
              </div>

              <div className="flex flex-1 flex-col rounded-lg border border-amber-200 bg-amber-50 px-4 py-4">
                <p className="text-xs font-semibold text-amber-700">점검 모드 활성화 시</p>
                <ul className="mt-2 flex-1 space-y-1.5 text-xs text-amber-600">
                  <li>· 사용자 화면에 점검 중 안내 메시지 노출</li>
                  <li>· 주문 불가 / 체결 엔진 일시 중단</li>
                  <li>· 진행 중인 모든 미체결 주문 자동 취소</li>
                  <li>· 신규 회원가입 및 로그인 차단</li>
                  <li>· 시세 데이터 수신은 유지되나 거래 반영 안 됨</li>
                  <li>· 점검 종료 후 체결 엔진 재시작 필요</li>
                  <li>· 사전 공지 필수 (최소 10분 전 권장)</li>
                  <li>· 점검 이력은 감사 로그에 자동 기록됨</li>
                </ul>
              </div>
            </div>

            <div className="mt-auto flex gap-2 pt-6">
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
                점검 모드 OFF
              </Button>
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
          release: { label: '정지 해제', desc: `"${target.memberName}(${target.memberId})"의 자동 정지를 해제하고 로그인 실패를 초기화합니다.`, btnVariant: 'danger' as const },
          dismiss: { label: '무시',      desc: '해당 탐지 알림을 목록에서 제거합니다.',                                     btnVariant: 'secondary' as const },
        };
        const meta = ACTION_META[alertConfirm.action];

        async function handleConfirm() {
          if (alertConfirm!.action === 'cancel')  await handleCancelOrder(alertConfirm!.id);
          if (alertConfirm!.action === 'suspend') await handleSuspend(alertConfirm!.id, alertConfirm!.memberId);
          if (alertConfirm!.action === 'release') await handleRelease(alertConfirm!.id);
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
                {confirmModal === 'on' ? '점검 모드 ON' : '점검 모드 OFF'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
