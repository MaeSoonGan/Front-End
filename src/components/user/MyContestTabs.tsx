import { cn } from '../../utils/cn';

export type MyContestTab = 'ACTIVE' | 'ENDED';

interface MyContestTabsProps {
  activeTab: MyContestTab;
  onChange: (tab: MyContestTab) => void;
}

const tabs: Array<{ label: string; value: MyContestTab }> = [
  { label: '진행중', value: 'ACTIVE' },
  { label: '종료된', value: 'ENDED' },
];

export function MyContestTabs({ activeTab, onChange }: MyContestTabsProps) {
  return (
    <div className="grid grid-cols-2 gap-2 rounded-2xl bg-white p-1 shadow-sm">
      {tabs.map((tab) => (
        <button
          className={cn(
            'h-11 rounded-xl text-sm font-extrabold transition',
            activeTab === tab.value
              ? 'bg-[#1565C0] text-white shadow-sm'
              : 'text-[#6C88A4] hover:bg-[#F0F6FF]',
          )}
          key={tab.value}
          onClick={() => onChange(tab.value)}
          type="button"
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
