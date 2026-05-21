import type { WatchlistMarketType } from '../../types/watchlist';
import { cn } from '../../utils/cn';

interface WatchlistTabsProps {
  activeMarket: WatchlistMarketType;
  onChangeMarket: (market: WatchlistMarketType) => void;
}

const tabs: Array<{ label: string; value: WatchlistMarketType }> = [
  { label: '국내', value: 'DOMESTIC' },
  { label: '해외', value: 'OVERSEAS' },
];

export function WatchlistTabs({ activeMarket, onChangeMarket }: WatchlistTabsProps) {
  return (
    <div className="inline-grid grid-cols-2 rounded-xl border border-blue-100 bg-white p-1">
      {tabs.map((tab) => {
        const isActive = activeMarket === tab.value;

        return (
          <button
            className={cn(
              'h-8 min-w-16 rounded-lg px-3 text-xs font-extrabold transition',
              isActive ? 'bg-[#1565C0] text-white' : 'text-[#6C88A4] hover:bg-[#F8FBFF]',
            )}
            key={tab.value}
            onClick={() => onChangeMarket(tab.value)}
            type="button"
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
