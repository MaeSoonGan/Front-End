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
