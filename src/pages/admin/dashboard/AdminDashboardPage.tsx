import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

// ---- Types ----

type AlertType = 'ABNORMAL_ORDER' | 'DUPLICATE_ORDER';
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

// ---- Mock Data (GET /api/admin/dashboard 등 연동 전 임시 데이터) ----

const MOCK_STATS: DashboardStats = {
  totalMembers: 3234,
  todayNewMembers: 12,
  todayOrders: 4821,
  todayCompletedOrders: 3214,
  activeContestCount: 2,
  totalParticipants: 323,
  anomalyCount: 2,
};

const MOCK_ALERTS: AlertItem[] = [
  {
    id: 'alert-1',
    memberId: 'member-101',
    alertType: 'ABNORMAL_ORDER',
    memberName: '이영희',
    description: '3분 내 50건 주문 (임계치 30건 초과) · 14:28',
  },
  {
    id: 'alert-2',
    memberId: 'member-202',
    orderId: 'order-303',
    alertType: 'DUPLICATE_ORDER',
    memberName: '박민준',
    description: '동일 종목 동일가 5회 반복 · 13:55',
  },
];

const MOCK_DAILY_ORDERS: DailyOrderStat[] = [
  { date: '5/2', count: 3540, isToday: false, fill: '#3b82f6' },
  { date: '5/3', count: 3820, isToday: false, fill: '#3b82f6' },
  { date: '5/4', count: 3214, isToday: false, fill: '#3b82f6' },
  { date: '5/5', count: 4320, isToday: false, fill: '#3b82f6' },
  { date: '5/6', count: 4012, isToday: false, fill: '#3b82f6' },
  { date: '5/7', count: 4721, isToday: false, fill: '#3b82f6' },
  { date: '오늘', count: 4821, isToday: true, fill: '#ef4444' },
];

const MOCK_CONTESTS: ContestItem[] = [
  {
    id: 'contest-1',
    name: '5월 정기 대회',
    period: '05.01–05.31',
    participants: '234명',
    contestStatus: 'ACTIVE',
  },
  {
    id: 'contest-2',
    name: '반도체 특별전',
    period: '05.05–05.20',
    participants: '89/100명',
    contestStatus: 'CLOSING_SOON',
  },
];

const MOCK_ACTIVITIES: ActivityItem[] = [
  {
    id: 'act-1',
    content: '이영희 계정 정지',
    adminId: 'admin01',
    createdAt: '오늘 14:32',
    activityType: 'SUSPEND',
  },
  {
    id: 'act-2',
    content: '홍길동 시드 +100만원',
    adminId: 'admin01',
    createdAt: '오늘 11:15',
    activityType: 'SEED',
  },
  {
    id: 'act-3',
    content: '5월 정기 대회 생성',
    adminId: 'admin01',
    createdAt: '25.05.01',
    activityType: 'CONTEST',
  },
  {
    id: 'act-4',
    content: '박민준 주문 강제 취소',
    adminId: 'admin02',
    createdAt: '25.05.06',
    activityType: 'ORDER_CANCEL',
  },
];

// ---- Lookup Maps ----

