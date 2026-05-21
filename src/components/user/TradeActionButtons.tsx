import type { OrderSide } from '../../types/order';

interface TradeActionButtonsProps {
  onSelectSide: (side: OrderSide) => void;
}

export function TradeActionButtons({ onSelectSide }: TradeActionButtonsProps) {
  return (
    <section className="sticky bottom-0 z-10 border-t border-blue-100 bg-white/95 px-4 py-3 backdrop-blur">
      <div className="grid grid-cols-2 gap-3">
        <button
          className="h-12 rounded-xl bg-red-500 text-sm font-extrabold text-white shadow-sm transition hover:bg-red-600"
          onClick={() => onSelectSide('BUY')}
          type="button"
        >
          매수
        </button>
        <button
          className="h-12 rounded-xl bg-[#1565C0] text-sm font-extrabold text-white shadow-sm transition hover:bg-blue-700"
          onClick={() => onSelectSide('SELL')}
          type="button"
        >
          매도
        </button>
      </div>
    </section>
  );
}
