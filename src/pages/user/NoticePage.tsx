import { PageContainer } from '../../components/common/PageContainer';

const noticeMocks = [
  {
    id: 'n1',
    title: '5월 정기 대회가 시작되었습니다',
    description: '대회 기간 동안 대회 모드에서 거래한 내역만 랭킹에 반영됩니다.',
    date: '2026.05.01',
    isPinned: true,
  },
  {
    id: 'n2',
    title: '시드머니 초기화 안내',
    description: '시드머니 초기화는 일반 모의투자 계정 기준으로 처리됩니다.',
    date: '2026.04.28',
    isPinned: false,
  },
  {
    id: 'n3',
    title: '랭킹 반영 기준 안내',
    description: '랭킹은 수익률 기준으로 산정되며, mock 데이터는 실제 순위와 다릅니다.',
    date: '2026.04.25',
    isPinned: false,
  },
];

export function NoticePage() {
  return (
    <PageContainer>
      <section className="space-y-3">
        {noticeMocks.map((notice) => (
          <article
            className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm"
            key={notice.id}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  {notice.isPinned ? (
                    <span className="rounded-full bg-[#E5F4FF] px-2 py-1 text-[11px] font-extrabold text-[#1565C0]">
                      중요
                    </span>
                  ) : null}
                  <p className="truncate text-sm font-extrabold text-slate-950">
                    {notice.title}
                  </p>
                </div>
                <p className="mt-2 text-xs leading-5 text-[#6C88A4]">{notice.description}</p>
              </div>
              <span className="shrink-0 text-[11px] font-bold text-[#A3B4C6]">
                {notice.date}
              </span>
            </div>
          </article>
        ))}
      </section>
    </PageContainer>
  );
}