const ALERT_TYPE_LABEL: Record<AlertType, string> = {
  ABNORMAL_ORDER: '비정상 주문 탐지',
  DUPLICATE_ORDER: '중복 주문 탐지',
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

// ---- Page ----

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState<AlertItem[]>(MOCK_ALERTS);
  const [lastUpdated, setLastUpdated] = useState(() => formatDateTime(new Date()));
  const [isRefreshing, setIsRefreshing] = useState(false);

  const isSystemNormal = alerts.length === 0;

  function formatDateTime(date: Date): string {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const hh = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    return `${yyyy}.${mm}.${dd} ${hh}:${min}`;
  }

  function handleRefresh() {
    // GET /api/admin/dashboard
    setIsRefreshing(true);
    setTimeout(() => {
      setLastUpdated(formatDateTime(new Date()));
      setIsRefreshing(false);
    }, 500);
  }

  function handleSuspend(memberId: string) {
    // POST /api/admin/members/{memberId}/suspend
    setAlerts(prev => prev.filter(a => a.memberId !== memberId));
  }

  function handleCancelOrder(orderId: string) {
    // POST /api/admin/orders/{orderId}/cancel
    setAlerts(prev => prev.filter(a => a.orderId !== orderId));
  }

  function handleDismiss(alertId: string) {
    setAlerts(prev => prev.filter(a => a.id !== alertId));
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-950">대시보드</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-500">{lastUpdated} 기준</span>
          <Button variant="secondary" onClick={handleRefresh} disabled={isRefreshing}>
            {isRefreshing ? '로딩 중...' : '↻ 새로고침'}
          </Button>
        </div>
      </div>

      {/* 통계 카드 4종 */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {/* GET /api/admin/members/count */}
        <Card>
          <p className="text-sm font-medium text-slate-500">전체 회원</p>
          <p className="mt-2 text-3xl font-bold text-slate-950">
            {MOCK_STATS.totalMembers.toLocaleString()}명
          </p>
          <p className="mt-1 text-sm text-slate-500">
            오늘 기입{' '}
            <span className="font-medium text-emerald-600">
              +{MOCK_STATS.todayNewMembers}명
            </span>
          </p>
        </Card>

        {/* GET /api/admin/orders/today */}
        <Card>
          <p className="text-sm font-medium text-slate-500">오늘 주문</p>
          <p className="mt-2 text-3xl font-bold text-slate-950">
            {MOCK_STATS.todayOrders.toLocaleString()}건
          </p>
          <p className="mt-1 text-sm text-slate-500">
            체결{' '}
            <span className="font-medium text-slate-700">
              {MOCK_STATS.todayCompletedOrders.toLocaleString()}건
            </span>
          </p>
        </Card>

        {/* GET /api/admin/contests/active */}
        <Card>
          <p className="text-sm font-medium text-slate-500">진행 중 대회</p>
          <p className="mt-2 text-3xl font-bold text-slate-950">
            {MOCK_STATS.activeContestCount}개
          </p>
          <p className="mt-1 text-sm text-slate-500">
            참가자{' '}
            <span className="font-medium text-slate-700">
              {MOCK_STATS.totalParticipants}명
            </span>
          </p>
        </Card>

        {/* GET /api/admin/monitoring/alerts — 클릭 시 모니터링 이동 */}
        <Card
          className="cursor-pointer transition-shadow hover:shadow-md"
          onClick={() => navigate('/admin/system')}
        >
          <p className="text-sm font-medium text-slate-500">비정상 탐지</p>
          <p className="mt-2 text-3xl font-bold text-rose-600">
            {MOCK_STATS.anomalyCount}건
          </p>
          <p className="mt-1 text-sm font-medium text-rose-500">즉시 처리 필요</p>
        </Card>
      </div>

      {/* 중간 행: 알림 + 차트 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* 알림 — GET /api/admin/monitoring/alerts */}
        <Card className="lg:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">알림 — 즉시 처리 필요</h2>
            {alerts.length > 0 && (
              <span className="text-sm text-slate-500">미처리 {alerts.length}건</span>
            )}
          </div>

          <div className="space-y-3">
            {alerts.map(alert => (
              <div
                key={alert.id}
                className="flex items-start justify-between rounded-lg border border-rose-200 bg-rose-50 p-4"
              >
                <div>
                  <p className="font-medium text-rose-800">
                    {ALERT_TYPE_LABEL[alert.alertType]} — {alert.memberName}
                  </p>
                  <p className="mt-0.5 text-sm text-rose-600">{alert.description}</p>
                </div>
                <div className="ml-4 flex shrink-0 gap-2">
                  {alert.alertType === 'ABNORMAL_ORDER' && (
                    <Button
                      variant="secondary"
                      className="h-8 px-3 text-xs"
                      onClick={() => handleSuspend(alert.memberId)}
                    >
                      계정 정지
                    </Button>
                  )}
                  {alert.alertType === 'DUPLICATE_ORDER' && alert.orderId && (
                    <Button
                      variant="secondary"
                      className="h-8 px-3 text-xs"
                      onClick={() => handleCancelOrder(alert.orderId!)}
                    >
                      주문 취소
                    </Button>
                  )}
                  <Button
                    variant="secondary"
                    className="h-8 px-3 text-xs"
                    onClick={() => handleDismiss(alert.id)}
                  >
                    무시
                  </Button>
                </div>
              </div>
            ))}

            {isSystemNormal && (
              <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                <div>
                  <p className="font-medium text-emerald-800">시스템 정상 운영 중</p>
                  <p className="text-sm text-emerald-600">
                    체결 엔진, DB, 시세 서비스 모두 정상
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* 일별 주문 건수 차트 — GET /api/admin/orders/daily?days=7 */}
        <Card className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">일별 주문 건수</h2>
            <span className="text-sm text-slate-500">최근 7일</span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              layout="vertical"
              data={MOCK_DAILY_ORDERS}
              margin={{ top: 0, right: 52, bottom: 0, left: 0 }}
            >
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="date"
                width={36}
                tick={{ fontSize: 12, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                <LabelList
                  dataKey="count"
                  position="right"
                  style={{ fontSize: 11, fill: '#475569' }}
                  formatter={(v: unknown) => Number(v).toLocaleString()}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* 하단 행: 대회 목록 + 최근 활동 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* 진행 중인 대회 — GET /api/admin/contests?status=ACTIVE */}
        <Card className="lg:col-span-3">
          <h2 className="mb-4 font-semibold text-slate-900">진행 중인 대회</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-slate-500">
                <th className="pb-3 font-medium">대회명</th>
                <th className="pb-3 font-medium">기간</th>
                <th className="pb-3 font-medium">참가자</th>
                <th className="pb-3 font-medium">상태</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {MOCK_CONTESTS.map(contest => (
                <tr key={contest.id}>
                  <td className="py-3 font-medium text-slate-900">{contest.name}</td>
                  <td className="py-3 text-slate-600">{contest.period}</td>
                  <td className="py-3 text-slate-600">{contest.participants}</td>
                  <td className="py-3">
                    <StatusBadge tone={CONTEST_STATUS_TONE[contest.contestStatus]}>
                      {CONTEST_STATUS_LABEL[contest.contestStatus]}
                    </StatusBadge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        {/* 최근 관리 활동 — GET /api/admin/audit-log?limit=5 */}
        <Card className="lg:col-span-2">
          <h2 className="mb-4 font-semibold text-slate-900">최근 관리 활동</h2>
          <ul className="space-y-4">
            {MOCK_ACTIVITIES.map(activity => (
              <li key={activity.id} className="flex items-start gap-3">
                <span
                  className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${ACTIVITY_DOT_COLOR[activity.activityType]}`}
                />
                <div>
                  <p className="text-sm font-medium text-slate-900">{activity.content}</p>
                  <p className="text-xs text-slate-500">
                    {activity.adminId} · {activity.createdAt}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
