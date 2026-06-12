import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pin, Search, Plus, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { getPaginationPages } from '../../../utils/pagination';
import { Card } from '../../../components/common/Card';
import { useAdminPageActions } from '../../../contexts/AdminPageActionsContext';
import { Button } from '../../../components/common/Button';
import { noticesApi } from '../../../api/admin/notices';

type NoticeStatus = 'PUBLISHED' | 'SCHEDULED' | 'HIDDEN' | 'DRAFT';
type TabFilter = 'ALL' | NoticeStatus;
type SortDir = 'asc' | 'desc' | null;

interface Notice {
  id: string;
  isPinned: boolean;
  title: string;
  status: NoticeStatus;
  startDate: string;
  endDate: string | null;
  authorName: string;
  createdAt: string;
  views: number;
}

interface FormState {
  title: string;
  content: string;
  startDate: string;
  endDate: string;
  displayStatus: '게시' | '예약' | '숨김';
  isPinned: boolean;
}

const STATUS_LABEL: Record<NoticeStatus, string> = {
  PUBLISHED: '게시중',
  SCHEDULED: '예약',
  HIDDEN:    '숨김',
  DRAFT:     '임시저장',
};

const STATUS_BADGE_CLASS: Record<NoticeStatus, string> = {
  PUBLISHED: 'bg-emerald-100 text-emerald-600',
  SCHEDULED: 'bg-sky-100 text-sky-600',
  HIDDEN:    'bg-slate-100 text-slate-500',
  DRAFT:     'bg-purple-100 text-purple-600',
};

const TAB_LIST: { label: string; value: TabFilter }[] = [
  { label: '전체',     value: 'ALL'       },
  { label: '게시중',   value: 'PUBLISHED' },
  { label: '예약',     value: 'SCHEDULED' },
  { label: '숨김',     value: 'HIDDEN'    },
  { label: '임시저장', value: 'DRAFT'     },
];

const EMPTY_FORM: FormState = {
  title: '',
  content: '',
  startDate: '',
  endDate: '',
  displayStatus: '게시',
  isPinned: false,
};

const PAGE_SIZE = 5;

function isoToDisplay(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  return `${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

function isoToCreatedAt(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getFullYear()).slice(2)}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

function dateToIso(date: string): string | undefined {
  if (!date) return undefined;
  return `${date}T00:00:00`;
}

function formatDateRange(start: string, end: string | null) {
  return end ? `${start}~${end}` : `${start}~`;
}

function toDisplayDate(d: string): string {
  if (!d) return '';
  const parts = d.split('-');
  if (parts.length !== 3) return '';
  return `${parts[1]}.${parts[2]}`;
}

function StatusBadge({ status }: { status: NoticeStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_BADGE_CLASS[status] ?? 'bg-slate-100 text-slate-500'}`}>
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}

function SortIcon({ dir }: { dir: SortDir }) {
  if (!dir) return <ChevronsUpDown size={13} className="ml-1 inline opacity-30" />;
  return dir === 'asc'
    ? <ChevronUp size={13} className="ml-1 inline text-[#1565C0]" />
    : <ChevronDown size={13} className="ml-1 inline text-[#1565C0]" />;
}

