import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Pin } from 'lucide-react';
import { Card } from '../../../components/common/Card';
import { PageHeader } from '../../../components/common/PageHeader';
import { Button } from '../../../components/common/Button';

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

// GET /api/admin/notices/:id
const MOCK_NOTICES: Record<string, NoticeDetail> = {
  n1: {
    id: 'n1',
    isPinned: true,
    title: '[공지] 5월 대회 시작 안내',
    status: 'PUBLISHED',
    startDate: '05.01',
    endDate: '05.31',
    authorName: 'admin01',
    createdAt: '25.04.28',
    updatedAt: '25.04.29',
    content:
      '안녕하세요. 모의투자 플랫폼 운영팀입니다.\n\n5월 한 달간 모의투자 대회가 진행됩니다.\n\n【대회 일정】\n· 참가 신청: 2025.04.25 ~ 2025.05.01\n· 대회 기간: 2025.05.01 ~ 2025.05.31\n\n【참가 방법】\n대회 메뉴에서 참가 신청 후 자동으로 시드머니가 지급됩니다.\n\n많은 참여 바랍니다. 감사합니다.',
  },
  n2: {
    id: 'n2',
    isPinned: false,
    title: '[점검] 5/10 시스템 점검 예정',
    status: 'SCHEDULED',
    startDate: '05.09',
    endDate: '05.10',
    authorName: 'admin02',
    createdAt: '25.05.07',
    updatedAt: '25.05.07',
    content:
      '안녕하세요. 서비스 안정화를 위한 시스템 점검이 예정되어 있습니다.\n\n【점검 일시】\n2025년 5월 10일 (토) 새벽 02:00 ~ 06:00 (4시간)\n\n【점검 내용】\n· 서버 인프라 업그레이드\n· 데이터베이스 최적화\n· 보안 패치 적용\n\n점검 시간 동안 서비스 이용이 불가합니다. 양해 부탁드립니다.',
  },
  n3: {
    id: 'n3',
    isPinned: false,
    title: '[업데이트] 차트 기능 개선',
    status: 'PUBLISHED',
    startDate: '04.15',
    endDate: null,
    authorName: 'admin01',
    createdAt: '25.04.15',
    updatedAt: '25.04.20',
    content:
      '차트 기능이 대폭 개선되었습니다.\n\n【주요 변경 사항】\n· 캔들스틱 차트 추가\n· 이동평균선 (MA5, MA20, MA60) 지원\n· 거래량 차트 하단 표시\n· 차트 확대/축소 기능 개선\n\n더욱 편리해진 차트로 투자 분석에 활용해 보세요!',
  },
  n4: {
    id: 'n4',
    isPinned: false,
    title: '[이벤트] 신규 가입 이벤트 종료',
    status: 'HIDDEN',
    startDate: '04.01',
    endDate: '04.30',
    authorName: 'admin01',
    createdAt: '25.04.01',
    updatedAt: '25.04.30',
    content:
      '4월 신규 가입 이벤트가 종료되었습니다.\n\n이벤트 기간(2025.04.01 ~ 2025.04.30) 동안 가입하신 회원분들께 추가 시드머니가 지급되었습니다.\n\n다음 이벤트도 많이 기대해 주세요. 감사합니다.',
  },
};

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

// "mm.dd" → "2025-mm-dd"
function toInputDate(d: string): string {
  if (!d) return '';
  const [m, day] = d.split('.');
  return `2025-${m}-${day}`;
}

// "2025-mm-dd" → "mm.dd"
function toDisplayDate(d: string): string {
  if (!d) return '';
  const parts = d.split('-');
  if (parts.length !== 3) return '';
  return `${parts[1]}.${parts[2]}`;
}

function todayStr(): string {
  const now = new Date();
  return `${String(now.getFullYear()).slice(2)}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`;
}

