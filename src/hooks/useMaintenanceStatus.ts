import { useEffect, useState } from 'react';
import { marketApi } from '../api/user/market';

// 점검 모드 여부를 /api/market/status에서 주기적으로 조회.
// 점검 모드 ON이면 매수/매도 등 거래 동작을 막는 데 사용.
export function useMaintenanceStatus(pollMs = 15000): boolean {
  const [maintenance, setMaintenance] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fetchStatus = () => {
      marketApi
        .getStatus()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .then((status: any) => {
          if (!cancelled) setMaintenance(Boolean(status?.maintenance));
        })
        .catch(() => {});
    };
    fetchStatus();
    const timer = window.setInterval(fetchStatus, pollMs);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [pollMs]);

  return maintenance;
}
