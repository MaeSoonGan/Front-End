import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '../../../components/common/Button';
import { TextInput } from '../../../components/common/TextInput';
import { membersApi } from '../../../api/admin/members';

interface SeedMoneyModalProps {
  isOpen: boolean;
  targetCount: number;
  memberIds: number[];
  onClose: () => void;
  onSuccess: () => void;
}

export function SeedMoneyModal({ isOpen, targetCount, memberIds, onClose, onSuccess }: SeedMoneyModalProps) {
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const actualAmount = amount ? Number(amount) * 10000 : 0;

  function reset() {
    setAmount('');
    setReason('');
    setError('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    if (memberIds.length === 0) {
      setError('선택된 회원이 없습니다.');
      return;
    }
    if (actualAmount <= 0) {
      setError('지급 금액을 입력하세요.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      // 다중선택 일괄 지급은 모든 회원 공통인 일반(기본) 계좌(contestId 0)에 지급
      await membersApi.paySeedMoney({
        memberIds,
        contestId: 0,
        amount: actualAmount,
        reason: reason.trim() || `시드머니 ${actualAmount.toLocaleString()}원 지급`,
      });
      reset();
      onSuccess();
    } catch {
      setError('시드머니 지급에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  }

  function handleClose() {
    if (submitting) return;
    reset();
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={handleClose}
    >
      <div
        className="w-[400px] rounded-lg bg-white p-6 shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">시드머니 지급</h2>
          <button
            onClick={handleClose}
            className="cursor-pointer rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={18} />
          </button>
        </div>

        <p className="mb-4 text-sm text-slate-600">
          선택된 <span className="font-semibold text-slate-900">{targetCount}명</span>의 일반(기본) 계좌에 지급할 금액을 입력하세요.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <TextInput
            label="지급 금액 (만원)"
            type="number"
            placeholder="예: 100"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            min="1"
            required
          />
          {amount && (
            <p className="text-xs text-slate-500">
              실제 지급액: {actualAmount.toLocaleString()}원
            </p>
          )}

          <TextInput
            label="사유 (선택)"
            placeholder="예: 이벤트 보상"
            value={reason}
            onChange={e => setReason(e.target.value)}
          />

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="brand" type="submit" disabled={submitting}>
              {submitting ? '지급 중...' : '지급'}
            </Button>
            <Button variant="secondary" type="button" onClick={handleClose} disabled={submitting}>
              취소
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
