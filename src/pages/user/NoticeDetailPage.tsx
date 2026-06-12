import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { PageContainer } from '../../components/common/PageContainer';
import { noticesApi } from '../../api/user/notices';
import { parseApiError } from '../../api/parseApiError';

interface NoticeDetail {
  id: number;
  title: string;
  content: string;
  isPinned: boolean;
  author: string;
  date: string;
}

function formatDate(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`;
}

export function NoticeDetailPage() {
  const { noticeId } = useParams<{ noticeId: string }>();
  const [notice, setNotice] = useState<NoticeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!noticeId) return;
    noticesApi.getNotice(Number(noticeId))
      .then(data => {
        setNotice({
          id: data.noticeId,
          title: data.title ?? '',
          content: data.content ?? '',
          isPinned: data.isPinned ?? false,
          author: data.authorName ?? '운영자',
          date: formatDate(data.createdAt),
        });
      })
      .catch(e => setError(parseApiError(e)))
      .finally(() => setLoading(false));
  }, [noticeId]);

  return (
    <PageContainer className="min-h-full bg-[#F3F7FC] pt-3">
      {loading ? (
        <p className="py-10 text-center text-xs font-bold text-[#6C88A4]">공지를 불러오는 중...</p>
      ) : error ? (
        <p className="py-10 text-center text-xs font-bold text-red-500">{error}</p>
      ) : notice ? (
        <article className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
          <p className="text-base font-extrabold leading-6 text-slate-950">
            {notice.isPinned ? '📌 ' : ''}{notice.title}
          </p>
          <div className="mt-2 flex items-center gap-2 text-[11px] font-bold text-[#6C88A4]">
            <span>{notice.author}</span>
            <span>·</span>
            <span>{notice.date}</span>
          </div>
          <div className="mt-4 border-t border-blue-50 pt-4">
            <p className="whitespace-pre-wrap text-sm leading-6 text-slate-800">{notice.content}</p>
          </div>
        </article>
      ) : null}
    </PageContainer>
  );
}
