import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { contestsApi } from '../api/user/contests';

interface ContestModeInfo {
  contestId: string;
  title: string;
  startAt: string;
}

interface ContestModeContextValue {
  basePath: string;
  contest: ContestModeInfo | null;
  contestId: string | null;
  getContestPath: (path: string) => string;
  isContestMode: boolean;
  leaveContest: () => void;
}

const ContestModeContext = createContext<ContestModeContextValue | null>(null);

function getContestId(pathname: string) {
  const matched = pathname.match(
    /^\/contests\/([^/]+)(?:\/(home|balance|market|watchlist|more|ranking|order|stocks|executions|notices|notifications|profile|seed-money)|$)/,
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
  const basePath = contestId ? `/contests/${contestId}` : '';

  const [contest, setContest] = useState<ContestModeInfo | null>(null);

  // 대회 모드 나가기 시 돌아갈 경로. 진입 시 navigate state.from으로 지정(예: 홈 '/').
  // 기본값은 대회 목록('/contests') — 대회 페이지에서 들어온 경우.
  const exitToRef = useRef('/contests');
  useEffect(() => {
    const from = (location.state as { from?: string } | null)?.from;
    if (contestId && from) {
      exitToRef.current = from;
    } else if (!contestId) {
      exitToRef.current = '/contests';
    }
  }, [contestId, location.state]);

  // 대회 모드 진입 시 실제 대회 정보 조회 (배너 표시용)
  useEffect(() => {
    if (!contestId) {
      setContest(null);
      return;
    }

    let cancelled = false;
    contestsApi
      .getContest(Number(contestId))
      .then((detail) => {
        if (cancelled || !detail) return;
        setContest({
          contestId,
          title: detail.title ?? '',
          startAt: String(detail.startAt ?? ''),
        });
      })
      .catch(() => {
        if (!cancelled) setContest(null);
      });

    return () => {
      cancelled = true;
    };
  }, [contestId]);

  const value = useMemo<ContestModeContextValue>(
    () => ({
      basePath,
      contest,
      contestId,
      getContestPath: (path: string) => normalizeContestPath(basePath, path),
      isContestMode: Boolean(contestId),
      leaveContest: () => navigate(exitToRef.current),
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
