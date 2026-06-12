import { useMaintenanceStatus } from '../../hooks/useMaintenanceStatus';

// 점검 모드 기간 동안 상단에 빨간 배너 노출. 점검 OFF면 아무것도 렌더하지 않음.
export function MaintenanceBanner() {
  const maintenance = useMaintenanceStatus();

  if (!maintenance) {
    return null;
  }

  return (
    <div className="flex items-center justify-center gap-2 bg-red-600 px-4 py-2 text-center text-xs font-extrabold text-white">
      <span>🔧 시스템 점검 중입니다. 주문 등 일부 기능이 제한됩니다.</span>
    </div>
  );
}
