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

export interface ContestRankingItem {
  rank: number;
  nickname: string;
  profitAmount: number;
  profitRate: number;
}

export type ContestMyRanking = ContestRankingItem;

export interface ContestRankingResponse {
  contestId: string;
  contestTitle: string;
  totalParticipants: number;
  myRanking: ContestMyRanking;
  rankingList: ContestRankingItem[];
}
