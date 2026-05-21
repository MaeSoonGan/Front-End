export type BalanceTab = 'holdings' | 'trades' | 'executions';
export type TradeSide = 'BUY' | 'SELL';
export type ExecutionStatus = 'FILLED' | 'PARTIAL' | 'OPEN' | 'CANCELLED';
export type ExecutionFilterType = 'ALL' | 'FILLED' | 'OPEN';

export interface BalanceSummary {
  totalEvaluation: number;
  profitAmount: number;
  profitRate: number;
  deposit: number;
  availableOrderAmount: number;
}

export interface HoldingItem {
  stockName: string;
  stockCode: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  profitAmount: number;
  profitRate: number;
}

export interface ProfitTrendPoint {
  label: string;
  rate: number;
}

export interface BalanceTradeHistoryItem {
  id: string;
  tradeDate: string;
  side: TradeSide;
  stockName: string;
  quantity: number;
  unitPrice: number;
  executionAmount: number;
  settlementAmount: number;
  fee: number;
  tax: number;
}

export interface ExecutionHistoryItem {
  id: string;
  stockName: string;
  side: TradeSide;
  orderType: '지정가' | '시장가';
  orderPrice: number;
  orderQuantity: number;
  filledQuantity: number;
  remainingQuantity: number;
  orderNumber: string;
  originalOrderNumber?: string;
  orderedAt: string;
  status: ExecutionStatus;
}
