import { useNavigate } from 'react-router-dom';

interface TradeActionButtonsProps {
  stockCode: string;
}

export function TradeActionButtons({ stockCode }: TradeActionButtonsProps) {
  const navigate = useNavigate();

  return (
    <section className="sticky bottom-0 z-10 border-t border-blue-100 bg-white/95 px-4 py-3 backdrop-blur">
      <div className="grid grid-cols-2 gap-3">
        <button
          className="h-12 rounded-xl bg-red-500 text-sm font-extrabold text-white shadow-sm transition hover:bg-red-600"
          onClick={() => navigate(`/order?stockCode=${stockCode}&side=BUY`)}
          type="button"
        >
          매수
        </button>
        <button
          className="h-12 rounded-xl bg-[#1565C0] text-sm font-extrabold text-white shadow-sm transition hover:bg-blue-700"
          onClick={() => navigate(`/order?stockCode=${stockCode}&side=SELL`)}
          type="button"
        >
          매도
        </button>
      </div>
    </section>
  );
}
