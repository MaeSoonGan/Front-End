import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { getPaginationPages } from '../../../utils/pagination';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  LabelList,
} from 'recharts';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { StatusBadge } from '../../../components/common/StatusBadge';
import type { StatusTone } from '../../../types/common';
import { dashboardApi } from '../../../api/admin/dashboard';
import { systemApi } from '../../../api/admin/system';
import { membersApi } from '../../../api/admin/members';

// ---- Types ----

type AlertType = 'ABNORMAL_ORDER' | 'DUPLICATE_ORDER' | 'ABNORMAL_MEMBER';
type ActivityType = 'SUSPEND' | 'SEED' | 'CONTEST' | 'ORDER_CANCEL';
type ContestStatus = 'ACTIVE' | 'CLOSING_SOON';

interface DashboardStats {
  totalMembers: number;
  todayNewMembers: number;
  todayOrders: number;
  todayCompletedOrders: number;
  activeContestCount: number;
  totalParticipants: number;
  anomalyCount: number;
}

interface AlertItem {
  id: string;
  memberId: string;
  userId: string;
  orderId?: string;
  alertType: AlertType;
  memberName: string;
  description: string;
}

interface DailyOrderStat {
  date: string;
  count: number;
  isToday: boolean;
  fill: string;
}

interface ContestItem {
  id: string;
  name: string;
  period: string;
  participants: string;
  contestStatus: ContestStatus;
}

interface ActivityItem {
  id: string;
  content: string;
  adminId: string;
  createdAt: string;
  activityType: ActivityType;
}

// ---- Lookup Maps ----

const ALERT_TYPE_LABEL: Record<AlertType, string> = {
  ABNORMAL_ORDER: '대량 주문 탐지',
  DUPLICATE_ORDER: '중복 주문 탐지',
  ABNORMAL_MEMBER: '로그인 다수 실패',
};

const CONTEST_STATUS_TONE: Record<ContestStatus, StatusTone> = {
  ACTIVE: 'info',
  CLOSING_SOON: 'warning',
};

const CONTEST_STATUS_LABEL: Record<ContestStatus, string> = {
  ACTIVE: '진행중',
  CLOSING_SOON: '마감임박',
};

const ACTIVITY_DOT_COLOR: Record<ActivityType, string> = {
  SUSPEND: 'bg-rose-500',
  SEED: 'bg-emerald-500',
  CONTEST: 'bg-sky-500',
  ORDER_CANCEL: 'bg-amber-500',
};

function toActivityType(type: string): ActivityType {
  if (type === 'SUSPEND' || type === 'MEMBER_SUSPEND') return 'SUSPEND';
  if (type === 'SEED' || type === 'SEED_PAYMENT') return 'SEED';
  if (type === 'CONTEST' || type === 'CONTEST_MANAGE') return 'CONTEST';
  if (type === 'ORDER_CANCEL') return 'ORDER_CANCEL';
  return 'CONTEST';
}

