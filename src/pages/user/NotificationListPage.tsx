import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { PageContainer } from '../../components/common/PageContainer';
import { NotificationHistorySection } from '../../components/user/NotificationHistorySection';
import { NotificationUnreadSection } from '../../components/user/NotificationUnreadSection';
import { notificationsApi } from '../../api/user/notifications';
import type { NotificationDirection, NotificationItem, NotificationType } from '../../types/notification';

const INITIAL_VISIBLE_COUNT = 6;
const LOAD_MORE_COUNT = 4;

// 백엔드 type(varchar) → 화면 type/방향 매핑
function resolveType(rawType: string): { type: NotificationType; direction?: NotificationDirection } {
  const t = (rawType ?? '').toUpperCase();
  const direction: NotificationDirection | undefined = t.includes('BUY')
    ? 'BUY'
    : t.includes('SELL')
      ? 'SELL'
      : undefined;
  if (t.includes('CANCEL')) return { type: 'ORDER_CANCEL', direction };
  if (t.includes('CONTEST') || t.includes('RANK')) return { type: 'CONTEST' };
  if (t.includes('MARKET')) return { type: 'MARKET_OPEN' };
  if (t.includes('NOTICE')) return { type: 'NOTICE' };
  if (t.includes('TRADE') || t.includes('FILL') || t.includes('EXEC') || t.includes('ORDER') || t.includes('PENDING')) {
    return { type: 'EXECUTION', direction };
  }
  return { type: 'NOTICE' };
}

// createdAt → 상대시간 표시
function toDisplayTime(iso: string): string {
  if (!iso) return '';
  const diffMs = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return '방금 전';
  if (min < 60) return `${min}분 전`;
  const hour = Math.floor(min / 60);
  if (hour < 24) return `${hour}시간 전`;
  const day = Math.floor(hour / 24);
  if (day < 30) return `${day}일 전`;
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toNotificationItem(n: any): NotificationItem {
  const { type, direction } = resolveType(n.type);
  return {
    id: String(n.notificationId),
    type,
    title: n.title ?? '',
    direction,
    message: n.body ?? '',
    displayTime: toDisplayTime(n.createdAt),
    isRead: Boolean(n.isRead),
    createdAt: n.createdAt ?? '',
    targetType: n.targetType ?? undefined,
    targetId: n.targetId != null ? Number(n.targetId) : undefined,
  };
}

// 알림 클릭 시 이동 경로 (targetId 있으면 상세, 없으면 목록)
function resolvePath(n: NotificationItem): string | null {
  switch (n.type) {
    case 'EXECUTION':
    case 'ORDER_CANCEL':
      return '/executions';
    case 'CONTEST':
      return n.targetId ? `/contests/${n.targetId}` : '/my-contests';
    case 'NOTICE':
      return n.targetId ? `/notices/${n.targetId}` : '/notices';
    default:
      return null;
  }
}

export function NotificationListPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    notificationsApi
      .getNotifications()
      .then((data) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setNotifications(((data?.items ?? []) as any[]).map(toNotificationItem));
      })
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false));
  }, []);

  const visibleNotifications = notifications.slice(0, visibleCount);
  const unreadNotifications = useMemo(
    () => visibleNotifications.filter((notification) => !notification.isRead),
    [visibleNotifications],
  );
  const readNotifications = useMemo(
    () => visibleNotifications.filter((notification) => notification.isRead),
    [visibleNotifications],
  );
  const totalUnreadCount = notifications.filter((notification) => !notification.isRead).length;
  const hasMore = visibleCount < notifications.length;

  const handleReadNotification = (id: string) => {
    const target = notifications.find((notification) => notification.id === id);
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id ? { ...notification, isRead: true } : notification,
      ),
    );
    notificationsApi.markRead(Number(id)).catch(() => {});
    // 알림 종류에 따라 해당 화면으로 이동 (이동 대상 없는 종류는 읽음 처리만)
    if (target) {
      const path = resolvePath(target);
      if (path) navigate(path);
    }
  };

  const handleReadAll = () => {
    setNotifications((current) => current.map((notification) => ({ ...notification, isRead: true })));
    notificationsApi.markAllRead().catch(() => {});
  };

  const handleLoadMore = () => {
    setVisibleCount((currentCount) =>
      Math.min(currentCount + LOAD_MORE_COUNT, notifications.length),
    );
  };

  return (
    <PageContainer className="min-h-full bg-[#F3F7FC] pt-3">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-sm font-extrabold text-[#6C88A4]">읽지 않은 알림 {totalUnreadCount}개</h1>
        <button
          className="text-xs font-extrabold text-[#1565C0] disabled:text-[#A3B4C6]"
          disabled={totalUnreadCount === 0}
          onClick={handleReadAll}
          type="button"
        >
          모두 읽음
        </button>
      </div>

      {loading && notifications.length === 0 ? (
        <p className="py-16 text-center text-xs font-bold text-[#6C88A4]">불러오는 중...</p>
      ) : notifications.length === 0 ? (
        <p className="py-16 text-center text-xs font-bold text-[#A3B4C6]">알림이 없습니다.</p>
      ) : (
        <div className="space-y-5">
          <NotificationUnreadSection
            notifications={unreadNotifications}
            onRead={handleReadNotification}
          />
          <NotificationHistorySection
            notifications={readNotifications}
            onRead={handleReadNotification}
          />

          {hasMore ? (
            <Button
              className="h-11 w-full rounded-xl border-blue-100 text-sm font-extrabold text-[#1565C0]"
              onClick={handleLoadMore}
              variant="secondary"
            >
              더보기
            </Button>
          ) : null}

          <p className="pb-4 pt-2 text-center text-xs font-bold text-[#6C88A4]">
            최근 30일 알림만 표시됩니다
          </p>
        </div>
      )}
    </PageContainer>
  );
}
