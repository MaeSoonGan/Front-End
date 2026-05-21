import type { OrderBookItem } from '../../types/stock';
import { cn } from '../../utils/cn';

interface OrderBookRowProps {
  order: OrderBookItem;
  side: 'ask' | 'bid';
  maxQuantity: number;
}

function formatPrice(value: number) {
  return value.toLocaleString('ko-KR');
}

export function OrderBookRow({ order, side, maxQuantity }: OrderBookRowProps) {
  const barWidth = `${Math.max((order.quantity / maxQuantity) * 100, 8)}%`;
  const isAsk = side === 'ask';
  const changePrefix = order.changeRate > 0 ? '+' : '';

  return (
    <div className="relative grid min-h-12 grid-cols-3 items-center overflow-hidden border-b border-slate-100 bg-white px-2">
      <div
        className={cn(
          'absolute inset-y-2 rounded-lg',
          isAsk ? 'left-2 bg-blue-100/70' : 'right-2 bg-red-100/70',
        )}
        style={{ width: barWidth }}
      />
      <div className="relative z-[1] pl-[5px] text-left text-xs font-bold text-[#6C88A4]">
        {isAsk ? formatPrice(order.quantity) : ''}
      </div>
      <div className="relative z-[1] text-center">
        <p className={cn('text-sm font-extrabold', isAsk ? 'text-blue-600' : 'text-red-500')}>
          {formatPrice(order.price)}
        </p>
        <p className={cn('text-[10px] font-bold', isAsk ? 'text-blue-500' : 'text-red-400')}>
          {changePrefix}
          {order.changeRate.toFixed(2)}%
        </p>
      </div>
      <div className="relative z-[1] pr-[5px] text-right text-xs font-bold text-[#6C88A4]">
        {isAsk ? '' : formatPrice(order.quantity)}
      </div>
    </div>
  );
}
