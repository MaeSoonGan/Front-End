import { useState, useEffect, useCallback } from 'react';
import { Download, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, AlertTriangle, Search, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { getPaginationPages } from '../../../utils/pagination';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { useAdminPageActions } from '../../../contexts/AdminPageActionsContext';
import { membersApi } from '../../../api/admin/members';
import { downloadCsv } from '../../../utils/download';

type PaymentType = '이벤트 당첨' | '보상' | '상금' | '기타';
type SortField = 'amount' | 'paidAt' | null;
type SortDir = 'asc' | 'desc' | null;

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

function isoToPaidAt(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${String(d.getFullYear()).slice(2)}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const PAGE_SIZE = 8;

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

function formatAmountMan(amount: number) {
  return (amount / 10000).toLocaleString('ko-KR') + '만원';
}

function SortIcon({ field, currentField, dir }: { field: SortField; currentField: SortField; dir: SortDir }) {
  if (currentField !== field || !dir) return <ChevronsUpDown size={13} className="ml-1 inline opacity-30" />;
  return dir === 'asc'
    ? <ChevronUp size={13} className="ml-1 inline text-[#1565C0]" />
    : <ChevronDown size={13} className="ml-1 inline text-[#1565C0]" />;
}

export function AdminSeedMoneyPage() {
  const [payments, setPayments]   = useState<PaymentRecord[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [summary, setSummary]     = useState({ thisMonthCount: 0, thisMonthTotal: 0, todayCount: 0, todayTotal: 0, autoResetToday: 0 });
  const [memberQuery, setMemberQuery] = useState('');
  const [searchResults, setSearchResults] = useState<MemberSearchResult[]>([]);
  const [foundMember, setFoundMember] = useState<MemberSearchResult | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [amount, setAmount]         = useState('');
  const [paymentType, setPaymentType] = useState<PaymentType>('이벤트 당첨');
  const [reason, setReason]         = useState('');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField]   = useState<SortField>(null);
  const [sortDir, setSortDir]       = useState<SortDir>(null);

  const fetchPayments = useCallback(async () => {
    try {
      const data = await membersApi.getSeedPayments({
        page: currentPage - 1,
        size: PAGE_SIZE,
        sort: sortField && sortDir ? `${sortField},${sortDir}` : undefined,
      });
      setPayments(
        (data.content ?? []).map((p: any) => ({
          id:                String(p.seedHistoryId),
          recipientNickname: p.nickname ?? '',
          amount:            p.amount ?? 0,
          type:              '기타' as PaymentType,
          reason:            p.reason ?? '',
          adminName:         p.adminName ?? '',
          paidAt:            isoToPaidAt(p.createdAt),
        }))
      );
      setTotalPages(data.totalPages ?? 1);
    } catch (e) { console.error(e); }
  }, [currentPage, sortField, sortDir]);

  useEffect(() => { fetchPayments(); }, [fetchPayments]);

  useEffect(() => {
    membersApi.getSeedPaymentSummary()
      .then(data => setSummary({
        thisMonthCount: data.totalPaymentCount ?? 0,
        thisMonthTotal: data.totalPaymentAmount ?? 0,
        todayCount:     data.todayPaymentCount ?? 0,
        todayTotal:     data.todayPaymentAmount ?? 0,
        autoResetToday: 0,
      }))
      .catch(console.error);
  }, []);

  async function handleCsvExport() {
    try {
      const blob = await membersApi.exportSeedPayments();
      downloadCsv(blob, 'seed-payments');
    } catch (e) { console.error(e); }
  }

  useAdminPageActions(
    <Button variant="secondary" className="h-9 gap-1.5 text-sm" onClick={handleCsvExport}>
      <Download size={14} />
      CSV 내보내기
    </Button>
  );

  const actualAmount = amount ? Number(amount) * 10000 : 0;

  // 정렬은 서버에서 전체 데이터 기준으로 처리됨(fetchPayments의 sort 파라미터)
  const sortedPayments = payments;

  const safePage = Math.min(currentPage, totalPages);
  const paginated = sortedPayments;

  function handleSort(field: SortField) {
    if (sortField !== field) { setSortField(field); setSortDir('asc'); }
    else if (sortDir === 'asc') { setSortDir('desc'); }
    else { setSortField(null); setSortDir(null); }
    setCurrentPage(1);
  }

  async function handleMemberSearch() {
    if (!memberQuery.trim()) return;
    try {
      const data = await membersApi.searchMembers({ keyword: memberQuery, limit: 5 });
      const results: MemberSearchResult[] = (data ?? []).map((m: any) => ({
        id:       String(m.memberId),
        nickname: m.nickname ?? '',
        accountId: m.accountId ?? '',
        email:    m.email ?? '',
        status:   m.status === 'ACTIVE' ? '활성' : '정지',
        balance:  0,
      }));
      setSearchResults(results);
      setDropdownOpen(results.length > 0);
    } catch (e) { console.error(e); }
  }

  function handleMemberSelect(member: MemberSearchResult) {
    setMemberQuery(member.nickname);
    setFoundMember(member);
    setDropdownOpen(false);
  }

  function handleMemberQueryKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleMemberSearch();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsConfirmOpen(true);
  }

  async function handleConfirm() {
    if (!foundMember) return;
    try {
      await membersApi.paySeedMoney({
        memberIds: [Number(foundMember.id)],
        contestId: 0,
        amount:    actualAmount,
        reason,
      });
      setIsConfirmOpen(false);
      handleReset();
      fetchPayments();
    } catch (e) { console.error(e); }
  }

  function handleReset() {
    setMemberQuery('');
    setFoundMember(null);
    setSearchResults([]);
    setDropdownOpen(false);
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
                  +{Number(amount).toLocaleString('ko-KR')}만원 ({actualAmount.toLocaleString('ko-KR')}원)
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
              <Button variant="brand" type="button" onClick={handleConfirm}>
                확인 후 지급
              </Button>
              <Button variant="secondary" type="button" onClick={() => setIsConfirmOpen(false)}>
                취소
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 요약 카드 */}
      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <p className="text-sm text-slate-500">전체 총 지급</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{summary.thisMonthCount}건</p>
          <p className="mt-0.5 text-xs text-slate-400">총 {(summary.thisMonthTotal / 10000).toLocaleString('ko-KR')}만원</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">오늘 지급</p>
          <p className="mt-1 text-2xl font-bold text-[#1565C0]">{summary.todayCount}건</p>
          <p className="mt-0.5 text-xs text-slate-400">총 {(summary.todayTotal / 10000).toLocaleString('ko-KR')}만원</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">자동 초기화 건수 (오늘)</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{summary.autoResetToday}건</p>
          <p className="mt-0.5 text-xs text-slate-400">회원 자동 초기화</p>
        </Card>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="grid items-stretch gap-6 lg:grid-cols-5">
        {/* 왼쪽: 최근 지급 이력 */}
        <div className="flex flex-col lg:col-span-3">
          <Card className="flex flex-1 flex-col">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900">최근 지급 이력</h2>
            </div>

            <div className="flex-1 overflow-x-auto overflow-y-hidden">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs text-slate-500">
                    <th className="whitespace-nowrap pb-2 pr-4 text-center font-medium">수령 회원</th>
                    <th
                      className="cursor-pointer whitespace-nowrap pb-2 pr-4 text-center font-medium hover:text-slate-700"
                      onClick={() => handleSort('amount')}
                    >
                      금액<SortIcon field="amount" currentField={sortField} dir={sortDir} />
                    </th>
                    <th className="whitespace-nowrap pb-2 pr-4 text-center font-medium">유형</th>
                    <th className="whitespace-nowrap pb-2 pr-4 text-center font-medium">사유</th>
                    <th className="whitespace-nowrap pb-2 pr-4 text-center font-medium">지급 관리자</th>
                    <th
                      className="cursor-pointer whitespace-nowrap pb-2 text-center font-medium hover:text-slate-700"
                      onClick={() => handleSort('paidAt')}
                    >
                      일시<SortIcon field="paidAt" currentField={sortField} dir={sortDir} />
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginated.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-3 text-center text-slate-400">
                        지급 이력이 없습니다.
                      </td>
                    </tr>
                  )}
                  {paginated.map(record => (
                    <tr key={record.id} className="cursor-pointer hover:bg-slate-50">
                      <td className="whitespace-nowrap py-3 pr-4 text-center font-medium text-slate-900">
                        {record.recipientNickname}
                      </td>
                      <td className="whitespace-nowrap py-3 pr-4 text-center font-medium text-[#1565C0]">
                        +{formatAmountMan(record.amount)}
                      </td>
                      <td className="py-3 pr-4 text-center">
                        <TypeBadge type={record.type} />
                      </td>
                      <td className="py-3 pr-4 text-center text-slate-700">
                        {record.reason}
                      </td>
                      <td className="whitespace-nowrap py-3 pr-4 text-center text-slate-500">{record.adminName}</td>
                      <td className="whitespace-nowrap py-3 text-center text-xs text-slate-400">{record.paidAt}</td>
                    </tr>
                  ))}
                  {Array.from({ length: Math.max(0, PAGE_SIZE - (paginated.length === 0 ? 1 : paginated.length)) }).map((_, i) => (
                    <tr key={`ghost-${i}`}>
                      <td colSpan={6} className="py-3 pr-4">
                        <span className="invisible select-none text-sm leading-5">x</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 페이지네이션 */}
            <div className="mt-4 flex items-center justify-center">
              <div className="flex items-center gap-1">
                <button onClick={() => setCurrentPage(1)} disabled={safePage === 1} className="cursor-pointer rounded p-1 text-slate-500 hover:bg-slate-100 disabled:cursor-default disabled:opacity-40"><ChevronsLeft size={15} /></button>
                <button disabled={safePage === 1} onClick={() => setCurrentPage(p => p - 1)} className="cursor-pointer rounded p-1 text-slate-500 hover:bg-slate-100 disabled:cursor-default disabled:opacity-40"><ChevronLeft size={15} /></button>
                {getPaginationPages(safePage, totalPages).map(page => (
                  <button key={page} onClick={() => setCurrentPage(page)} className={`cursor-pointer rounded px-2.5 py-0.5 text-sm ${page === safePage ? 'bg-[#1565C0] text-white' : 'text-slate-600 hover:bg-slate-100'}`}>{page}</button>
                ))}
                <button disabled={safePage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="cursor-pointer rounded p-1 text-slate-500 hover:bg-slate-100 disabled:cursor-default disabled:opacity-40"><ChevronRight size={15} /></button>
                <button onClick={() => setCurrentPage(totalPages)} disabled={safePage === totalPages} className="cursor-pointer rounded p-1 text-slate-500 hover:bg-slate-100 disabled:cursor-default disabled:opacity-40"><ChevronsRight size={15} /></button>
              </div>
            </div>
          </Card>
        </div>

        {/* 오른쪽: 시드머니 수동 지급 폼 */}
        <div className="flex flex-col lg:col-span-2">
          <Card className="flex flex-1 flex-col">
            <h2 className="mb-6 text-base font-semibold text-slate-900">시드머니 수동 지급</h2>

            <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-6">
              {/* 대상 회원 검색 */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  대상 회원
                </label>
                <div className="relative">
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
                      className="flex cursor-pointer items-center gap-1.5 rounded-md bg-[#1565C0] px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
                    >
                      <Search size={14} />
                      회원 찾기
                    </button>
                  </div>

                  {/* 검색 결과 — absolute 드롭다운 */}
                  {dropdownOpen && searchResults.length > 0 && (
                    <div className="absolute left-0 right-0 top-full z-20 mt-1 rounded-md border border-slate-200 bg-white shadow-md">
                      {searchResults.map(m => (
                        <div key={m.id} className="flex cursor-pointer items-center justify-between px-4 py-3 hover:border-[#1565C0] hover:bg-[#E8F0FE]" onClick={() => handleMemberSelect(m)}>
                          <div className="flex items-center gap-3">
                            <div className="flex size-8 items-center justify-center rounded-full bg-[#1565C0] text-sm font-bold text-white">{m.nickname[0]}</div>
                            <div>
                              <p className="text-sm font-semibold text-slate-900">{m.nickname} ({m.accountId})</p>
                              <p className="text-xs text-slate-400">{m.email}</p>
                            </div>
                          </div>
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${m.status === '활성' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>{m.status}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* 지급 금액 + 지급 유형 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    지급 금액 (만원)
                  </label>
                  <input
                    type="number"
                    placeholder="예) 100"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    min="1"
                    required
                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#1565C0] focus:ring-1 focus:ring-[#1565C0]"
                  />
                  <p className={`mt-1 text-xs text-slate-400 ${amount ? 'visible' : 'invisible'}`}>
                    실제 지급액: {actualAmount.toLocaleString('ko-KR')}원
                  </p>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    지급 유형
                  </label>
                  <select
                    value={paymentType}
                    onChange={e => setPaymentType(e.target.value as PaymentType)}
                    className="w-full cursor-pointer rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#1565C0] focus:ring-1 focus:ring-[#1565C0]"
                  >
                    <option value="이벤트 당첨">이벤트 당첨</option>
                    <option value="보상">보상</option>
                    <option value="상금">상금</option>
                    <option value="기타">기타</option>
                  </select>
                </div>
              </div>

              {/* 지급 사유 */}
              <div className="flex flex-1 flex-col">
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  지급 사유 (필수)
                </label>
                <textarea
                  placeholder="지급 사유를 상세히 입력하세요"
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  required
                  className="flex-1 resize-none rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#1565C0] focus:ring-1 focus:ring-[#1565C0]"
                />
              </div>

              {/* 안내 문구 */}
              <div className="flex gap-2 rounded-md bg-amber-50 p-3 text-xs text-amber-700">
                <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                <p>지급 즉시 회원 계좌에 반영됩니다. 지급 내역은 감사 로그에 자동 기록됩니다.</p>
              </div>

              {/* 버튼 */}
              <div className="mt-auto flex gap-2">
                <Button
                  variant="brand"
                  type="submit"
                  disabled={!foundMember || !amount.trim() || !reason.trim()}
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
      </div>
    </>
  );
}
