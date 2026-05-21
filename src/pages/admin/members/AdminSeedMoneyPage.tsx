import { useState } from 'react';
import { Download, ChevronLeft, ChevronRight, AlertTriangle, Search } from 'lucide-react';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';

type PaymentType = '이벤트 당첨' | '보상' | '상금' | '기타';

interface MemberSearchResult {
  id: string;
  nickname: string;
  accountId: string;
  email: string;
  status: '활성' | '정지';
  balance: number;
}

interface PaymentRecord {
  id: string;
  recipientNickname: string;
  amount: number;
  type: PaymentType;
  reason: string;
  adminName: string;
  paidAt: string;
}

const MOCK_MEMBER: MemberSearchResult = {
  id: 'm1',
  nickname: '홍길동',
  accountId: 'user001',
  email: 'hong**@naver.com',
  status: '활성',
  balance: 11245320,
};

// GET /api/admin/seed-money/history
const MOCK_PAYMENTS: PaymentRecord[] = [
  { id: 'p1', recipientNickname: '홍길동', amount: 1000000, type: '이벤트 당첨', reason: '이벤트 당첨', adminName: 'admin01', paidAt: '25.05.07 11:15' },
  { id: 'p2', recipientNickname: '김철수', amount: 500000, type: '보상', reason: '서비스 오류 보상', adminName: 'admin02', paidAt: '25.05.03 14:22' },
  { id: 'p3', recipientNickname: '최수진', amount: 2000000, type: '상금', reason: '4월 대회 우승 상금', adminName: 'admin01', paidAt: '25.04.30 17:00' },
  { id: 'p4', recipientNickname: '박민준', amount: 500000, type: '보상', reason: '주문 오류 보상', adminName: 'admin01', paidAt: '25.04.20 10:30' },
  { id: 'p5', recipientNickname: '정재현', amount: 1500000, type: '이벤트 당첨', reason: '신규 이벤트 당첨', adminName: 'admin02', paidAt: '25.04.15 09:00' },
];

const SUMMARY_STATS = {
  thisMonthCount: 8,
  thisMonthTotal: 14500000,
  todayCount: 2,
  todayTotal: 1500000,
  autoResetToday: 34,
};

const PAGE_SIZE = 5;

const TYPE_BADGE_CLASS: Record<PaymentType, string> = {
  '이벤트 당첨': 'bg-amber-100 text-amber-600',
  '보상': 'bg-[#E8F0FE] text-[#1565C0]',
  '상금': 'bg-rose-100 text-rose-600',
  '기타': 'bg-slate-100 text-slate-600',
};

