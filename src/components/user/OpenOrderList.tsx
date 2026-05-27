import type { OpenOrderItem } from '../../types/order';
import { OpenOrderCard } from './OpenOrderCard';

interface OpenOrderListProps {
  orders: OpenOrderItem[];
  onCancelOrder: (orderId: string) => void;
}

export function OpenOrderList({ orders, onCancelOrder }: OpenOrderListProps) {
  return (
    <section>
      <h2 className="mb-3 text-base font-extrabold text-slate-950">미체결 주문</h2>
      {orders.length > 0 ? (
        <div className="space-y-2">
          {orders.map((order) => (
            <OpenOrderCard key={order.id} onCancelOrder={onCancelOrder} order={order} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-blue-100 bg-white px-4 py-8 text-center text-xs font-bold text-[#6C88A4] shadow-sm">
          미체결 주문이 없습니다.
        </div>
      )}
    </section>
  );
}
