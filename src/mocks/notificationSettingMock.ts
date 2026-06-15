import type { NotificationSettingItem, NotificationSettings } from '../types/notification';

export const notificationSettingMock: NotificationSettings = {
  executionAlert: true,
  orderCancelAlert: true,
  pendingOrderAlert: false,
  contestStartAlert: true,
  contestEndAlert: true,
  rankingChangeAlert: false,
  marketOpenAlert: false,
  marketCloseAlert: false,
};

export const tradeNotificationItems: NotificationSettingItem[] = [
  {
    key: 'executionAlert',
    icon: '✅',
    title: '체결 완료 알림',
    description: '주문이 체결됐을 때 알려드려요',
  },
  {
    key: 'orderCancelAlert',
    icon: '❌',
    title: '주문 취소 알림',
    description: '주문이 취소됐을 때 알려드려요',
  },
  {
    key: 'pendingOrderAlert',
    icon: '⚠️',
    title: '미체결 주문 알림',
    description: '미체결 주문이 있을 때 알려드려요',
  },
];

export const contestNotificationItems: NotificationSettingItem[] = [
  {
    key: 'contestStartAlert',
    icon: '🏆',
    title: '대회 시작 알림',
    description: '참여 중인 대회 시작 30분 전 알려드려요',
  },
  {
    key: 'contestEndAlert',
    icon: '🏁',
    title: '대회 종료 알림',
    description: '대회 종료 30분 전 알려드려요',
  },
  {
    key: 'rankingChangeAlert',
    icon: '📊',
    title: '순위 변동 알림',
    description: '내 순위가 크게 변동될 때 알려드려요',
  },
];

export const marketNotificationItems: NotificationSettingItem[] = [
  {
    key: 'marketOpenAlert',
    icon: '🔔',
    title: '장 시작 알림',
    description: '장 시작 30분 전(오전 8시 30분) 알려드려요',
  },
  {
    key: 'marketCloseAlert',
    icon: '📣',
    title: '장 마감 알림',
    description: '장 마감 30분 전(오후 3시) 알려드려요',
  },
];
