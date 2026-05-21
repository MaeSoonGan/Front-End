import type { OrderType } from '../../types/order';
import { cn } from '../../utils/cn';

interface OrderTypeToggleProps {
  orderType: OrderType;
  onChangeOrderType: (orderType: OrderType) => void;
}

const orderTypes: Array<{ label: string; value: OrderType }> = [
  { label: '지정가', value: 'LIMIT' },
  { label: '시장가', value: 'MARKET' },
];

export function OrderTypeToggle({ orderType, onChangeOrderType }: OrderTypeToggleProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {orderTypes.map((type) => {
        const isActive = orderType === type.value;

        return (
          <button
            className={cn(
              'h-10 rounded-xl border text-sm font-extrabold transition',
              isActive
                ? 'border-[#1565C0] bg-[#E5F4FF] text-[#1565C0]'
                : 'border-blue-100 bg-white text-[#6C88A4] hover:bg-[#F8FBFF]',
            )}
            key={type.value}
            onClick={() => onChangeOrderType(type.value)}
            type="button"
          >
            {type.label}
          </button>
        );
      })}
    </div>
  );
}
