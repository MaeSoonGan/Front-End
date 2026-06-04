import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useContestMode } from '../../contexts/ContestModeContext';
import { noticesApi } from '../../api/user/notices';
import { parseApiError } from '../../api/parseApiError';
import { getPaginationPages } from '../../utils/pagination';

interface Notice {
  id: number;
  title: string;
  content: string;
  isPinned: boolean;
  date: string;
}

const PAGE_SIZE = 5;

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
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    noticesApi.getNotices({ page: currentPage - 1, size: PAGE_SIZE })
      .then(data => {
        setNotices(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (data.content ?? []).map((n: any) => ({
            id: n.noticeId,
            title: n.title ?? '',
            content: n.content ?? '',
            isPinned: n.isPinned ?? false,
            date: formatDate(n.createdAt),
          })),
        );
        setTotalPages(data.totalPages && data.totalPages > 0 ? data.totalPages : 1);
        setError('');
      })
      .catch(e => setError(parseApiError(e)))
      .finally(() => setLoading(false));
  }, [currentPage]);

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
                    <p className="mt-2 text-[11px] font-bold text-slate-900">작성자: 운영자</p>
                  </div>
                  <span className="shrink-0 text-[11px] font-bold text-slate-900">
                    {notice.date}
                  </span>
                </div>
              </article>
            ))}
            {Array.from({ length: Math.max(0, PAGE_SIZE - notices.length) }).map((_, i) => (
              <article key={`ghost-${i}`} aria-hidden className="invisible rounded-2xl border border-blue-100 p-4">
                <p className="truncate text-sm font-extrabold">&nbsp;</p>
                <p className="mt-2 truncate text-xs leading-5">&nbsp;</p>
                <p className="mt-2 text-[11px] font-bold">&nbsp;</p>
              </article>
            ))}
          </>
        )}
      </section>

      {!loading && !error && notices.length > 0 && (
        <div className="mt-auto flex items-center justify-center gap-1 pt-5">
          <button
            className="cursor-pointer rounded p-1 text-[#6C88A4] hover:bg-blue-50 disabled:cursor-default disabled:opacity-40"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(1)}
            type="button"
          >
            <ChevronsLeft size={16} />
          </button>
          <button
            className="cursor-pointer rounded p-1 text-[#6C88A4] hover:bg-blue-50 disabled:cursor-default disabled:opacity-40"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            type="button"
          >
            <ChevronLeft size={16} />
          </button>
          {getPaginationPages(currentPage, totalPages).map((page) => (
            <button
              className={`min-w-7 cursor-pointer rounded px-2 py-1 text-xs font-bold ${
                currentPage === page ? 'bg-[#1565C0] text-white' : 'text-[#6C88A4] hover:bg-blue-50'
              }`}
              key={page}
              onClick={() => setCurrentPage(page)}
              type="button"
            >
              {page}
            </button>
          ))}
          <button
            className="cursor-pointer rounded p-1 text-[#6C88A4] hover:bg-blue-50 disabled:cursor-default disabled:opacity-40"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            type="button"
          >
            <ChevronRight size={16} />
          </button>
          <button
            className="cursor-pointer rounded p-1 text-[#6C88A4] hover:bg-blue-50 disabled:cursor-default disabled:opacity-40"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(totalPages)}
            type="button"
          >
            <ChevronsRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
