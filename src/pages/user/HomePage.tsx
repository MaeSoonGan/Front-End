import { useNavigate } from 'react-router-dom';
import { PageContainer } from '../../components/common/PageContainer';
import { useContestMode } from '../../contexts/ContestModeContext';
import { userHomeMock } from '../../mocks/userHomeMock';

function getChangeClass(changeRate: string) {
  if (changeRate.startsWith('-')) {
    return 'text-blue-600';
  }

  if (changeRate.startsWith('+')) {
    return 'text-red-500';
  }

  return 'text-emerald-600';
}

export function HomePage() {
  const navigate = useNavigate();
  const { contest, getContestPath, isContestMode } = useContestMode();
  const { asset, marketStatus, watchlist, activeContest } = userHomeMock;
  const getPath = (path: string) => (isContestMode ? getContestPath(path) : path);
  const contestTitle = contest ? `${contest.startAt.slice(0, 4)}년 ${contest.title}` : '참여 대회';

  return (
    <PageContainer>
      <button
        className="w-full rounded-2xl bg-gradient-to-br from-[#1565C0] to-[#4F8ED9] p-5 text-left text-white shadow-sm transition hover:shadow-md"
        onClick={() => navigate(getPath('/balance'))}
        type="button"
      >
        <div className={isContestMode ? 'flex items-start justify-between gap-4' : undefined}>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-blue-100">내 총 자산</p>
            <p className="mt-2 text-2xl font-extrabold">{asset.total}</p>
            <p className="mt-1 text-xs text-blue-100">
              {isContestMode ? contestTitle : `▲ ${asset.change} (${asset.rate})`}
            </p>
          </div>
          {isContestMode ? (
            <div className="shrink-0 rounded-2xl bg-white/15 px-4 py-3 text-right">
              <p className="text-[11px] font-bold text-blue-100">현재 순위</p>
              <p className="mt-1 text-2xl font-extrabold leading-none">
                {activeContest.rank}
                <span className="ml-1 text-sm font-bold text-blue-100">
                  / {activeContest.participants}
                </span>
              </p>
            </div>
          ) : null}
        </div>
        {!isContestMode ? (
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-white/15 p-3">
              <p className="text-xs text-blue-100">예수금</p>
              <p className="mt-1 text-sm font-bold">{asset.cash}</p>
            </div>
            <div className="rounded-xl bg-white/15 p-3">
              <p className="text-xs text-blue-100">주식평가</p>
              <p className="mt-1 text-sm font-bold">{asset.evaluation}</p>
            </div>
          </div>
        ) : null}
      </button>

      <section className="mt-4 grid grid-cols-3 gap-3">
        {marketStatus.map((status) => (
          <div
            className="rounded-xl border border-blue-100 bg-white px-3 py-4 text-center shadow-sm"
            key={status.title}
          >
            <div className="mx-auto flex h-6 w-6 items-center justify-center text-base">
              {status.icon}
            </div>
            <p className="mt-2 text-xs font-bold text-[#6C88A4]">{status.title}</p>
            <p className="mt-1 text-lg font-extrabold leading-5 text-slate-950">
              {status.value}
            </p>
            <p className={`mt-1 text-xs font-bold ${getChangeClass(status.changeRate)}`}>
              {status.changeRate}
            </p>
          </div>
        ))}
      </section>

      <section className="mt-5">
        <h2 className="mb-3 text-base font-extrabold text-slate-950">실시간 순위</h2>
        <div className="space-y-2">
          {watchlist.map((stock) => (
            <button
              className="flex w-full items-center justify-between rounded-xl border border-blue-100 bg-white px-4 py-3 text-left shadow-sm transition hover:border-blue-200 hover:bg-[#F8FBFF]"
              key={stock.code}
              onClick={() => navigate(`${getPath('/market')}?stockCode=${stock.code}`)}
              type="button"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E5F4FF] text-xs font-bold text-[#1565C0]">
                  {stock.name.slice(0, 1)}
                </span>
                <div>
                  <p className="text-sm font-bold text-slate-950">{stock.name}</p>
                  <p className="text-xs text-[#A3B4C6]">{stock.code}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-slate-950">{stock.price}</p>
                <p className={`text-xs font-bold ${getChangeClass(stock.changeRate)}`}>
                  {stock.changeRate}
                </p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {!isContestMode ? (
        <section className="mt-5">
          <h2 className="mb-3 text-base font-extrabold text-slate-950">참여 중인 대회</h2>
          <button
            className="w-full rounded-2xl border border-blue-100 bg-white p-4 text-left shadow-sm transition hover:border-blue-200 hover:bg-[#F8FBFF]"
            onClick={() => navigate(`/contests/${activeContest.id}/home`)}
            type="button"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-[#1565C0]">{activeContest.type}</p>
                <p className="mt-1 text-base font-extrabold text-slate-950">
                  {activeContest.title}
                </p>
              </div>
              <span className="rounded-full bg-[#E5F4FF] px-3 py-1 text-xs font-bold text-[#1565C0]">
                {activeContest.endDate}
              </span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-[#F0F6FF] p-3">
                <p className="text-xs text-[#6C88A4]">내 자산</p>
                <p className="mt-1 text-sm font-bold text-slate-950">
                  {activeContest.myAsset}
                </p>
              </div>
              <div className="rounded-xl bg-[#F0F6FF] p-3">
                <p className="text-xs text-[#6C88A4]">대회 순위</p>
                <p className="mt-1 text-sm font-bold text-[#1565C0]">
                  {activeContest.rank}
                  <span className="ml-1 text-xs font-medium text-[#6C88A4]">
                    / {activeContest.participants}
                  </span>
                </p>
              </div>
            </div>
          </button>
        </section>
      ) : null}
    </PageContainer>
  );
}
