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
  onAdd: (member: { nickname: string; email: string; accountId: string }) => void;
}

const INITIAL_FORM: AddMemberForm = {
  nickname: '',
  email: '',
  accountId: '',
  password: '',
};

export function AddMemberModal({ isOpen, onClose, onAdd }: AddMemberModalProps) {
  const [form, setForm] = useState<AddMemberForm>(INITIAL_FORM);
  const [showConfirm, setShowConfirm] = useState(false);

  if (!isOpen) return null;

  const isFormComplete =
    form.nickname.trim() !== '' &&
    form.email.trim() !== '' &&
    form.accountId.trim() !== '' &&
    form.password.trim() !== '';

  function handleChange(field: keyof AddMemberForm, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function handleSubmitClick(e: React.FormEvent) {
    e.preventDefault();
    setShowConfirm(true);
  }

  function handleConfirm() {
    // POST /api/admin/members
    onAdd({ nickname: form.nickname, email: form.email, accountId: form.accountId });
    setForm(INITIAL_FORM);
    setShowConfirm(false);
    onClose();
  }

  function handleClose() {
    setForm(INITIAL_FORM);
    setShowConfirm(false);
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
            className="cursor-pointer rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={18} />
          </button>
        </div>

        {showConfirm ? (
          <div>
            <p className="mb-1 text-sm text-slate-700">다음 정보로 회원을 추가합니다.</p>
            <div className="mb-5 space-y-2 rounded-md bg-slate-50 p-4 text-sm">
              <div className="flex gap-2">
                <span className="w-24 shrink-0 text-slate-500">닉네임</span>
                <span className="font-medium text-slate-900">{form.nickname}</span>
              </div>
              <div className="flex gap-2">
                <span className="w-24 shrink-0 text-slate-500">이메일</span>
                <span className="font-medium text-slate-900">{form.email}</span>
              </div>
              <div className="flex gap-2">
                <span className="w-24 shrink-0 text-slate-500">아이디</span>
                <span className="font-medium text-slate-900">{form.accountId}</span>
              </div>
            </div>
            <p className="mb-4 text-sm font-medium text-slate-700">정말 추가하시겠습니까?</p>
            <div className="flex justify-end gap-2">
              <Button variant="brand" type="button" onClick={handleConfirm}>
                추가 확인
              </Button>
              <Button variant="secondary" type="button" onClick={() => setShowConfirm(false)}>
                돌아가기
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmitClick} className="space-y-4">
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
              <Button variant="brand" type="submit" disabled={!isFormComplete}>
                추가
              </Button>
              <Button variant="secondary" type="button" onClick={handleClose}>
                취소
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
