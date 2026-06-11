import { useEffect, useState } from 'react';
import { useRealtimeRecovery } from '../../hooks/useMarketSocket';

/**
 * 실시간 시세 복구(한도 초과 → KIS 재연결) 중 전체 화면 로딩 모달.
 * 백엔드가 보내는 REALTIME_STATUS(recovering) 신호로 표시/해제된다.
 */
export function RealtimeRecoveryModal() {
  const recovering = useRealtimeRecovery();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (recovering) {
      setVisible(true);
      // 안전장치: 복구완료 신호를 못 받아도 일정 시간 후 자동 닫기
      const timer = window.setTimeout(() => setVisible(false), 12000);
      return () => window.clearTimeout(timer);
    }
    setVisible(false);
  }, [recovering]);

  if (!visible) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40">
      <div className="flex flex-col items-center gap-3 rounded-2xl bg-white px-8 py-7 shadow-xl">
        <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-[#1565C0] border-t-transparent" />
        <p className="text-sm font-extrabold text-slate-900">실시간 시세 복구 중...</p>
        <p className="text-xs font-bold text-[#6C88A4]">구독 한도를 초기화하고 있어요. 잠시만 기다려주세요.</p>
      </div>
    </div>
  );
}
