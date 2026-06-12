import type { OrderBookData, StockSummary } from '../../types/stock';
import { OrderBookRow } from './OrderBookRow';

interface OrderBookListProps {
  orderBook: OrderBookData;
  summary: StockSummary;
}

function formatPrice(value: number) {
  return value.toLocaleString('ko-KR');
}

export function OrderBookList({ orderBook, summary }: OrderBookListProps) {
  const allQuantities = [...orderBook.askOrders, ...orderBook.bidOrders].map(
    (order) => order.quantity,
  );
  const maxQuantity = Math.max(...allQuantities);
  const changePrefix = summary.changeRate > 0 ? '+' : '';
  const changeArrow = summary.changeRate > 0 ? '▲' : summary.changeRate < 0 ? '▼' : '';

  return (
    <section className="bg-white px-4 py-4">
      <div className="grid grid-cols-3 px-2 pb-2 text-[11px] font-extrabold">
        <span className="text-left text-blue-600">매도 잔량</span>
        <span className="text-center text-[#6C88A4]">가격</span>
        <span className="text-right text-red-500">매수 잔량</span>
      </div>

      <div className="overflow-hidden rounded-xl border border-blue-100">
        {[...orderBook.askOrders].reverse().map((order) => (
          <OrderBookRow
            key={`ask-${order.price}`}
            currentPrice={summary.currentPrice}
            maxQuantity={maxQuantity}
            order={order}
            side="ask"
          />
        ))}

        <div className="mx-2 my-3 rounded-xl bg-[#1565C0] px-4 py-3 text-center text-sm font-extrabold text-white shadow-sm">
          {formatPrice(summary.currentPrice)}
          <span className="ml-2 text-xs text-blue-100">
            {changePrefix}
            {summary.changeRate.toFixed(2)}% {changeArrow}
          </span>
        </div>

        {orderBook.bidOrders.map((order) => (
          <OrderBookRow
            key={`bid-${order.price}`}
            currentPrice={summary.currentPrice}
            maxQuantity={maxQuantity}
            order={order}
            side="bid"
          />
        ))}
      </div>
    </section>
  );
}
