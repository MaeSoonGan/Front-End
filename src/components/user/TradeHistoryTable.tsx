import type { TradeHistoryItem } from '../../types/stock';
import { TradeHistoryRow } from './TradeHistoryRow';

interface TradeHistoryTableProps {
  trades: TradeHistoryItem[];
}

const headers = ['시간', '체결가', '전일대비', '체결량', '체결강도'];

export function TradeHistoryTable({ trades }: TradeHistoryTableProps) {
  return (
    <section className="mx-4 mt-3 overflow-hidden rounded-xl border border-blue-100 bg-white shadow-sm">
      <div>
        <table className="w-full table-fixed border-collapse">
          <colgroup>
            <col className="w-[22%]" />
            <col className="w-[21%]" />
            <col className="w-[22%]" />
            <col className="w-[15%]" />
            <col className="w-[20%]" />
          </colgroup>
          <thead>
            <tr className="bg-[#F3F7FC] text-center text-[11px] font-extrabold text-[#5F6B7A]">
              {headers.map((header, index) => (
                <th className={cnHeader(index)} key={header}>
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {trades.map((trade) => (
              <TradeHistoryRow key={`${trade.tradeTime}-${trade.quantity}-${trade.strength}`} trade={trade} />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function cnHeader(index: number) {
  return index === 3 ? 'px-1 py-3 text-center' : 'px-1 py-3 text-center';
}
