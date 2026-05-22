import { createContext, useContext, useMemo } from 'react';
import type { ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { contestMocks } from '../mocks/contestMock';
import type { ContestListItem } from '../types/contest';

interface ContestModeContextValue {
  basePath: string;
  contest: ContestListItem | null;
  contestId: string | null;
  getContestPath: (path: string) => string;
  isContestMode: boolean;
  leaveContest: () => void;
}

const ContestModeContext = createContext<ContestModeContextValue | null>(null);

function getContestId(pathname: string) {
  const matched = pathname.match(
    /^\/contests\/([^/]+)(?:\/(home|balance|market|watchlist|more|ranking|order|stocks|executions|notifications|profile|seed-money)|$)/,
  );

  return matched?.[1] ?? null;
}

function normalizeContestPath(basePath: string, path: string) {
  if (!path || path === '/') {
    return `${basePath}/home`;
  }

  return `${basePath}${path.startsWith('/') ? path : `/${path}`}`;
}

interface ContestModeProviderProps {
  children: ReactNode;
}

export function ContestModeProvider({ children }: ContestModeProviderProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const contestId = getContestId(location.pathname);
  const contest = contestMocks.find((item) => item.id === contestId) ?? null;
  const basePath = contestId ? `/contests/${contestId}` : '';

  const value = useMemo<ContestModeContextValue>(
    () => ({
      basePath,
      contest,
      contestId,
      getContestPath: (path: string) => normalizeContestPath(basePath, path),
      isContestMode: Boolean(contestId),
      leaveContest: () => navigate('/contests'),
    }),
    [basePath, contest, contestId, navigate],
  );

  return <ContestModeContext.Provider value={value}>{children}</ContestModeContext.Provider>;
}

export function useContestMode() {
  const context = useContext(ContestModeContext);

  if (!context) {
    throw new Error('useContestMode must be used within ContestModeProvider');
  }

  return context;
}
