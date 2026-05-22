import { Card } from '../common/Card';
import { PasswordInput } from '../common/PasswordInput';
import type { ProfileEditErrors, ProfileEditFormState } from '../../types/profile';

interface PasswordChangeFormProps {
  errors: ProfileEditErrors;
  formState: ProfileEditFormState;
  onChange: (name: keyof ProfileEditFormState, value: string) => void;
}

export function PasswordChangeForm({ errors, formState, onChange }: PasswordChangeFormProps) {
  return (
    <Card className="rounded-2xl border-blue-100 p-4">
      <h2 className="mb-4 text-sm font-extrabold text-slate-950">비밀번호 변경</h2>
      <div className="space-y-3">
        <div>
          <PasswordInput
            className="h-11 rounded-xl border-blue-100 bg-[#F0F6FF] font-bold focus:border-[#1565C0]"
            label="현재 비밀번호"
            onChange={(event) => onChange('currentPassword', event.target.value)}
            placeholder="현재 비밀번호 입력"
            value={formState.currentPassword}
          />
          {errors.currentPassword ? (
            <p className="mt-1 text-xs font-bold text-red-500">{errors.currentPassword}</p>
          ) : null}
        </div>
        <div>
          <PasswordInput
            className="h-11 rounded-xl border-blue-100 bg-[#F0F6FF] font-bold focus:border-[#1565C0]"
            label="새 비밀번호 (대소문자+숫자+특수문자 10자 이상)"
            onChange={(event) => onChange('newPassword', event.target.value)}
            placeholder="새 비밀번호 입력"
            value={formState.newPassword}
          />
          {errors.newPassword ? (
            <p className="mt-1 text-xs font-bold text-red-500">{errors.newPassword}</p>
          ) : null}
        </div>
        <div>
          <PasswordInput
            className="h-11 rounded-xl border-blue-100 bg-[#F0F6FF] font-bold focus:border-[#1565C0]"
            label="새 비밀번호 확인"
            onChange={(event) => onChange('confirmPassword', event.target.value)}
            placeholder="새 비밀번호 재입력"
            value={formState.confirmPassword}
          />
          {errors.confirmPassword ? (
            <p className="mt-1 text-xs font-bold text-red-500">{errors.confirmPassword}</p>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
