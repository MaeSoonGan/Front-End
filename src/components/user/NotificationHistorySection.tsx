import type { NotificationItem } from '../../types/notification';
import { NotificationCard } from './NotificationCard';

interface NotificationHistorySectionProps {
  notifications: NotificationItem[];
  onRead: (id: string) => void;
}

export function NotificationHistorySection({ notifications, onRead }: NotificationHistorySectionProps) {
  if (notifications.length === 0) {
    return null;
  }

  return (
    <section>
      <h2 className="mb-3 text-sm font-extrabold text-[#6C88A4]">이전 알림</h2>
      <div className="space-y-3">
        {notifications.map((notification) => (
          <NotificationCard
            key={notification.id}
            notification={notification}
            onRead={onRead}
          />
        ))}
      </div>
    </section>
  );
}