function TypeBadge({ type }: { type: PaymentType }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${TYPE_BADGE_CLASS[type]}`}>
      {type}
    </span>
  );
}

function formatAmount(amount: number) {
  return amount.toLocaleString('ko-KR') + '원';
}

export function AdminSeedMoneyPage() {
  const [memberQuery, setMemberQuery] = useState('');
  const [foundMember, setFoundMember] = useState<MemberSearchResult | null>(null);

  const [amount, setAmount] = useState('');
  const [paymentType, setPaymentType] = useState<PaymentType>('이벤트 당첨');
  const [reason, setReason] = useState('');

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(MOCK_PAYMENTS.length / PAGE_SIZE));
  const paginated = MOCK_PAYMENTS.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function handleMemberSearch() {
    // GET /api/admin/members/search?q={memberQuery}
    if (memberQuery.trim()) {
      setFoundMember(MOCK_MEMBER);
    }
  }

  function handleMemberQueryKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleMemberSearch();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsConfirmOpen(true);
  }

  function handleConfirm() {
    // POST /api/admin/seed-money
    setIsConfirmOpen(false);
    handleReset();
  }

  function handleReset() {
    setMemberQuery('');
    setFoundMember(null);
    setAmount('');
    setPaymentType('이벤트 당첨');
    setReason('');
  }

  return (
    <>
      {/* 확인 모달 */}
      {isConfirmOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setIsConfirmOpen(false)}
        >
          <div
            className="w-105 rounded-lg bg-white p-6 shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="mb-4 text-base font-bold text-slate-900">지급 내용 확인</h3>
            <div className="mb-5 space-y-3 rounded-md bg-slate-50 p-4 text-sm">
              <div className="flex gap-2">
                <span className="w-24 shrink-0 text-slate-500">대상 회원</span>
                <span className="font-medium text-slate-900">{foundMember?.nickname} ({foundMember?.accountId})</span>
              </div>
              <div className="flex gap-2">
                <span className="w-24 shrink-0 text-slate-500">지급 금액</span>
                <span className="font-semibold text-[#1565C0]">
                  +{Number(amount).toLocaleString('ko-KR')}원
                </span>
              </div>
              <div className="flex gap-2">
                <span className="w-24 shrink-0 text-slate-500">지급 유형</span>
                <TypeBadge type={paymentType} />
              </div>
              <div className="flex gap-2">
                <span className="w-24 shrink-0 text-slate-500">사유</span>
                <span className="text-slate-700">{reason}</span>
              </div>
            </div>
            <div className="mb-5 flex gap-2 rounded-md bg-amber-50 p-3 text-xs text-amber-700">
              <AlertTriangle size={14} className="mt-0.5 shrink-0" />
              <p>지급 즉시 회원 계좌에 반영됩니다. 지급 내역은 감사 로그에 자동 기록됩니다.</p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" type="button" onClick={() => setIsConfirmOpen(false)}>
                취소
              </Button>
              <Button variant="brand" type="button" onClick={handleConfirm}>
                확인 후 지급
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 요약 카드 */}
      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <p className="text-sm text-slate-500">이번 달 총 지급</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{SUMMARY_STATS.thisMonthCount}건</p>
          <p className="mt-0.5 text-xs text-slate-400">총 {(SUMMARY_STATS.thisMonthTotal / 10000).toLocaleString('ko-KR')}만원</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">오늘 지급</p>
          <p className="mt-1 text-2xl font-bold text-[#1565C0]">{SUMMARY_STATS.todayCount}건</p>
          <p className="mt-0.5 text-xs text-slate-400">총 {(SUMMARY_STATS.todayTotal / 10000).toLocaleString('ko-KR')}만원</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">자동 초기화 건수 (오늘)</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{SUMMARY_STATS.autoResetToday}건</p>
          <p className="mt-0.5 text-xs text-slate-400">회원 자동 초기화</p>
        </Card>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* 왼쪽: 시드머니 수동 지급 폼 */}
        <div className="lg:col-span-2">
          <Card>
            <h2 className="mb-5 text-base font-semibold text-slate-900">시드머니 수동 지급</h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* 대상 회원 검색 */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  대상 회원
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="닉네임 또는 이메일 입력"
                    value={memberQuery}
                    onChange={e => setMemberQuery(e.target.value)}
                    onKeyDown={handleMemberQueryKeyDown}
                    className="flex-1 rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#1565C0] focus:ring-1 focus:ring-[#1565C0]"
                  />
                  <button
                    type="button"
                    onClick={handleMemberSearch}
                    className="flex items-center gap-1.5 rounded-md bg-[#1565C0] px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
                  >
                    <Search size={14} />
                    회원 찾기
                  </button>
                </div>

                {/* 검색 결과 카드 */}
                {foundMember && (
                  <div className="mt-2 flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex size-8 items-center justify-center rounded-full bg-[#1565C0] text-sm font-bold text-white">
                        {foundMember.nickname[0]}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {foundMember.nickname} ({foundMember.accountId})
                        </p>
                        <p className="text-xs text-slate-400">
                          {foundMember.email} · 현재 잔고 {foundMember.balance.toLocaleString('ko-KR')}원
                        </p>
                      </div>
                    </div>
                    <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-600">
                      {foundMember.status}
                    </span>
                  </div>
                )}
              </div>

              {/* 지급 금액 + 지급 유형 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    지급 금액 (원)
                  </label>
                  <input
                    type="number"
                    placeholder="예) 1,000,000"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    min="1"
                    required
                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#1565C0] focus:ring-1 focus:ring-[#1565C0]"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    지급 유형
                  </label>
                  <select
                    value={paymentType}
                    onChange={e => setPaymentType(e.target.value as PaymentType)}
                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#1565C0] focus:ring-1 focus:ring-[#1565C0]"
                  >
                    <option value="이벤트 당첨">이벤트 당첨</option>
                    <option value="보상">보상</option>
                    <option value="상금">상금</option>
                    <option value="기타">기타</option>
                  </select>
                </div>
              </div>

              {/* 지급 사유 */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  지급 사유 (필수)
                </label>
                <textarea
                  placeholder="지급 사유를 상세히 입력하세요"
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  required
                  rows={4}
                  className="w-full resize-none rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#1565C0] focus:ring-1 focus:ring-[#1565C0]"
                />
              </div>

              {/* 안내 문구 */}
              <div className="flex gap-2 rounded-md bg-amber-50 p-3 text-xs text-amber-700">
                <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                <p>지급 즉시 회원 계좌에 반영됩니다. 지급 내역은 감사 로그에 자동 기록됩니다.</p>
              </div>

              {/* 버튼 */}
              <div className="flex gap-2">
                <Button
                  variant="brand"
                  type="submit"
                  disabled={!foundMember}
                  className="flex-1"
                >
                  지급하기
                </Button>
                <Button variant="secondary" type="button" onClick={handleReset}>
                  초기화
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* 오른쪽: 최근 지급 이력 */}
        <div className="lg:col-span-3">
          <Card>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900">최근 지급 이력</h2>
              <button
                onClick={() => {/* GET /api/admin/seed-money/export */}}
                className="flex items-center gap-1.5 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                <Download size={13} />
                내보내기
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs text-slate-500">
                    <th className="whitespace-nowrap pb-2 pr-4 text-center font-medium">수령 회원</th>
                    <th className="whitespace-nowrap pb-2 pr-4 text-center font-medium">금액</th>
                    <th className="whitespace-nowrap pb-2 pr-4 text-center font-medium">유형</th>
                    <th className="whitespace-nowrap pb-2 pr-4 text-center font-medium">사유</th>
                    <th className="whitespace-nowrap pb-2 pr-4 text-center font-medium">지급 관리자</th>
                    <th className="whitespace-nowrap pb-2 text-center font-medium">일시</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginated.map(record => (
                    <tr key={record.id} className="hover:bg-slate-50">
                      <td className="whitespace-nowrap py-3 pr-4 text-center font-medium text-slate-900">
                        {record.recipientNickname}
                      </td>
                      <td className="whitespace-nowrap py-3 pr-4 text-center font-medium text-[#1565C0]">
                        +{formatAmount(record.amount)}
                      </td>
                      <td className="py-3 pr-4 text-center">
                        <TypeBadge type={record.type} />
                      </td>
                      <td className="py-3 pr-4 text-center">
                        {record.reason}
                      </td>
                      <td className="whitespace-nowrap py-3 pr-4 text-center text-slate-500">{record.adminName}</td>
                      <td className="whitespace-nowrap py-3 text-center text-xs text-slate-400">{record.paidAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 페이지네이션 */}
            <div className="mt-4 flex items-center justify-between">
              <p className="text-xs text-slate-500">총 {MOCK_PAYMENTS.length}건</p>
              <div className="flex items-center gap-1">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                  className="rounded p-1 text-slate-500 hover:bg-slate-100 disabled:opacity-40"
                >
                  <ChevronLeft size={15} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`rounded px-2.5 py-0.5 text-sm ${
                      page === currentPage
                        ? 'bg-[#1565C0] text-white'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => p + 1)}
                  className="rounded p-1 text-slate-500 hover:bg-slate-100 disabled:opacity-40"
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
