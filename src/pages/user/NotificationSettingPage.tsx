import { useEffect, useState } from 'react';
import { PageContainer } from '../../components/common/PageContainer';
import { NotificationSection } from '../../components/user/NotificationSection';
import { NotificationToggleItem } from '../../components/user/NotificationToggleItem';
import {
  contestNotificationItems,
  marketNotificationItems,
  tradeNotificationItems,
} from '../../mocks/notificationSettingMock';
import { notificationsApi } from '../../api/user/notifications';
import { parseApiError } from '../../api/parseApiError';
import type {
  NotificationSettingItem,
  NotificationSettingKey,
  NotificationSettings,
} from '../../types/notification';

const EMPTY_SETTINGS: NotificationSettings = {
  executionAlert: false,
  orderCancelAlert: false,
  pendingOrderAlert: false,
  contestStartAlert: false,
  contestEndAlert: false,
  rankingChangeAlert: false,
  marketOpenAlert: false,
  marketCloseAlert: false,
};

// 프론트 설정 키 ↔ 백엔드 필드명 매핑
const KEY_TO_FIELD: Record<NotificationSettingKey, string> = {
  executionAlert: 'tradeComplete',
  orderCancelAlert: 'orderCancel',
  pendingOrderAlert: 'pendingOrder',
  contestStartAlert: 'contestStart',
  contestEndAlert: 'contestEnd',
  rankingChangeAlert: 'rankChange',
  marketOpenAlert: 'marketOpen',
  marketCloseAlert: 'marketClose',
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toSettings(data: any): NotificationSettings {
  return {
    executionAlert: Boolean(data.tradeComplete),
    orderCancelAlert: Boolean(data.orderCancel),
    pendingOrderAlert: Boolean(data.pendingOrder),
    contestStartAlert: Boolean(data.contestStart),
    contestEndAlert: Boolean(data.contestEnd),
    rankingChangeAlert: Boolean(data.rankChange),
    marketOpenAlert: Boolean(data.marketOpen),
    marketCloseAlert: Boolean(data.marketClose),
  };
}

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
  const [settings, setSettings] = useState<NotificationSettings>(EMPTY_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    notificationsApi.getSettings()
      .then((data) => setSettings(toSettings(data)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleToggle = async (key: NotificationSettingItem['key'], checked: boolean) => {
    const previous = settings;
    // 낙관적 업데이트
    setSettings((current) => ({ ...current, [key]: checked }));
    try {
      const data = await notificationsApi.updateSettings({ [KEY_TO_FIELD[key]]: checked });
      setSettings(toSettings(data));
    } catch (e) {
      // 실패 시 롤백
      setSettings(previous);
      console.error(parseApiError(e));
    }
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

      {loading ? (
        <p className="py-12 text-center text-xs font-bold text-[#6C88A4]">불러오는 중...</p>
      ) : (
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
      )}
    </PageContainer>
  );
}
