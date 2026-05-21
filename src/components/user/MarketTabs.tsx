import type { MarketTab } from '../../types/stock';
import { cn } from '../../utils/cn';

interface MarketTabsProps {
  activeTab: MarketTab;
  onChangeTab: (tab: MarketTab) => void;
}

const tabs: Array<{ label: string; value: MarketTab }> = [
  { label: '호가', value: 'orderBook' },
  { label: '차트', value: 'chart' },
  { label: '체결', value: 'trades' },
];

export function MarketTabs({ activeTab, onChangeTab }: MarketTabsProps) {
  return (
    <nav className="sticky top-0 z-10 border-b border-blue-100 bg-white px-4">
      <div className="grid grid-cols-3">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.value;

          return (
            <button
              className={cn(
                'h-11 border-b-2 text-sm font-extrabold transition',
                isActive
                  ? 'border-[#1565C0] text-[#1565C0]'
                  : 'border-transparent text-[#6C88A4] hover:text-[#1565C0]',
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
    </nav>
  );
}
