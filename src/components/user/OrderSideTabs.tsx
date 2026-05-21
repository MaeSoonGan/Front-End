import type { OrderSide } from '../../types/order';
import { cn } from '../../utils/cn';

interface OrderSideTabsProps {
  activeSide: OrderSide;
  onChangeSide: (side: OrderSide) => void;
}

const sides: Array<{ label: string; value: OrderSide }> = [
  { label: '매수', value: 'BUY' },
  { label: '매도', value: 'SELL' },
];

export function OrderSideTabs({ activeSide, onChangeSide }: OrderSideTabsProps) {
  return (
    <div className="grid grid-cols-2 gap-2 rounded-xl border border-blue-100 bg-[#F0F6FF] p-1">
      {sides.map((side) => {
        const isActive = activeSide === side.value;

        return (
          <button
            className={cn(
              'h-10 rounded-lg text-sm font-extrabold transition',
              isActive && side.value === 'BUY' && 'bg-red-500 text-white shadow-sm',
              isActive && side.value === 'SELL' && 'bg-[#1565C0] text-white shadow-sm',
              !isActive && 'text-[#6C88A4] hover:bg-white/70',
            )}
            key={side.value}
            onClick={() => onChangeSide(side.value)}
            type="button"
          >
            {side.label}
          </button>
        );
      })}
    </div>
  );
}
