import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContestMode } from '../../contexts/ContestModeContext';
import { noticesApi } from '../../api/user/notices';
import { parseApiError } from '../../api/parseApiError';

interface Notice {
  id: number;
  title: string;
  content: string;
  isPinned: boolean;
  author: string;
  date: string;
}

const PAGE_SIZE = 10;

function formatDate(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`;
}

export function NoticePage() {
  const navigate = useNavigate();
  const { getContestPath, isContestMode } = useContestMode();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [hasMore, setHasMore] = useState(false);

  const pageRef = useRef(0);
  const loadingRef = useRef(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const loadNotices = useCallback(async (reset: boolean) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    const nextPage = reset ? 0 : pageRef.current + 1;
    if (reset) setLoading(true);
    else setLoadingMore(true);
    try {
      const data = await noticesApi.getNotices({ page: nextPage, size: PAGE_SIZE });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const items: Notice[] = (data.content ?? []).map((n: any) => ({
        id: n.noticeId,
        title: n.title ?? '',
        content: n.content ?? '',
        isPinned: n.isPinned ?? false,
        author: n.authorName ?? '운영자',
        date: formatDate(n.createdAt),
      }));
      pageRef.current = nextPage;
      setNotices((prev) => (reset ? items : [...prev, ...items]));
      const totalPages = data.totalPages && data.totalPages > 0 ? data.totalPages : 1;
      setHasMore(nextPage + 1 < totalPages);
      setError('');
    } catch (e) {
      setError(parseApiError(e));
    } finally {
      if (reset) setLoading(false);
      else setLoadingMore(false);
      loadingRef.current = false;
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadNotices(true);
  }, [loadNotices]);

  // 무한 스크롤: 하단 sentinel이 보이면 다음 페이지 로드
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingRef.current) {
          loadNotices(false);
        }
      },
      { rootMargin: '200px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loadNotices]);

  const goDetail = (id: number) => {
    const path = `/notices/${id}`;
    navigate(isContestMode ? getContestPath(path) : path);
  };

  return (
    <div className="flex flex-1 flex-col px-4 pb-6 pt-4">
      <section className="flex-1 space-y-3">
        {loading ? (
          <p className="py-10 text-center text-xs font-bold text-[#6C88A4]">공지를 불러오는 중...</p>
        ) : error ? (
          <p className="py-10 text-center text-xs font-bold text-red-500">{error}</p>
        ) : notices.length === 0 ? (
          <p className="py-10 text-center text-xs font-bold text-[#6C88A4]">등록된 공지가 없습니다.</p>
        ) : (
          <>
            {notices.map((notice) => (
              <article
                className="cursor-pointer rounded-2xl border border-blue-100 bg-white p-4 shadow-sm transition hover:border-blue-300 hover:shadow-md"
                key={notice.id}
                onClick={() => goDetail(notice.id)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-extrabold text-slate-950">
                      {notice.isPinned ? '📌 ' : ''}{notice.title}
                    </p>
                    <p className="mt-2 truncate text-xs leading-5 text-[#6C88A4]">{notice.content}</p>
                    <p className="mt-2 text-[11px] font-bold text-slate-900">작성자: {notice.author}</p>
                  </div>
                  <span className="shrink-0 text-[11px] font-bold text-slate-900">
                    {notice.date}
                  </span>
                </div>
              </article>
            ))}
            {/* 무한 스크롤 감지용 sentinel */}
            <div ref={sentinelRef} aria-hidden className="h-1" />
            {loadingMore && (
              <p className="py-3 text-center text-xs font-bold text-[#6C88A4]">불러오는 중...</p>
            )}
          </>
        )}
      </section>
    </div>
  );
}