function formatDate(isoDate: string): string {
  const d = new Date(isoDate);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const isToday = d.toDateString() === today.toDateString();
  if (isToday) return `오늘 ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  return `${String(d.getFullYear()).slice(2)}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

// ---- Page ----

export function AdminDashboardPage() {
  const navigate = useNavigate();

  const [stats, setStats] = useState<DashboardStats>({
    totalMembers: 0, todayNewMembers: 0, todayOrders: 0,
    todayCompletedOrders: 0, activeContestCount: 0, totalParticipants: 0, anomalyCount: 0,
  });
  const [alerts, setAlerts]         = useState<AlertItem[]>([]);
  const [dailyOrders, setDailyOrders] = useState<DailyOrderStat[]>([]);
  const [contests, setContests]     = useState<ContestItem[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading]       = useState(true);

  const [alertConfirm, setAlertConfirm] = useState<{
    alertId: string;
    action: 'release' | 'cancel' | 'dismiss';
    memberId: string;
    orderId?: string;
  } | null>(null);
  const [contestPage, setContestPage]   = useState(1);
  const [alertPage, setAlertPage]       = useState(1);
  const [activityPage, setActivityPage] = useState(1);

  useEffect(() => {
    dashboardApi.getDashboard()
      .then(data => {
        setStats({
          totalMembers:        data.totalUsers ?? 0,
          todayNewMembers:     data.todayNewUsers ?? 0,
          todayOrders:         data.todayOrders ?? 0,
          todayCompletedOrders: data.todayCompletedOrders ?? 0,
          activeContestCount:  data.activeContestCount ?? 0,
          totalParticipants:   data.activeContestParticipants ?? 0,
          anomalyCount:        data.abnormalAlertCount ?? 0,
        });

        setAlerts((data.alerts ?? []).map((a: any) => ({
          id:         String(a.alertId),
          memberId:   String(a.userId),
          userId:     String(a.userId),
          orderId:    a.orderId ? String(a.orderId) : undefined,
          alertType:  (a.type as AlertType) ?? 'ABNORMAL_ORDER',
          memberName: a.userName ?? '',
          description: a.content ?? '',
        })));

        setDailyOrders((data.dailyOrders ?? []).map((d: any) => ({
          date:    d.isToday ? '오늘' : formatDate(d.date),
          count:   d.orderCount ?? 0,
          isToday: d.isToday ?? false,
          fill:    d.isToday ? '#ef4444' : '#3b82f6',
        })));

        setContests((data.activeContests ?? []).map((c: any) => ({
          id:            String(c.contestId),
          name:          c.contestName ?? '',
          period:        c.period ?? '',
          participants:  `${c.participantCount ?? 0}명`,
          contestStatus: 'ACTIVE' as ContestStatus,
        })));

        setActivities((data.recentActivities ?? []).map((a: any) => ({
          id:           String(a.activityId),
          content:      a.content ?? '',
          adminId:      a.adminName ?? String(a.adminId),
          createdAt:    a.createdAt ? formatDateTime(a.createdAt) : '',
          activityType: toActivityType(a.type ?? ''),
        })));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const isSystemNormal = alerts.length === 0;

  const ALERT_PAGE_SIZE    = 3;
  const CONTEST_PAGE_SIZE  = 3;
  const ACTIVITY_PAGE_SIZE = 4;

  const activeContests     = contests.filter(c => c.contestStatus === 'ACTIVE');
  const totalContestPages  = Math.max(1, Math.ceil(activeContests.length / CONTEST_PAGE_SIZE));
  const pagedContests      = activeContests.slice((contestPage - 1) * CONTEST_PAGE_SIZE, contestPage * CONTEST_PAGE_SIZE);

  const totalAlertPages    = Math.max(1, Math.ceil(alerts.length / ALERT_PAGE_SIZE));
  const pagedAlerts        = alerts.slice((alertPage - 1) * ALERT_PAGE_SIZE, alertPage * ALERT_PAGE_SIZE);

  const totalActivityPages = Math.max(1, Math.ceil(activities.length / ACTIVITY_PAGE_SIZE));
  const pagedActivities    = activities.slice((activityPage - 1) * ACTIVITY_PAGE_SIZE, activityPage * ACTIVITY_PAGE_SIZE);

  async function handleRelease(alertId: string) {
    try {
      await systemApi.releaseAlert(Number(alertId));
    } catch (e) {
      console.error(e);
    }
    setAlerts(prev => prev.filter(a => a.id !== alertId));
  }

  async function handleDismiss(alertId: string) {
    try {
      await systemApi.ignoreAlert(Number(alertId));
      setAlerts(prev => prev.filter(a => a.id !== alertId));
    } catch (e) {
      setAlerts(prev => prev.filter(a => a.id !== alertId));
    }
  }

  async function handleCancelOrder(orderId: string) {
    try {
      await systemApi.forceCancelOrder(Number(orderId), { reason: '비정상 탐지 — 관리자 강제 취소' });
    } catch (e) {
      console.error(e);
    }
    setAlerts(prev => prev.filter(a => a.orderId !== orderId));
  }

  if (loading) {
    return <div className="flex items-center justify-center py-20 text-slate-400">불러오는 중...</div>;
  }

  return (
    <>
      {/* 알림 처리 확인 모달 */}
      {alertConfirm && (() => {
        const target = alerts.find(a => a.id === alertConfirm.alertId);
        if (!target) return null;

        const ACTION_META = {
          cancel:  { label: '주문 취소', desc: `"${target.memberName}(${target.userId})"의 해당 주문을 강제 취소합니다.`,      btnVariant: 'danger'    as const },
          release: { label: '정지 해제', desc: `"${target.memberName}(${target.userId})"의 자동 정지를 해제하고 로그인 실패를 초기화합니다.`, btnVariant: 'danger' as const },
          dismiss: { label: '확인',     desc: '해당 탐지 알림을 확인 처리하여 목록에서 제거합니다.',                              btnVariant: 'secondary' as const },
        };
        const meta = ACTION_META[alertConfirm.action];

        async function handleConfirm() {
          if (alertConfirm!.action === 'cancel')  handleCancelOrder(alertConfirm!.orderId ?? alertConfirm!.alertId);
          if (alertConfirm!.action === 'release') await handleRelease(alertConfirm!.alertId);
          if (alertConfirm!.action === 'dismiss') await handleDismiss(alertConfirm!.alertId);
          setAlertConfirm(null);
        }

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="w-120 rounded-xl bg-white p-6 shadow-xl">
              <h3 className="mb-1 text-base font-semibold text-slate-900">{meta.label} 확인</h3>
              <p className="mb-1 text-sm text-slate-500">{meta.desc}</p>
              <p className="mb-2 text-xs text-slate-400">{ALERT_TYPE_LABEL[target.alertType]} · {target.description}</p>
              <p className="mb-4 text-sm font-medium text-slate-700">정말 진행하시겠습니까?</p>
              <div className="flex justify-end gap-2">
                <Button variant="secondary" onClick={() => setAlertConfirm(null)}>취소</Button>
                <Button variant={meta.btnVariant} onClick={handleConfirm}>{meta.label}</Button>
              </div>
            </div>
          </div>
        );
      })()}

    <div className="space-y-6">
      {/* 통계 카드 4종 */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="cursor-pointer transition-shadow hover:shadow-md" onClick={() => navigate('/admin/users')}>
          <p className="text-sm font-medium text-slate-500">전체 회원</p>
          <p className="mt-2 text-3xl font-bold text-slate-950">{stats.totalMembers.toLocaleString()}명</p>
          <p className="mt-1 text-sm text-slate-500">오늘 가입{' '}<span className="font-medium text-emerald-600">+{stats.todayNewMembers}명</span></p>
        </Card>

        <Card>
          <p className="text-sm font-medium text-slate-500">오늘 주문</p>
          <p className="mt-2 text-3xl font-bold text-slate-950">{stats.todayOrders.toLocaleString()}건</p>
          <p className="mt-1 text-sm text-slate-500">체결{' '}<span className="font-medium text-slate-700">{stats.todayCompletedOrders.toLocaleString()}건</span></p>
        </Card>

        <Card className="cursor-pointer transition-shadow hover:shadow-md" onClick={() => navigate('/admin/contests')}>
          <p className="text-sm font-medium text-slate-500">진행 중 대회</p>
          <p className="mt-2 text-3xl font-bold text-slate-950">{stats.activeContestCount}개</p>
          <p className="mt-1 text-sm text-slate-500">참가자{' '}<span className="font-medium text-slate-700">{stats.totalParticipants}명</span></p>
        </Card>

        <Card className="cursor-pointer transition-shadow hover:shadow-md" onClick={() => navigate('/admin/monitoring')}>
          <p className="text-sm font-medium text-slate-500">비정상 탐지</p>
          <p className="mt-2 text-3xl font-bold text-rose-600">{stats.anomalyCount}건</p>
          <p className="mt-1 text-sm font-medium text-rose-500">즉시 처리 필요</p>
        </Card>
      </div>

      {/* 중간 행: 알림 + 차트 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Card className="flex flex-col lg:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">알림 — 즉시 처리 필요</h2>
            {alerts.length > 0 && <span className="text-sm text-slate-500">미처리 {alerts.length}건</span>}
          </div>

          <div className="h-64 space-y-3 overflow-hidden">
            {pagedAlerts.map(alert => (
              <div key={alert.id} className="flex items-center justify-between rounded-lg border-l-4 border-rose-400 bg-rose-50 px-4 py-3">
                <div>
                  <p className="font-semibold text-slate-900">
                    {ALERT_TYPE_LABEL[alert.alertType] ?? alert.alertType} — {alert.memberName} ({alert.userId})
                  </p>
                  <p className="mt-0.5 text-sm text-slate-500">{alert.description}</p>
                </div>
                <div className="ml-4 flex shrink-0 gap-2">
                  {alert.orderId ? (
                    // 거래 관련 비정상 탐지: 주문 취소
                    <Button variant="danger" className="h-8 px-3 text-xs" onClick={() => setAlertConfirm({ alertId: alert.id, action: 'cancel', memberId: alert.memberId, orderId: alert.orderId })}>주문 취소</Button>
                  ) : (
                    // 로그인 관련 비정상 탐지(자동 정지): 정지 해제
                    <Button variant="danger" className="h-8 px-3 text-xs" onClick={() => setAlertConfirm({ alertId: alert.id, action: 'release', memberId: alert.memberId })}>정지 해제</Button>
                  )}
                  <Button variant="ghost" className="h-8 border border-slate-300 px-3 text-xs" onClick={() => setAlertConfirm({ alertId: alert.id, action: 'dismiss', memberId: alert.memberId })}>확인</Button>
                </div>
              </div>
            ))}

            {isSystemNormal && (
              <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                <div>
                  <p className="font-medium text-emerald-800">시스템 정상 운영 중</p>
                  <p className="text-sm text-emerald-600">체결 엔진, DB, 시세 서비스 모두 정상</p>
                </div>
              </div>
            )}
          </div>

          {totalAlertPages > 1 && (
            <div className="mt-3 flex items-center justify-center gap-1">
              <button onClick={() => setAlertPage(1)} disabled={alertPage === 1} className="cursor-pointer rounded p-1 text-slate-400 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30"><ChevronsLeft size={16} /></button>
              <button onClick={() => setAlertPage(p => Math.max(1, p - 1))} disabled={alertPage === 1} className="cursor-pointer rounded p-1 text-slate-400 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30"><ChevronLeft size={16} /></button>
              {getPaginationPages(alertPage, totalAlertPages).map(page => (
                <button key={page} onClick={() => setAlertPage(page)} className={`min-w-7 cursor-pointer rounded px-2 py-1 text-xs font-medium ${alertPage === page ? 'bg-[#1565C0] text-white' : 'text-slate-600 hover:bg-slate-100'}`}>{page}</button>
              ))}
              <button onClick={() => setAlertPage(p => Math.min(totalAlertPages, p + 1))} disabled={alertPage === totalAlertPages} className="cursor-pointer rounded p-1 text-slate-400 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30"><ChevronRight size={16} /></button>
              <button onClick={() => setAlertPage(totalAlertPages)} disabled={alertPage === totalAlertPages} className="cursor-pointer rounded p-1 text-slate-400 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30"><ChevronsRight size={16} /></button>
            </div>
          )}
        </Card>

        <Card className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">일별 주문 건수</h2>
            <span className="text-sm text-slate-500">최근 7일</span>
          </div>
          <ResponsiveContainer width="100%" height={240} className="outline-none">
            <BarChart layout="vertical" data={dailyOrders} margin={{ top: 0, right: 52, bottom: 0, left: 0 }} tabIndex={-1}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="date" width={36} tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Bar dataKey="count" radius={[0, 4, 4, 0]} isAnimationActive={false}>
                <LabelList dataKey="count" position="right" style={{ fontSize: 11, fill: '#475569' }} formatter={(v: unknown) => Number(v).toLocaleString()} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* 하단 행: 대회 목록 + 최근 활동 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Card className="flex flex-col lg:col-span-3">
          <h2 className="mb-4 font-semibold text-slate-900">진행 중인 대회</h2>
          <div className="min-h-40 flex-1">
            <table className="w-full text-sm">
              <colgroup><col className="w-1/4" /><col className="w-1/4" /><col className="w-1/4" /><col className="w-1/4" /></colgroup>
              <thead>
                <tr className="border-b border-slate-100 text-slate-500">
                  <th className="pb-3 text-left font-medium">대회명</th>
                  <th className="pb-3 pr-10 text-center font-medium">기간</th>
                  <th className="pb-3 text-center font-medium">참가자</th>
                  <th className="pb-3 text-center font-medium">상태</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pagedContests.map(contest => (
                  <tr key={contest.id}>
                    <td className="py-3 text-left"><Link to={`/admin/contests/${contest.id}`} className="font-medium text-[#1565C0] hover:underline">{contest.name}</Link></td>
                    <td className="py-3 pr-10 text-center text-slate-600">{contest.period}</td>
                    <td className="py-3 text-center text-slate-600">{contest.participants}</td>
                    <td className="py-3 text-center"><StatusBadge tone={CONTEST_STATUS_TONE[contest.contestStatus]}>{CONTEST_STATUS_LABEL[contest.contestStatus]}</StatusBadge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 flex items-center justify-center gap-1">
              <button onClick={() => setContestPage(1)} disabled={contestPage === 1} className="cursor-pointer rounded p-1 text-slate-400 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30"><ChevronsLeft size={16} /></button>
              <button onClick={() => setContestPage(p => Math.max(1, p - 1))} disabled={contestPage === 1} className="cursor-pointer rounded p-1 text-slate-400 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30"><ChevronLeft size={16} /></button>
              {getPaginationPages(contestPage, totalContestPages).map(page => (
                <button key={page} onClick={() => setContestPage(page)} className={`min-w-7 cursor-pointer rounded px-2 py-1 text-xs font-medium ${contestPage === page ? 'bg-[#1565C0] text-white' : 'text-slate-600 hover:bg-slate-100'}`}>{page}</button>
              ))}
              <button onClick={() => setContestPage(p => Math.min(totalContestPages, p + 1))} disabled={contestPage === totalContestPages} className="cursor-pointer rounded p-1 text-slate-400 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30"><ChevronRight size={16} /></button>
              <button onClick={() => setContestPage(totalContestPages)} disabled={contestPage === totalContestPages} className="cursor-pointer rounded p-1 text-slate-400 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30"><ChevronsRight size={16} /></button>
            </div>
        </Card>

        <Card className="flex flex-col lg:col-span-2">
          <h2 className="mb-4 font-semibold text-slate-900">최근 관리 활동</h2>
          <ul className="min-h-44 flex-1 space-y-3">
            {pagedActivities.map(activity => (
              <li key={activity.id} className="flex items-start gap-3">
                <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${ACTIVITY_DOT_COLOR[activity.activityType] ?? 'bg-slate-400'}`} />
                <div>
                  <p className="text-sm font-medium text-slate-900">{activity.content}</p>
                  <p className="text-xs text-slate-500">{activity.adminId} · {activity.createdAt}</p>
                </div>
              </li>
            ))}
          </ul>

          {totalActivityPages > 1 && (
            <div className="mt-auto flex items-center justify-center gap-1 pt-4">
              <button onClick={() => setActivityPage(1)} disabled={activityPage === 1} className="cursor-pointer rounded p-1 text-slate-400 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30"><ChevronsLeft size={16} /></button>
              <button onClick={() => setActivityPage(p => Math.max(1, p - 1))} disabled={activityPage === 1} className="cursor-pointer rounded p-1 text-slate-400 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30"><ChevronLeft size={16} /></button>
              {getPaginationPages(activityPage, totalActivityPages).map(page => (
                <button key={page} onClick={() => setActivityPage(page)} className={`min-w-7 cursor-pointer rounded px-2 py-1 text-xs font-medium ${activityPage === page ? 'bg-[#1565C0] text-white' : 'text-slate-600 hover:bg-slate-100'}`}>{page}</button>
              ))}
              <button onClick={() => setActivityPage(p => Math.min(totalActivityPages, p + 1))} disabled={activityPage === totalActivityPages} className="cursor-pointer rounded p-1 text-slate-400 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30"><ChevronRight size={16} /></button>
              <button onClick={() => setActivityPage(totalActivityPages)} disabled={activityPage === totalActivityPages} className="cursor-pointer rounded p-1 text-slate-400 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30"><ChevronsRight size={16} /></button>
            </div>
          )}
        </Card>
      </div>
    </div>
    </>
  );
}
