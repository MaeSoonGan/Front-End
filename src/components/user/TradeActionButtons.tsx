import type { OrderSide } from '../../types/order';
import { useMaintenanceStatus } from '../../hooks/useMaintenanceStatus';

interface TradeActionButtonsProps {
  onSelectSide: (side: OrderSide) => void;
}

export function TradeActionButtons({ onSelectSide }: TradeActionButtonsProps) {
  const maintenance = useMaintenanceStatus();

  return (
    <section className="sticky bottom-0 z-10 border-t border-blue-100 bg-white/95 px-4 py-3 backdrop-blur">
      <div className="grid grid-cols-2 gap-3">
        <button
          className="h-12 rounded-xl bg-red-500 text-sm font-extrabold text-white shadow-sm transition hover:bg-red-600 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none"
          disabled={maintenance}
          onClick={() => onSelectSide('BUY')}
          type="button"
        >
          매수
        </button>
        <button
          className="h-12 rounded-xl bg-[#1565C0] text-sm font-extrabold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none"
          disabled={maintenance}
          onClick={() => onSelectSide('SELL')}
          type="button"
        >
          매도
        </button>
      </div>
      {maintenance ? (
        <p className="mt-2 text-center text-xs font-bold text-amber-600">
          🔧 점검 중에는 거래할 수 없습니다
        </p>
      ) : null}
    </section>
  );
}
