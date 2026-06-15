import { Card } from '../common/Card';
import type { NotificationItem } from '../../types/notification';
import { cn } from '../../utils/cn';

interface NotificationCardProps {
  notification: NotificationItem;
  onRead: (id: string) => void;
}

const typeIcons: Record<NotificationItem['type'], string> = {
  EXECUTION: '✅',
  ORDER_CANCEL: '❌',
  CONTEST: '🏆',
  NOTICE: '📣',
  MARKET_OPEN: '📈',
  SEED: '💰',
  MAINTENANCE: '🔧',
};

const directionText = {
  BUY: '매수',
  SELL: '매도',
} as const;

const directionClasses = {
  BUY: 'bg-red-50 text-red-500',
  SELL: 'bg-blue-50 text-blue-600',
} as const;

export function NotificationCard({ notification, onRead }: NotificationCardProps) {
  return (
    <button
      className="block w-full text-left"
      onClick={() => {
        // TODO: 알림 상세 이동 및 읽음 처리 API 연동 후 서버 상태와 동기화합니다.
        onRead(notification.id);
      }}
      type="button"
    >
      <Card
        className={cn(
          'rounded-2xl border-blue-100 px-4 py-4',
          notification.isRead ? 'bg-white' : 'bg-[#E5F4FF]',
        )}
      >
        <div className="flex items-start gap-3">
          <span
            className={cn(
              'flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-lg',
              notification.isRead ? 'bg-[#F0F6FF] opacity-70' : 'bg-white',
            )}
          >
            {typeIcons[notification.type]}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex min-w-0 items-center gap-2">
                  <p className="truncate text-sm font-extrabold text-slate-950">
                    {notification.title}
                  </p>
                  {notification.direction ? (
                    <span
                      className={cn(
                        'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-extrabold',
                        directionClasses[notification.direction],
                      )}
                    >
                      {directionText[notification.direction]}
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 whitespace-pre-line text-sm font-bold text-slate-800">{notification.message}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="text-[11px] font-bold text-[#6C88A4]">
                  {notification.displayTime}
                </span>
                {!notification.isRead ? (
                  <span className="h-2 w-2 rounded-full bg-[#1565C0]" />
                ) : null}
              </div>
            </div>
            {notification.detail ? (
              <p className="mt-2 text-xs font-bold text-[#6C88A4]">{notification.detail}</p>
            ) : null}
          </div>
        </div>
      </Card>
    </button>
  );
}
