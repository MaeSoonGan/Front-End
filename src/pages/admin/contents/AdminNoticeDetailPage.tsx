import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Pin } from 'lucide-react';
import { Card } from '../../../components/common/Card';
import { PageHeader } from '../../../components/common/PageHeader';
import { Button } from '../../../components/common/Button';
import { noticesApi } from '../../../api/admin/notices';

type NoticeStatus = 'PUBLISHED' | 'SCHEDULED' | 'HIDDEN';

interface NoticeDetail {
  id: string;
  isPinned: boolean;
  title: string;
  status: NoticeStatus;
  startDate: string;
  endDate: string | null;
  authorName: string;
  createdAt: string;
  updatedAt: string;
  content: string;
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
  HIDDEN: '숨김',
};

const STATUS_BADGE_CLASS: Record<NoticeStatus, string> = {
  PUBLISHED: 'bg-emerald-100 text-emerald-600',
  SCHEDULED: 'bg-sky-100 text-sky-600',
  HIDDEN: 'bg-slate-100 text-slate-500',
};

function isoToDisplay(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  return `${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

function isoToCreatedAt(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getFullYear()).slice(2)}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

function isoToInputDate(iso: string | null): string {
  if (!iso) return '';
  return iso.split('T')[0];
}

function dateToIso(date: string): string | undefined {
  if (!date) return undefined;
  return `${date}T00:00:00`;
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

export function AdminNoticeDetailPage() {
  const { noticeId } = useParams<{ noticeId: string }>();
  const navigate = useNavigate();

  const [notice, setNotice]     = useState<NoticeDetail | undefined>(undefined);
  const [loading, setLoading]   = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isEditing, setIsEditing]     = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [form, setForm] = useState<FormState>({
    title: '', content: '', startDate: '', endDate: '', displayStatus: '게시', isPinned: false,
  });

  useEffect(() => {
    if (!noticeId) { setNotFound(true); setLoading(false); return; }
    noticesApi.getNotice(Number(noticeId))
      .then(data => {
        setNotice({
          id:         String(data.noticeId),
          isPinned:   data.isPinned ?? false,
          title:      data.title ?? '',
          status:     (data.status as NoticeStatus) ?? 'PUBLISHED',
          startDate:  isoToDisplay(data.startAt),
          endDate:    data.endAt ? isoToDisplay(data.endAt) : null,
          authorName: data.adminName ?? '',
          createdAt:  isoToCreatedAt(data.createdAt),
          updatedAt:  isoToCreatedAt(data.updatedAt),
          content:    data.content ?? '',
        });
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [noticeId]);

  const previewDateRange = useMemo(() => {
    const start = toDisplayDate(form.startDate);
    const end   = toDisplayDate(form.endDate);
    if (!start) return '';
    return end ? `${start} ~ ${end}` : `${start} ~`;
  }, [form.startDate, form.endDate]);

  function handleEditOpen() {
    if (!notice) return;
    setForm({
      title:         notice.title,
      content:       notice.content,
      startDate:     isoToInputDate(notice.startDate ? `2025-${notice.startDate.replace('.', '-')}` : ''),
      endDate:       notice.endDate ? isoToInputDate(`2025-${notice.endDate.replace('.', '-')}`) : '',
      displayStatus: notice.status === 'HIDDEN' ? '숨김' : notice.status === 'SCHEDULED' ? '예약' : '게시',
      isPinned:      notice.isPinned,
    });
    setIsEditing(true);
  }

  function resolveStatus(): NoticeStatus {
    if (form.displayStatus === '숨김') return 'HIDDEN';
    if (form.displayStatus === '예약') return 'SCHEDULED';
    return 'PUBLISHED';
  }

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    if (!notice) return;
    const status = resolveStatus();
    try {
      await noticesApi.updateNotice(Number(notice.id), {
        title:    form.title || '(제목 없음)',
        content:  form.content,
        isPinned: form.isPinned,
        status,
        startAt:  dateToIso(form.startDate),
        endAt:    dateToIso(form.endDate),
      });
      setNotice(prev => prev ? {
        ...prev,
        title:     form.title || '(제목 없음)',
        content:   form.content,
        status,
        startDate: toDisplayDate(form.startDate),
        endDate:   form.endDate ? toDisplayDate(form.endDate) : null,
        isPinned:  form.isPinned,
      } : prev);
      setIsEditing(false);
    } catch (e) {
      console.error(e);
    }
  }

  async function handleDelete() {
    if (!notice) return;
    try {
      await noticesApi.deleteNotice(Number(notice.id));
      setIsDeleteOpen(false);
      navigate('/admin/notices');
    } catch (e) {
      console.error(e);
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center py-20 text-slate-400">불러오는 중...</div>;
  }

  if (notFound || !notice) {
    return (
      <>
        <PageHeader title="공지사항 상세" actions={<Button variant="secondary" onClick={() => navigate('/admin/notices')}><ArrowLeft size={16} className="mr-1.5" />목록으로</Button>} />
        <Card><p className="py-10 text-center text-slate-400">공지사항을 찾을 수 없습니다.</p></Card>
      </>
    );
  }

  return (
    <>
      {/* 삭제 확인 모달 */}
      {isDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setIsDeleteOpen(false)}>
          <div className="w-80 rounded-lg bg-white p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="mb-2 text-base font-bold text-slate-900">공지 삭제</h3>
            <p className="mb-5 text-sm text-slate-600">해당 공지사항을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.</p>
            <div className="flex justify-end gap-2">
              <button onClick={handleDelete} className="inline-flex h-10 cursor-pointer items-center justify-center rounded-md bg-rose-600 px-4 text-sm font-medium text-white transition hover:bg-rose-700">삭제</button>
              <Button variant="secondary" onClick={() => setIsDeleteOpen(false)}>취소</Button>
            </div>
          </div>
        </div>
      )}

      <PageHeader
        title="공지사항 상세"
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => navigate('/admin/notices')}><ArrowLeft size={16} className="mr-1.5" />목록으로</Button>
            {!isEditing && (
              <>
                <Button variant="secondary" onClick={handleEditOpen}>수정</Button>
                <button onClick={() => setIsDeleteOpen(true)} className="inline-flex h-10 cursor-pointer items-center justify-center rounded-md bg-rose-600 px-4 text-sm font-medium text-white transition hover:bg-rose-700">삭제</button>
              </>
            )}
          </div>
        }
      />

      {isEditing ? (
        <Card>
          <h2 className="mb-4 text-base font-semibold text-slate-900">공지 수정</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">제목</label>
              <input type="text" placeholder="공지 제목 입력" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm focus:border-[#1565C0] focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">내용</label>
              <textarea placeholder="공지 내용 입력" value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} rows={8} className="w-full resize-none rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-[#1565C0] focus:outline-none" />
            </div>
            <div className="flex items-end gap-3">
              <div className="w-40">
                <label className="mb-1 block text-sm font-medium text-slate-700">노출 시작일</label>
                <input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm focus:border-[#1565C0] focus:outline-none" />
              </div>
              <div className="w-40">
                <label className="mb-1 block text-sm font-medium text-slate-700">노출 종료일 <span className="font-normal text-slate-400">(없으면 공백)</span></label>
                <input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm focus:border-[#1565C0] focus:outline-none" />
              </div>
              <div className="w-36">
                <label className="mb-1 block text-sm font-medium text-slate-700">노출 상태</label>
                <select value={form.displayStatus} onChange={e => setForm(f => ({ ...f, displayStatus: e.target.value as '게시' | '예약' | '숨김' }))} className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm focus:border-[#1565C0] focus:outline-none">
                  <option value="게시">게시</option>
                  <option value="예약">예약</option>
                  <option value="숨김">숨김</option>
                </select>
              </div>
              <div className="flex items-center gap-2 pb-2">
                <input id="isPinned" type="checkbox" checked={form.isPinned} onChange={e => setForm(f => ({ ...f, isPinned: e.target.checked }))} className="h-4 w-4 rounded" />
                <label htmlFor="isPinned" className="cursor-pointer text-sm font-medium text-slate-700">상단 고정 (중요 공지)</label>
              </div>
            </div>
            <div className="rounded-md bg-slate-50 p-3">
              <p className="mb-1.5 text-xs font-medium text-slate-500">미리보기</p>
              <p className="text-sm font-semibold text-slate-900">{form.title ? form.title : <span className="font-normal text-slate-400">(제목을 입력하세요)</span>}</p>
              {previewDateRange && <p className="mt-0.5 text-xs text-slate-400">{previewDateRange} · {notice.authorName}</p>}
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="brand" type="submit" disabled={!form.title.trim()}>저장</Button>
              <Button variant="ghost" type="button" onClick={() => setIsEditing(false)}>취소</Button>
            </div>
          </form>
        </Card>
      ) : (
        <Card>
          <div className="mb-4 flex items-start justify-between gap-4">
            <div className="flex items-center gap-2">
              {notice.isPinned && <Pin size={16} className="shrink-0 text-rose-500" />}
              <h2 className="text-lg font-bold text-slate-900">{notice.title}</h2>
            </div>
            <StatusBadge status={notice.status} />
          </div>
          <dl className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm sm:grid-cols-4">
            <div><dt className="font-medium text-slate-500">작성자</dt><dd className="mt-0.5 text-slate-900">{notice.authorName}</dd></div>
            <div><dt className="font-medium text-slate-500">작성일</dt><dd className="mt-0.5 text-slate-900">{notice.createdAt}</dd></div>
            <div><dt className="font-medium text-slate-500">최종 수정일</dt><dd className="mt-0.5 text-slate-900">{notice.updatedAt}</dd></div>
            <div><dt className="font-medium text-slate-500">노출 기간</dt><dd className="mt-0.5 text-slate-900">{notice.startDate}{notice.endDate ? ` ~ ${notice.endDate}` : ' ~'}</dd></div>
          </dl>
          <div className="mt-5 border-t border-slate-200 pt-5">
            <div className="min-h-40 whitespace-pre-wrap text-sm leading-relaxed text-slate-800">{notice.content}</div>
          </div>
        </Card>
      )}
    </>
  );
}
