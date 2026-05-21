import type { OpenOrderItem } from '../../types/order';
import { cn } from '../../utils/cn';

interface OpenOrderCardProps {
  order: OpenOrderItem;
  onCancelOrder: (orderId: string) => void;
}

const statusClassName = {
  PENDING: 'bg-amber-100 text-amber-700',
  PARTIAL: 'bg-sky-100 text-[#1565C0]',
  CANCELLED: 'bg-slate-100 text-slate-500',
};

export function OpenOrderCard({ order, onCancelOrder }: OpenOrderCardProps) {
  const isBuy = order.side === 'BUY';

  return (
    <article className="rounded-xl border border-blue-100 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-extrabold text-slate-950">{order.stockName}</p>
          <p className="mt-1 text-xs font-bold text-[#6C88A4]">
            <span className={isBuy ? 'text-red-500' : 'text-[#1565C0]'}>
              {isBuy ? '매수' : '매도'}
            </span>
            {' · '}
            {order.quantity.toLocaleString('ko-KR')}주 · {order.price.toLocaleString('ko-KR')}원
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn('rounded-full px-2 py-1 text-[10px] font-extrabold', statusClassName[order.status])}>
            {order.status}
          </span>
          <button
            className="h-8 rounded-full bg-red-50 px-3 text-xs font-extrabold text-red-500 transition hover:bg-red-100"
            onClick={() => {
              // TODO: 주문 취소 API 연동 후 서버 상태와 동기화합니다.
              onCancelOrder(order.id);
            }}
            type="button"
          >
            취소
          </button>
        </div>
      </div>
    </article>
  );
}
