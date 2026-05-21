import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BalanceExecutionHistoryTab } from '../../components/user/BalanceExecutionHistoryTab';
import { BalanceSummaryCard } from '../../components/user/BalanceSummaryCard';
import { BalanceTabs } from '../../components/user/BalanceTabs';
import { BalanceTradeHistoryTab } from '../../components/user/BalanceTradeHistoryTab';
import { HoldingStockCard } from '../../components/user/HoldingStockCard';
import { ProfitTrendChart } from '../../components/user/ProfitTrendChart';
import {
  balanceSummaryMock,
  executionHistoryMock,
  holdingsMock,
  profitTrendMock,
  tradeHistoryMock,
} from '../../mocks/balanceMock';
import type { BalanceTab } from '../../types/balance';

function getInitialTab(tab: string | null): BalanceTab {
  if (tab === 'trades' || tab === 'executions') {
    return tab;
  }

  return 'holdings';
}

export function BalancePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<BalanceTab>(() => getInitialTab(searchParams.get('tab')));

  const handleChangeTab = (tab: BalanceTab) => {
    setActiveTab(tab);
    const nextSearchParams = new URLSearchParams(searchParams);

    if (tab === 'holdings') {
      nextSearchParams.delete('tab');
    } else {
      nextSearchParams.set('tab', tab);
    }

    setSearchParams(nextSearchParams);
  };

  return (
    <div className="min-h-full bg-[#F3F7FC]">
      <div>
        <BalanceTabs activeTab={activeTab} onChangeTab={handleChangeTab} />
      </div>

      {activeTab === 'holdings' ? (
        <section className="space-y-5 px-4 pb-24 pt-4">
          <BalanceSummaryCard summary={balanceSummaryMock} />

          <section>
            <h2 className="mb-3 text-base font-extrabold text-slate-950">보유 종목</h2>
            <div className="space-y-3">
              {holdingsMock.map((holding) => (
                <HoldingStockCard holding={holding} key={holding.stockCode} />
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-base font-extrabold text-slate-950">수익률 추이</h2>
            <ProfitTrendChart points={profitTrendMock} />
          </section>
        </section>
      ) : activeTab === 'trades' ? (
        <BalanceTradeHistoryTab trades={tradeHistoryMock} />
      ) : (
        <BalanceExecutionHistoryTab executions={executionHistoryMock} />
      )}
    </div>
  );
}
