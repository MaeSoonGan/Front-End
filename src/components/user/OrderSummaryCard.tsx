interface OrderSummaryCardProps {
  availableBalance: number;
  estimatedAmount: number;
  fee: number;
  holdingQuantity: number;
}

function formatWon(value: number) {
  return `${Math.round(value).toLocaleString('ko-KR')}원`;
}

export function OrderSummaryCard({
  availableBalance,
  estimatedAmount,
  fee,
  holdingQuantity,
}: OrderSummaryCardProps) {
  return (
    <section className="rounded-xl border border-blue-100 bg-white p-4 shadow-sm">
      <div className="space-y-3 text-xs font-extrabold">
        <div className="flex items-center justify-between">
          <span className="text-[#6C88A4]">예상 체결 금액</span>
          <span className="text-slate-950">{formatWon(estimatedAmount)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[#6C88A4]">수수료</span>
          <span className="text-slate-950">{formatWon(fee)}</span>
        </div>
        <div className="border-t border-slate-100 pt-3">
          <div className="flex items-center justify-between">
            <span className="text-[#6C88A4]">주문 가능 금액</span>
            <span className="text-[#1565C0]">{formatWon(availableBalance)}</span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-[#6C88A4]">보유 수량</span>
            <span className="text-slate-950">{holdingQuantity.toLocaleString('ko-KR')}주</span>
          </div>
        </div>
      </div>
    </section>
  );
}
