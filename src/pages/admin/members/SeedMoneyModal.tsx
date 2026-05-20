import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '../../../components/common/Button';
import { TextInput } from '../../../components/common/TextInput';

interface SeedMoneyModalProps {
  isOpen: boolean;
  targetCount: number;
  onClose: () => void;
}

export function SeedMoneyModal({ isOpen, targetCount, onClose }: SeedMoneyModalProps) {
  const [amount, setAmount] = useState('');

  if (!isOpen) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // POST /api/admin/members/seed-money (batch)
    setAmount('');
    onClose();
  }

  function handleClose() {
    setAmount('');
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
            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={18} />
          </button>
        </div>

        <p className="mb-4 text-sm text-slate-600">
          선택된 <span className="font-semibold text-slate-900">{targetCount}명</span>에게 지급할 금액을 입력하세요.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <TextInput
            label="지급 금액 (원)"
            type="number"
            placeholder="예: 1000000"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            min="1"
            required
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" type="button" onClick={handleClose}>
              취소
            </Button>
            <Button variant="brand" type="submit">
              지급
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
