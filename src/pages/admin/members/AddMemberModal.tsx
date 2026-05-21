import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '../../../components/common/Button';
import { TextInput } from '../../../components/common/TextInput';
import { PasswordInput } from '../../../components/common/PasswordInput';

interface AddMemberForm {
  nickname: string;
  email: string;
  accountId: string;
  password: string;
}

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const INITIAL_FORM: AddMemberForm = {
  nickname: '',
  email: '',
  accountId: '',
  password: '',
};

export function AddMemberModal({ isOpen, onClose }: AddMemberModalProps) {
  const [form, setForm] = useState<AddMemberForm>(INITIAL_FORM);

  if (!isOpen) return null;

  function handleChange(field: keyof AddMemberForm, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // POST /api/admin/members
    setForm(INITIAL_FORM);
    onClose();
  }

  function handleClose() {
    setForm(INITIAL_FORM);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={handleClose}
    >
      <div
        className="w-[480px] rounded-lg bg-white p-6 shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">회원 직접 추가</h2>
          <button
            onClick={handleClose}
            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <TextInput
            label="닉네임"
            placeholder="닉네임 입력"
            value={form.nickname}
            onChange={e => handleChange('nickname', e.target.value)}
            required
          />
          <TextInput
            label="이메일"
            type="email"
            placeholder="이메일 입력"
            value={form.email}
            onChange={e => handleChange('email', e.target.value)}
            required
          />
          <TextInput
            label="아이디"
            placeholder="아이디 입력"
            value={form.accountId}
            onChange={e => handleChange('accountId', e.target.value)}
            required
          />
          <PasswordInput
            label="초기 비밀번호"
            placeholder="비밀번호 입력"
            value={form.password}
            onChange={e => handleChange('password', e.target.value)}
            required
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" type="button" onClick={handleClose}>
              취소
            </Button>
            <Button variant="brand" type="submit">
              추가
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
