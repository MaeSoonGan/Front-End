import { useState } from 'react';
import { PageContainer } from '../../components/common/PageContainer';
import { NotificationSection } from '../../components/user/NotificationSection';
import { NotificationToggleItem } from '../../components/user/NotificationToggleItem';
import {
  contestNotificationItems,
  marketNotificationItems,
  notificationSettingMock,
  tradeNotificationItems,
} from '../../mocks/notificationSettingMock';
import type { NotificationSettingItem, NotificationSettings } from '../../types/notification';

function renderItems(
  items: NotificationSettingItem[],
  settings: NotificationSettings,
  onToggle: (key: NotificationSettingItem['key'], checked: boolean) => void,
) {
  return items.map((item) => (
    <NotificationToggleItem
      checked={settings[item.key]}
      description={item.description}
      icon={item.icon}
      key={item.key}
      onChange={(checked) => onToggle(item.key, checked)}
      title={item.title}
    />
  ));
}

export function NotificationSettingPage() {
  const [settings, setSettings] = useState<NotificationSettings>(notificationSettingMock);

  const handleToggle = (key: NotificationSettingItem['key'], checked: boolean) => {
    // TODO: PATCH /api/members/me/notification-settings 연동 후 서버 상태와 동기화합니다.
    setSettings((current) => ({ ...current, [key]: checked }));
  };

  return (
    <PageContainer className="min-h-full bg-[#F3F7FC] pt-4">
      <section className="mb-4 rounded-2xl border border-blue-100 bg-[#E5F4FF] p-4 shadow-sm">
        <div className="flex gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-base">
            💡
          </span>
          <p className="text-sm font-bold leading-6 text-[#1565C0]">
            알림을 켜두면 체결, 대회, 장 시작 등 중요한 이벤트를 놓치지 않아요
          </p>
        </div>
      </section>

      <div className="space-y-4">
        <NotificationSection title="거래 알림">
          {renderItems(tradeNotificationItems, settings, handleToggle)}
        </NotificationSection>
        <NotificationSection title="대회 알림">
          {renderItems(contestNotificationItems, settings, handleToggle)}
        </NotificationSection>
        <NotificationSection title="시장 알림">
          {renderItems(marketNotificationItems, settings, handleToggle)}
        </NotificationSection>
      </div>
    </PageContainer>
  );
}