function StatusBadge({ status }: { status: NoticeStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_BADGE_CLASS[status]}`}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

export function AdminNoticeDetailPage() {
  const { noticeId } = useParams<{ noticeId: string }>();
  const navigate = useNavigate();

  const initial = noticeId ? MOCK_NOTICES[noticeId] : undefined;
  const [notice, setNotice] = useState<NoticeDetail | undefined>(initial);

  const [isEditing, setIsEditing]     = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [form, setForm]               = useState<FormState>({
    title: '', content: '', startDate: '', endDate: '', displayStatus: '게시', isPinned: false,
  });

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
      startDate:     toInputDate(notice.startDate),
      endDate:       notice.endDate ? toInputDate(notice.endDate) : '',
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

  function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    if (!notice) return;
    const status = resolveStatus();
    setNotice({
      ...notice,
      title:      form.title || '(제목 없음)',
      content:    form.content,
      status,
      startDate:  toDisplayDate(form.startDate),
      endDate:    form.endDate ? toDisplayDate(form.endDate) : null,
      isPinned:   form.isPinned,
      updatedAt:  todayStr(),
    });
    setIsEditing(false);
  }

  function handleCancel() {
    setIsEditing(false);
  }

  function handleDelete() {
    // DELETE /api/admin/notices/:noticeId
    setIsDeleteOpen(false);
    navigate('/admin/notices');
  }

  if (!notice) {
    return (
      <>
        <PageHeader
          title="공지사항 상세"
          actions={
            <Button variant="secondary" onClick={() => navigate('/admin/notices')}>
              <ArrowLeft size={16} className="mr-1.5" />
              목록으로
            </Button>
          }
        />
        <Card>
          <p className="py-10 text-center text-slate-400">공지사항을 찾을 수 없습니다.</p>
        </Card>
      </>
    );
  }

  return (
    <>
      {/* 삭제 확인 모달 */}
      {isDeleteOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setIsDeleteOpen(false)}
        >
          <div
            className="w-80 rounded-lg bg-white p-6 shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="mb-2 text-base font-bold text-slate-900">공지 삭제</h3>
            <p className="mb-5 text-sm text-slate-600">
              해당 공지사항을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={handleDelete}
                className="inline-flex h-10 cursor-pointer items-center justify-center rounded-md bg-rose-600 px-4 text-sm font-medium text-white transition hover:bg-rose-700"
              >
                삭제
              </button>
              <Button variant="secondary" onClick={() => setIsDeleteOpen(false)}>
                취소
              </Button>
            </div>
          </div>
        </div>
      )}

      <PageHeader
        title="공지사항 상세"
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => navigate('/admin/notices')}>
              <ArrowLeft size={16} className="mr-1.5" />
              목록으로
            </Button>
            {!isEditing && (
              <>
                <Button variant="secondary" onClick={handleEditOpen}>
                  수정
                </Button>
                <button
                  onClick={() => setIsDeleteOpen(true)}
                  className="inline-flex h-10 cursor-pointer items-center justify-center rounded-md bg-rose-600 px-4 text-sm font-medium text-white transition hover:bg-rose-700"
                >
                  삭제
                </button>
              </>
            )}
          </div>
        }
      />

      {isEditing ? (
        /* 수정 폼 */
        <Card>
          <h2 className="mb-4 text-base font-semibold text-slate-900">공지 수정</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 제목 */}
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">제목</label>
              <input
                type="text"
                placeholder="공지 제목 입력"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm focus:border-[#1565C0] focus:outline-none"
              />
            </div>

            {/* 내용 */}
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">내용</label>
              <textarea
                placeholder="공지 내용 입력"
                value={form.content}
                onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                rows={8}
                className="w-full resize-none rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-[#1565C0] focus:outline-none"
              />
            </div>

            {/* 노출 기간 + 노출 상태 + 상단 고정 */}
            <div className="flex items-end gap-3">
              <div className="w-40">
                <label className="mb-1 block text-sm font-medium text-slate-700">노출 시작일</label>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                  className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm focus:border-[#1565C0] focus:outline-none"
                />
              </div>
              <div className="w-40">
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  노출 종료일 <span className="font-normal text-slate-400">(없으면 공백)</span>
                </label>
                <input
                  type="date"
                  value={form.endDate}
                  onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                  className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm focus:border-[#1565C0] focus:outline-none"
                />
              </div>
              <div className="w-36">
                <label className="mb-1 block text-sm font-medium text-slate-700">노출 상태</label>
                <select
                  value={form.displayStatus}
                  onChange={e => setForm(f => ({ ...f, displayStatus: e.target.value as '게시' | '예약' | '숨김' }))}
                  className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm focus:border-[#1565C0] focus:outline-none"
                >
                  <option value="게시">게시</option>
                  <option value="예약">예약</option>
                  <option value="숨김">숨김</option>
                </select>
              </div>
              <div className="flex items-center gap-2 pb-2">
                <input
                  id="isPinned"
                  type="checkbox"
                  checked={form.isPinned}
                  onChange={e => setForm(f => ({ ...f, isPinned: e.target.checked }))}
                  className="h-4 w-4 rounded"
                />
                <label htmlFor="isPinned" className="cursor-pointer text-sm font-medium text-slate-700">
                  상단 고정 (중요 공지)
                </label>
              </div>
            </div>

            {/* 미리보기 */}
            <div className="rounded-md bg-slate-50 p-3">
              <p className="mb-1.5 text-xs font-medium text-slate-500">미리보기</p>
              <p className="text-sm font-semibold text-slate-900">
                {form.title
                  ? form.title
                  : <span className="font-normal text-slate-400">(제목을 입력하세요)</span>
                }
              </p>
              {previewDateRange && (
                <p className="mt-0.5 text-xs text-slate-400">{previewDateRange} · {notice.authorName}</p>
              )}
            </div>

            {/* 액션 버튼 */}
            <div className="flex justify-end gap-3">
              <Button variant="brand" type="submit" disabled={!form.title.trim()}>
                저장
              </Button>
              <Button variant="ghost" type="button" onClick={handleCancel}>
                취소
              </Button>
            </div>
          </form>
        </Card>
      ) : (
        /* 상세 보기 */
        <Card>
          {/* 제목 + 상태 */}
          <div className="mb-4 flex items-start justify-between gap-4">
            <div className="flex items-center gap-2">
              {notice.isPinned && (
                <Pin size={16} className="shrink-0 text-rose-500" />
              )}
              <h2 className="text-lg font-bold text-slate-900">{notice.title}</h2>
            </div>
            <StatusBadge status={notice.status} />
          </div>

          {/* 메타 정보 */}
          <dl className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm sm:grid-cols-4">
            <div>
              <dt className="font-medium text-slate-500">작성자</dt>
              <dd className="mt-0.5 text-slate-900">{notice.authorName}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-500">작성일</dt>
              <dd className="mt-0.5 text-slate-900">{notice.createdAt}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-500">최종 수정일</dt>
              <dd className="mt-0.5 text-slate-900">{notice.updatedAt}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-500">노출 기간</dt>
              <dd className="mt-0.5 text-slate-900">
                {notice.startDate}{notice.endDate ? ` ~ ${notice.endDate}` : ' ~'}
              </dd>
            </div>
          </dl>

          {/* 구분선 + 본문 */}
          <div className="mt-5 border-t border-slate-200 pt-5">
            <div className="min-h-40 whitespace-pre-wrap text-sm leading-relaxed text-slate-800">
              {notice.content}
            </div>
          </div>
        </Card>
      )}
    </>
  );
}
