import type { NotificationItem } from '../../types/notification';
import { NotificationCard } from './NotificationCard';

interface NotificationUnreadSectionProps {
  notifications: NotificationItem[];
  onRead: (id: string) => void;
}

export function NotificationUnreadSection({ notifications, onRead }: NotificationUnreadSectionProps) {
  return (
    <section>
      <h2 className="mb-3 text-sm font-extrabold text-[#6C88A4]">
        읽지 않은 알림 ({notifications.length})
      </h2>
      {notifications.length > 0 ? (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              onRead={onRead}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-blue-100 bg-white px-4 py-6 text-center shadow-sm">
          <p className="text-sm font-extrabold text-slate-950">읽지 않은 알림이 없어요</p>
        </div>
      )}
    </section>
  );
}