export function AdminNoticeManagePage() {
  const navigate = useNavigate();
  const [searchInput, setSearchInput]     = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [activeTab, setActiveTab]         = useState<TabFilter>('ALL');
  const [currentPage, setCurrentPage]     = useState(1);
  const [notices, setNotices]             = useState<Notice[]>([]);
  const [totalPages, setTotalPages]       = useState(1);
  const [sortDir, setSortDir]             = useState<SortDir>(null);
  const [loading, setLoading]             = useState(false);

  const [isFormOpen, setIsFormOpen]         = useState(false);
  const [editingId, setEditingId]           = useState<string | null>(null);
  const [form, setForm]                     = useState<FormState>({ ...EMPTY_FORM });
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const fetchNotices = useCallback(async () => {
    setLoading(true);
    try {
      const data = await noticesApi.getNotices({
        keyword: appliedSearch || undefined,
        status:  activeTab === 'ALL' ? undefined : activeTab,
        page:    currentPage - 1,
        size:    PAGE_SIZE,
        sort:    sortDir ? `createdAt,${sortDir}` : undefined,
      });
      setNotices(
        (data.content ?? []).map((n: any) => ({
          id:         String(n.noticeId),
          isPinned:   n.isPinned ?? false,
          title:      n.title ?? '',
          status:     (n.status as NoticeStatus) ?? 'PUBLISHED',
          startDate:  isoToDisplay(n.startAt),
          endDate:    n.endAt ? isoToDisplay(n.endAt) : null,
          authorName: n.adminName ?? '',
          createdAt:  isoToCreatedAt(n.createdAt),
          views:      0,
        }))
      );
      setTotalPages(data.totalPages ?? 1);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [appliedSearch, activeTab, currentPage, sortDir]);

  useEffect(() => { fetchNotices(); }, [fetchNotices]);

  // 정렬(고정글 우선 + 작성일)은 서버에서 전체 데이터 기준으로 처리됨(fetchNotices의 sort 파라미터)
  const filtered = notices;

  const safePage   = Math.min(currentPage, totalPages);
  const ghostCount = PAGE_SIZE - Math.max(filtered.length, filtered.length === 0 ? 1 : 0);

  function handleSort() {
    setSortDir(prev => (prev === null ? 'asc' : prev === 'asc' ? 'desc' : null));
  }

  function handleSearch() {
    setAppliedSearch(searchInput);
    setCurrentPage(1);
  }

  function handleTabChange(tab: TabFilter) {
    setActiveTab(tab);
    setCurrentPage(1);
  }

  function handleNewNotice() {
    if (isFormOpen) {
      setEditingId(null);
      setForm({ ...EMPTY_FORM });
      setIsFormOpen(false);
      return;
    }
    setForm({ ...EMPTY_FORM });
    setIsFormOpen(true);
  }

  function handleEdit(notice: Notice) {
    setEditingId(notice.id);
    setForm({
      title:         notice.title,
      content:       '',
      startDate:     notice.startDate ? `2025-${notice.startDate.replace('.', '-')}` : '',
      endDate:       notice.endDate ? `2025-${notice.endDate.replace('.', '-')}` : '',
      displayStatus: notice.status === 'HIDDEN' ? '숨김' : notice.status === 'SCHEDULED' ? '예약' : '게시',
      isPinned:      notice.isPinned,
    });
    setIsFormOpen(true);
  }

  function resolveStatus(): NoticeStatus {
    if (form.displayStatus === '숨김') return 'HIDDEN';
    if (form.displayStatus === '예약') return 'SCHEDULED';
    if (!form.startDate) return 'PUBLISHED';
    return new Date(form.startDate) > new Date() ? 'SCHEDULED' : 'PUBLISHED';
  }

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    const status = resolveStatus();
    const payload = {
      title:   form.title || '(제목 없음)',
      content: form.content,
      isPinned: form.isPinned,
      status,
      startAt: dateToIso(form.startDate),
      endAt:   dateToIso(form.endDate),
    };
    try {
      if (editingId) {
        await noticesApi.updateNotice(Number(editingId), payload);
      } else {
        await noticesApi.createNotice(payload);
      }
      setEditingId(null);
      setForm({ ...EMPTY_FORM });
      setIsFormOpen(false);
      fetchNotices();
    } catch (e) {
      console.error(e);
    }
  }

  async function handleTempSave() {
    const payload = {
      title:   form.title || '(제목 없음)',
      content: form.content,
      isPinned: form.isPinned,
      status:  'DRAFT' as NoticeStatus,
      startAt: dateToIso(form.startDate),
      endAt:   dateToIso(form.endDate),
    };
    try {
      if (editingId) {
        await noticesApi.updateNotice(Number(editingId), payload);
      } else {
        await noticesApi.createNotice(payload);
      }
      setEditingId(null);
      setForm({ ...EMPTY_FORM });
      setIsFormOpen(false);
      fetchNotices();
    } catch (e) {
      console.error(e);
    }
  }

  function handleCancel() {
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
    setIsFormOpen(false);
  }

  async function confirmDelete() {
    if (!deleteTargetId) return;
    try {
      await noticesApi.deleteNotice(Number(deleteTargetId));
      if (editingId === deleteTargetId) {
        setEditingId(null);
        setForm({ ...EMPTY_FORM });
        setIsFormOpen(false);
      }
      setDeleteTargetId(null);
      fetchNotices();
    } catch (e) {
      console.error(e);
    }
  }

  const previewDateRange = useMemo(() => {
    const start = toDisplayDate(form.startDate);
    const end   = toDisplayDate(form.endDate);
    if (!start) return '';
    return end ? `${start} ~ ${end}` : `${start} ~`;
  }, [form.startDate, form.endDate]);

  const handleNewNoticeRef = useRef(handleNewNotice);
  useEffect(() => {
    handleNewNoticeRef.current = handleNewNotice;
  });

  useAdminPageActions(
    <Button variant="brand" onClick={() => handleNewNoticeRef.current()} className="cursor-pointer">
      <Plus size={16} className="mr-1.5" />
      공지 등록
    </Button>
  );

  return (
    <>
      {/* 삭제 확인 모달 */}
      {deleteTargetId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setDeleteTargetId(null)}>
          <div className="w-80 rounded-lg bg-white p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="mb-2 text-base font-bold text-slate-900">공지 삭제</h3>
            <p className="mb-5 text-sm text-slate-600">해당 공지사항을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.</p>
            <div className="flex justify-end gap-2">
              <Button variant="danger" onClick={confirmDelete} className="cursor-pointer">삭제</Button>
              <Button variant="secondary" onClick={() => setDeleteTargetId(null)} className="cursor-pointer">취소</Button>
            </div>
          </div>
        </div>
      )}

      <div className={`grid gap-6 ${isFormOpen ? 'items-stretch lg:grid-cols-5' : 'lg:grid-cols-1'}`}>
        {/* 왼쪽: 공지 목록 */}
        <div className={isFormOpen ? 'flex flex-col lg:col-span-3' : ''}>
          <Card className={`flex flex-col p-0 min-h-145 ${isFormOpen ? 'flex-1' : ''}`}>
            <div className="border-b border-slate-200 p-4">
              <h2 className="mb-3 text-base font-semibold text-slate-900">공지 목록</h2>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="제목 검색"
                    value={searchInput}
                    onChange={e => setSearchInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSearch()}
                    className="h-9 w-full rounded-md border border-slate-300 pl-9 pr-3 text-sm focus:border-[#1565C0] focus:outline-none"
                  />
                </div>
                <Button variant="brand" className="h-9 cursor-pointer px-4 text-sm" onClick={handleSearch}>검색</Button>
              </div>
              <div className="mt-3 flex gap-1">
                {TAB_LIST.map(tab => (
                  <button
                    key={tab.value}
                    onClick={() => handleTabChange(tab.value)}
                    className={`cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium transition ${activeTab === tab.value ? 'bg-[#1565C0] text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-72 overflow-x-auto overflow-y-hidden">
              <table className="w-full min-w-195 table-fixed text-sm">
                <colgroup>
                  <col className="w-10" />
                  <col />
                  <col className="w-26" />
                  <col className="w-36" />
                  <col className="w-22" />
                  <col className="w-22" />
                  <col className="w-28" />
                  <col className="w-28" />
                </colgroup>
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="whitespace-nowrap px-3 py-3 text-center font-medium">고정</th>
                    <th className="px-3 py-3 text-center font-medium">제목</th>
                    <th className="px-3 py-3 text-center font-medium">상태</th>
                    <th className="px-3 py-3 text-center font-medium">노출 기간</th>
                    <th className="px-3 py-3 text-center font-medium">작성자</th>
                    <th className="px-3 py-3 text-center font-medium">조회수</th>
                    <th className="cursor-pointer px-3 py-3 text-center font-medium hover:text-slate-700" onClick={handleSort}>
                      작성일<SortIcon dir={sortDir} />
                    </th>
                    <th className="px-3 py-3 text-center font-medium">관리</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr className="h-10.25 border-t border-slate-100">
                      <td colSpan={8} className="px-3 py-3 text-center text-slate-400">불러오는 중...</td>
                    </tr>
                  )}
                  {!loading && filtered.length === 0 && (
                    <tr className="h-10.25 border-t border-slate-100">
                      <td colSpan={8} className="px-3 py-3 text-center text-slate-400">공지사항이 없습니다.</td>
                    </tr>
                  )}
                  {!loading && filtered.map(notice => (
                    <tr key={notice.id} className="h-10.25 cursor-pointer border-t border-slate-100 hover:bg-slate-50">
                      <td className="px-3 py-3 text-center">
                        {notice.isPinned && <Pin size={14} className="mx-auto text-rose-500" />}
                      </td>
                      <td className="truncate px-3 py-3 text-center font-medium text-slate-900" title={notice.title}>
                        <button onClick={() => navigate(`/admin/notices/${notice.id}`)} className="cursor-pointer hover:text-[#1565C0] hover:underline">
                          {notice.title}
                        </button>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex justify-center"><StatusBadge status={notice.status} /></div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-center text-slate-600">{formatDateRange(notice.startDate, notice.endDate)}</td>
                      <td className="whitespace-nowrap px-3 py-3 text-center text-slate-600">{notice.authorName}</td>
                      <td className="whitespace-nowrap px-3 py-3 text-center text-slate-600">{notice.views.toLocaleString('ko-KR')}</td>
                      <td className="whitespace-nowrap px-3 py-3 text-center text-slate-600">{notice.createdAt}</td>
                      <td className="px-3 py-3">
                        <div className="flex justify-center gap-1">
                          <button onClick={() => handleEdit(notice)} className="cursor-pointer rounded px-2 py-1 text-xs font-medium text-[#1565C0] hover:bg-[#E8F0FE]">수정</button>
                          <button onClick={() => setDeleteTargetId(notice.id)} className="cursor-pointer rounded px-2 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50">삭제</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!loading && Array.from({ length: ghostCount }).map((_, i) => (
                    <tr key={`ghost-${i}`}>
                      <td colSpan={8} className="px-3 py-3">
                        <span className="invisible select-none text-sm leading-6">x</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex-1" />

            <div className="flex items-center justify-center border-t border-slate-200 px-4 py-3 text-sm text-slate-500">
              <div className="flex items-center gap-1">
                <button onClick={() => setCurrentPage(1)} disabled={safePage === 1} className="cursor-pointer rounded p-1 hover:bg-slate-100 disabled:cursor-default disabled:opacity-40"><ChevronsLeft size={16} /></button>
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={safePage === 1} className="cursor-pointer rounded p-1 hover:bg-slate-100 disabled:cursor-default disabled:opacity-40"><ChevronLeft size={16} /></button>
                {getPaginationPages(safePage, totalPages).map(page => (
                  <button key={page} onClick={() => setCurrentPage(page)} className={`cursor-pointer min-w-7 rounded px-2 py-1 text-sm font-medium ${safePage === page ? 'bg-[#1565C0] text-white' : 'text-slate-600 hover:bg-slate-100'}`}>{page}</button>
                ))}
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages} className="cursor-pointer rounded p-1 hover:bg-slate-100 disabled:cursor-default disabled:opacity-40"><ChevronRight size={16} /></button>
                <button onClick={() => setCurrentPage(totalPages)} disabled={safePage === totalPages} className="cursor-pointer rounded p-1 hover:bg-slate-100 disabled:cursor-default disabled:opacity-40"><ChevronsRight size={16} /></button>
              </div>
            </div>
          </Card>
        </div>

        {/* 오른쪽: 등록/수정 폼 */}
        {isFormOpen && (
          <div className="flex flex-col lg:col-span-2">
            <Card className="flex-1">
              <h2 className="mb-4 text-base font-semibold text-slate-900">{editingId ? '공지 수정' : '공지 등록'}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">제목</label>
                  <input type="text" placeholder="공지 제목 입력" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm focus:border-[#1565C0] focus:outline-none" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">내용</label>
                  <textarea placeholder="공지 내용 입력" value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} rows={4} className="w-full resize-none rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-[#1565C0] focus:outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">노출 시작일</label>
                    <input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} className="h-10 w-full cursor-pointer rounded-md border border-slate-300 px-3 text-sm focus:border-[#1565C0] focus:outline-none" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">노출 종료일 <span className="font-normal text-slate-400">(없으면 공백)</span></label>
                    <input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} className="h-10 w-full cursor-pointer rounded-md border border-slate-300 px-3 text-sm focus:border-[#1565C0] focus:outline-none" />
                  </div>
                </div>
                <div className="flex items-end gap-4">
                  <div className="flex-1">
                    <label className="mb-1 block text-sm font-medium text-slate-700">게시 상태</label>
                    <select value={form.displayStatus} onChange={e => setForm(f => ({ ...f, displayStatus: e.target.value as '게시' | '예약' | '숨김' }))} className="h-10 w-full cursor-pointer rounded-md border border-slate-300 px-3 text-sm focus:border-[#1565C0] focus:outline-none">
                      <option value="게시">게시</option>
                      <option value="예약">예약</option>
                      <option value="숨김">숨김</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2 pb-2">
                    <input id="isPinned" type="checkbox" checked={form.isPinned} onChange={e => setForm(f => ({ ...f, isPinned: e.target.checked }))} className="h-4 w-4 cursor-pointer rounded" />
                    <label htmlFor="isPinned" className="cursor-pointer text-sm font-medium text-slate-700">상단 고정 (중요 공지)</label>
                  </div>
                </div>
                <div className="rounded-md bg-slate-50 p-3">
                  <p className="mb-1.5 text-xs font-medium text-slate-500">미리보기</p>
                  <p className="text-sm font-semibold text-slate-900">{form.title ? form.title : <span className="font-normal text-slate-400">(제목을 입력하세요)</span>}</p>
                  {previewDateRange && <p className="mt-0.5 text-xs text-slate-400">{previewDateRange} · admin</p>}
                </div>
                <div className="flex gap-2">
                  <Button variant="brand" type="submit" className="flex-1 cursor-pointer" disabled={!form.title.trim()}>{editingId ? '수정' : '등록'}</Button>
                  <Button variant="secondary" type="button" className="cursor-pointer" onClick={handleTempSave}>임시 저장</Button>
                  <Button variant="ghost" type="button" className="cursor-pointer" onClick={handleCancel}>취소</Button>
                </div>
              </form>
            </Card>
          </div>
        )}
      </div>
    </>
  );
}
