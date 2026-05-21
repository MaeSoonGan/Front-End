import type { OrderFormState } from '../../types/order';
import { cn } from '../../utils/cn';

interface OrderAmountFormProps {
  errorMessage?: string;
  formState: OrderFormState;
  onChangePrice: (price: string) => void;
  onChangeQuantity: (quantity: string) => void;
}

function sanitizeNumber(value: string) {
  return value.replace(/\D/g, '');
}

function formatInputNumber(value: string) {
  const numericValue = sanitizeNumber(value);

  return numericValue ? Number(numericValue).toLocaleString('ko-KR') : '';
}

export function OrderAmountForm({
  errorMessage,
  formState,
  onChangePrice,
  onChangeQuantity,
}: OrderAmountFormProps) {
  const isMarketOrder = formState.orderType === 'MARKET';

  return (
    <section className="space-y-3">
      <label className="block">
        <span className="text-xs font-extrabold text-[#6C88A4]">주문 수량</span>
        <div className="mt-2 flex h-11 items-center rounded-xl border border-blue-100 bg-white px-3">
          <input
            className="min-w-0 flex-1 bg-transparent text-sm font-bold text-slate-950 outline-none placeholder:text-[#A3B4C6]"
            inputMode="numeric"
            onChange={(event) => onChangeQuantity(sanitizeNumber(event.target.value))}
            placeholder="0 주"
            value={formState.quantity}
          />
          <span className="text-xs font-bold text-[#6C88A4]">주</span>
        </div>
      </label>

      <label className="block">
        <span className="text-xs font-extrabold text-[#6C88A4]">주문 가격</span>
        <div
          className={cn(
            'mt-2 flex h-11 items-center rounded-xl border border-blue-100 px-3',
            isMarketOrder ? 'bg-slate-100 text-[#A3B4C6]' : 'bg-white',
          )}
        >
          <input
            className="min-w-0 flex-1 bg-transparent text-sm font-bold text-slate-950 outline-none disabled:text-[#A3B4C6]"
            disabled={isMarketOrder}
            inputMode="numeric"
            onChange={(event) => onChangePrice(sanitizeNumber(event.target.value))}
            placeholder="0"
            value={formatInputNumber(formState.price)}
          />
          <span className="text-xs font-bold text-[#6C88A4]">원</span>
        </div>
      </label>

      {errorMessage ? (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-xs font-extrabold text-red-500">
          {errorMessage}
        </p>
      ) : null}
    </section>
  );
}
