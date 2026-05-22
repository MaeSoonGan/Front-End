import { useMemo, useState } from 'react';
import { Button } from '../../components/common/Button';
import { PageContainer } from '../../components/common/PageContainer';
import { NotificationHistorySection } from '../../components/user/NotificationHistorySection';
import { NotificationUnreadSection } from '../../components/user/NotificationUnreadSection';
import { notificationMocks } from '../../mocks/notificationMock';

const INITIAL_VISIBLE_COUNT = 6;
const LOAD_MORE_COUNT = 2;

export function NotificationListPage() {
  const [notifications, setNotifications] = useState(notificationMocks);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);
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
    setNotifications((currentNotifications) =>
      currentNotifications.map((notification) =>
        notification.id === id ? { ...notification, isRead: true } : notification,
      ),
    );
  };

  const handleReadAll = () => {
    // TODO: 알림 모두 읽음 처리 API 연동 후 서버 상태와 동기화합니다.
    setNotifications((currentNotifications) =>
      currentNotifications.map((notification) => ({ ...notification, isRead: true })),
    );
  };

  const handleLoadMore = () => {
    // TODO: 알림 목록 페이지네이션 API 연동 후 다음 page를 조회합니다.
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
    </PageContainer>
  );
}
