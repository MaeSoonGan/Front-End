export type ContestStatus = 'ACTIVE' | 'SCHEDULED' | 'ENDED';

export type ContestStockType = '전체 종목' | '반도체' | 'IT' | '자동차';

export interface ContestListItem {
  id: string;
  title: string;
  stockType: ContestStockType;
  status: ContestStatus;
  startAt: string;
  endAt: string;
  currentParticipants: number;
  maxParticipants: number | null;
  seedMoney: number;
  isJoined: boolean;
}
