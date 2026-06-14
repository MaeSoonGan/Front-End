import { useEffect, useState } from 'react';
import { marketApi } from '../api/user/market';

// 점검 모드 여부를 /api/market/status에서 주기 조회.
// 모듈 레벨로 마지막 값을 캐시하고 폴링을 1개만 돌려서,
// 컴포넌트가 새로 마운트될 때(페이지 진입 등) 마지막 값으로 즉시 시작 → enabled→disabled 깜빡임 방지.
let cachedMaintenance = false;
let polling = false;
const listeners = new Set<(value: boolean) => void>();

function notify(value: boolean) {
  cachedMaintenance = value;
  for (const listener of listeners) {
    listener(value);
  }
}

function startPolling(pollMs: number) {
  if (polling) {
    return;
  }
  polling = true;
  const fetchStatus = () => {
    marketApi
      .getStatus()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then((status: any) => notify(Boolean(status?.maintenance)))
      .catch(() => {});
  };
  fetchStatus();
  window.setInterval(fetchStatus, pollMs);
}

export function useMaintenanceStatus(pollMs = 15000): boolean {
  // 초기값을 캐시에서 가져와 마운트 즉시 올바른 상태로 시작
  const [maintenance, setMaintenance] = useState(cachedMaintenance);

  useEffect(() => {
    startPolling(pollMs);
    const listener = (value: boolean) => setMaintenance(value);
    listeners.add(listener);
    // 구독 직후 최신 캐시 동기화
    setMaintenance(cachedMaintenance);
    return () => {
      listeners.delete(listener);
    };
  }, [pollMs]);

  return maintenance;
}
