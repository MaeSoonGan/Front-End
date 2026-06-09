import type { ExecutionHistoryItem } from '../../types/balance';

interface ExecutionItemCardProps {
  execution: ExecutionHistoryItem;
  onCancelExecution: (id: string) => void;
}

const statusLabel = {
  FILLED: '체결완료',
  PARTIAL: '부분체결',
  OPEN: '미체결',
  CANCELLED: '취소',
};

function formatWon(value: number) {
  return `${value.toLocaleString('ko-KR')}원`;
}

export function ExecutionItemCard({ execution, onCancelExecution }: ExecutionItemCardProps) {
  const isBuy = execution.side === 'BUY';
  const canCancel = execution.status !== 'CANCELLED' && execution.remainingQuantity > 0;

  return (
    <article className="rounded-xl border border-blue-100 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-extrabold text-slate-950">{execution.stockName}</p>
          <p className="mt-1 text-xs font-bold text-[#6C88A4]">
            <span className={isBuy ? 'text-red-500' : 'text-[#1565C0]'}>{isBuy ? '매수' : '매도'}</span>
            {' · '}
            {execution.orderType} · {execution.orderedAt}
          </p>
        </div>
        <span
          className={`rounded-full px-2 py-1 text-[10px] font-extrabold ${
            execution.status === 'CANCELLED'
              ? 'bg-red-100 text-red-500'
              : 'bg-[#E8F0FA] text-[#1565C0]'
          }`}
        >
          {statusLabel[execution.status]}
        </span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-bold text-[#6C88A4]">
        <p>주문가격 {formatWon(execution.orderPrice)}</p>
        <p>주문수량 {execution.orderQuantity}주</p>
        <p>체결수량 {execution.filledQuantity}주</p>
        <p>미체결 {execution.remainingQuantity}주</p>
        <p>주문번호 {execution.orderNumber}</p>
      </div>
      {canCancel ? (
        <button
          className="mt-3 h-9 w-full rounded-xl bg-red-50 text-xs font-extrabold text-red-500 transition hover:bg-red-100"
          onClick={() => {
            // TODO: 주문 취소 API 연동 후 서버 상태와 동기화합니다.
            onCancelExecution(execution.id);
          }}
          type="button"
        >
          주문 취소
        </button>
      ) : null}
    </article>
  );
}
