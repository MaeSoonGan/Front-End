import { useEffect, useState } from 'react';
import { PageContainer } from '../../components/common/PageContainer';
import { noticesApi } from '../../api/user/notices';
import { parseApiError } from '../../api/parseApiError';

interface Notice {
  id: number;
  title: string;
  content: string;
  isPinned: boolean;
  date: string;
}

function formatDate(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`;
}

export function NoticePage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    noticesApi.getNotices()
      .then(data => {
        setNotices(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (data.items ?? []).map((n: any) => ({
            id: n.noticeId,
            title: n.title ?? '',
            content: n.content ?? '',
            isPinned: n.isPinned ?? false,
            date: formatDate(n.createdAt),
          })),
        );
      })
      .catch(e => setError(parseApiError(e)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageContainer>
      <section className="space-y-3">
        {loading ? (
          <p className="py-10 text-center text-xs font-bold text-[#6C88A4]">공지를 불러오는 중...</p>
        ) : error ? (
          <p className="py-10 text-center text-xs font-bold text-red-500">{error}</p>
        ) : notices.length === 0 ? (
          <p className="py-10 text-center text-xs font-bold text-[#6C88A4]">등록된 공지가 없습니다.</p>
        ) : (
          notices.map((notice) => (
            <article
              className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm"
              key={notice.id}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-extrabold text-slate-950">
                    {notice.isPinned ? '📌 ' : ''}{notice.title}
                  </p>
                  <p className="mt-2 text-xs leading-5 text-[#6C88A4]">{notice.content}</p>
                  <p className="mt-2 text-[11px] font-bold text-slate-900">작성자: 운영자</p>
                </div>
                <span className="shrink-0 text-[11px] font-bold text-slate-900">
                  {notice.date}
                </span>
              </div>
            </article>
          ))
        )}
      </section>
    </PageContainer>
  );
}
