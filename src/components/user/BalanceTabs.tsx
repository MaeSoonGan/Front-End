import type { BalanceTab } from '../../types/balance';
import { cn } from '../../utils/cn';

interface BalanceTabsProps {
  activeTab: BalanceTab;
  onChangeTab: (tab: BalanceTab) => void;
}

const tabs: Array<{ label: string; value: BalanceTab }> = [
  { label: '보유잔고', value: 'holdings' },
  { label: '매매내역', value: 'trades' },
  { label: '체결내역', value: 'executions' },
];

export function BalanceTabs({ activeTab, onChangeTab }: BalanceTabsProps) {
  return (
    <div className="grid grid-cols-3 border-b border-blue-100 bg-white">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.value;

        return (
          <button
            className={cn(
              'h-12 border-b-2 text-sm font-extrabold transition',
              isActive ? 'border-[#1565C0] text-[#1565C0]' : 'border-transparent text-[#8A94A6]',
            )}
            key={tab.value}
            onClick={() => onChangeTab(tab.value)}
            type="button"
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
