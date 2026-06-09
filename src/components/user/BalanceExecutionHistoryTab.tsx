import { useEffect, useMemo, useState } from 'react';
import type { ExecutionFilterType, ExecutionHistoryItem } from '../../types/balance';
import { ExecutionFilterTabs } from './ExecutionFilterTabs';
import { ExecutionItemCard } from './ExecutionItemCard';

interface BalanceExecutionHistoryTabProps {
  executions: ExecutionHistoryItem[];
  date: string;
  filter: ExecutionFilterType;
  onChangeDate: (value: string) => void;
  onChangeFilter: (value: ExecutionFilterType) => void;
}

export function BalanceExecutionHistoryTab({
  executions,
  date,
  filter,
  onChangeDate,
  onChangeFilter,
}: BalanceExecutionHistoryTabProps) {
  // 날짜는 백엔드 조회로 처리되므로, 여기선 상태(체결/미체결)만 클라이언트 필터
  const [executionItems, setExecutionItems] = useState(executions);
  useEffect(() => {
    setExecutionItems(executions);
  }, [executions]);

  const filteredExecutions = useMemo(
    () =>
      executionItems.filter((execution) => {
        if (filter === 'ALL') {
          return true;
        }

        if (filter === 'FILLED') {
          // 체결 = 완전 체결(잔량 0), 취소 제외
          return execution.remainingQuantity === 0 && execution.status !== 'CANCELLED';
        }

        // 미체결 = 잔량 남음(부분체결 포함), 취소 제외
        return execution.remainingQuantity > 0 && execution.status !== 'CANCELLED';
      }),
    [executionItems, filter],
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
        <ExecutionFilterTabs activeFilter={filter} onChangeFilter={onChangeFilter} />
        <input
          className="min-w-0 rounded-xl border border-blue-100 bg-white px-3 py-3 text-center text-sm font-extrabold text-slate-950 outline-none"
          onChange={(event) => onChangeDate(event.target.value)}
          type="date"
          value={date}
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
