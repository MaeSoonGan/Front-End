import { useMemo, useState } from 'react';
import type { ExecutionFilterType, ExecutionHistoryItem } from '../../types/balance';
import { ExecutionFilterTabs } from './ExecutionFilterTabs';
import { ExecutionItemCard } from './ExecutionItemCard';

interface BalanceExecutionHistoryTabProps {
  executions: ExecutionHistoryItem[];
}

export function BalanceExecutionHistoryTab({ executions }: BalanceExecutionHistoryTabProps) {
  const [filter, setFilter] = useState<ExecutionFilterType>('ALL');
  const [executionItems, setExecutionItems] = useState(executions);
  const [searchDate, setSearchDate] = useState('2026-05-21');
  const filteredExecutions = useMemo(
    () =>
      executionItems.filter((execution) => {
        const executionDate = execution.orderedAt.slice(0, 10).replaceAll('.', '-');
        const isDateMatched = executionDate === searchDate;

        if (!isDateMatched) {
          return false;
        }

        if (filter === 'ALL') {
          return true;
        }

        if (filter === 'FILLED') {
          return execution.status === 'FILLED' || execution.status === 'PARTIAL';
        }

        return execution.remainingQuantity > 0 && execution.status !== 'CANCELLED';
      }),
    [executionItems, filter, searchDate],
  );

  const handleCancelExecution = (id: string) => {
    setExecutionItems((current) =>
      current.map((execution) =>
        execution.id === id
          ? {
              ...execution,
              status: 'CANCELLED',
            }
          : execution,
      ),
    );
  };

  return (
    <section className="px-4 pb-24 pt-4">
      <div className="grid grid-cols-[1fr_1fr] gap-3">
        <ExecutionFilterTabs activeFilter={filter} onChangeFilter={setFilter} />
        <input
          className="min-w-0 rounded-xl border border-blue-100 bg-white px-3 py-3 text-center text-sm font-extrabold text-slate-950 outline-none"
          onChange={(event) => setSearchDate(event.target.value)}
          type="date"
          value={searchDate}
        />
      </div>

      <div className="mt-4 space-y-2">
        {filteredExecutions.length > 0 ? (
          filteredExecutions.map((execution) => (
            <ExecutionItemCard
              execution={execution}
              key={execution.id}
              onCancelExecution={handleCancelExecution}
            />
          ))
        ) : (
          <div className="rounded-xl border border-blue-100 bg-white px-4 py-16 text-center shadow-sm">
            <p className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-xl text-[#A3B4C6]">!</p>
            <p className="mt-4 text-sm font-extrabold text-[#A3B4C6]">조회내역이 없어요.</p>
          </div>
        )}
      </div>
    </section>
  );
}
