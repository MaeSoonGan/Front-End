export type NotificationCategory = 'TRADE' | 'CONTEST' | 'MARKET';

export type NotificationSettingKey =
  | 'executionAlert'
  | 'orderCancelAlert'
  | 'pendingOrderAlert'
  | 'contestStartAlert'
  | 'contestEndAlert'
  | 'rankingChangeAlert'
  | 'marketOpenAlert'
  | 'marketCloseAlert';

export interface NotificationSettings {
  executionAlert: boolean;
  orderCancelAlert: boolean;
  pendingOrderAlert: boolean;
  contestStartAlert: boolean;
  contestEndAlert: boolean;
  rankingChangeAlert: boolean;
  marketOpenAlert: boolean;
  marketCloseAlert: boolean;
}

export interface NotificationSettingItem {
  description: string;
  icon: string;
  key: NotificationSettingKey;
  title: string;
}

export type NotificationType =
  | 'EXECUTION'
  | 'ORDER_CANCEL'
  | 'CONTEST'
  | 'NOTICE'
  | 'MARKET_OPEN';

export type NotificationDirection = 'BUY' | 'SELL';

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  direction?: NotificationDirection;
  message: string;
  detail?: string;
  displayTime: string;
  isRead: boolean;
  createdAt: string;
  targetType?: string;
  targetId?: number;
}
