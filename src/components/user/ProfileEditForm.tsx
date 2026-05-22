import { Card } from '../common/Card';
import { TextInput } from '../common/TextInput';
import type { ProfileEditErrors, ProfileEditFormState } from '../../types/profile';

interface ProfileEditFormProps {
  errors: ProfileEditErrors;
  formState: ProfileEditFormState;
  onChange: (name: keyof ProfileEditFormState, value: string) => void;
}

export function ProfileEditForm({
  errors,
  formState,
  onChange,
}: ProfileEditFormProps) {
  return (
    <Card className="rounded-2xl border-blue-100 p-4">
      <h2 className="mb-4 text-sm font-extrabold text-slate-950">기본 정보</h2>
      <div className="space-y-3">
        <div>
          <TextInput
            className="h-11 rounded-xl border-blue-100 bg-[#F0F6FF] font-bold focus:border-[#1565C0]"
            label="닉네임"
            onChange={(event) => onChange('nickname', event.target.value)}
            value={formState.nickname}
          />
          {errors.nickname ? <p className="mt-1 text-xs font-bold text-red-500">{errors.nickname}</p> : null}
        </div>

        <div>
          <TextInput
            className="h-11 rounded-xl border-blue-100 bg-[#F0F6FF] font-bold focus:border-[#1565C0]"
            inputMode="numeric"
            label="전화번호"
            onChange={(event) => onChange('phone', event.target.value)}
            value={formState.phone}
          />
          {errors.phone ? <p className="mt-1 text-xs font-bold text-red-500">{errors.phone}</p> : null}
        </div>

        <div>
          <span className="mb-2 block text-sm font-medium text-slate-700">이메일</span>
          <div className="flex gap-2">
            <input
              className="h-11 min-w-0 flex-1 cursor-not-allowed rounded-xl border border-blue-100 bg-slate-100 px-3 text-sm font-bold text-slate-500 outline-none"
              readOnly
              type="email"
              value={formState.email}
            />
          </div>
          {errors.email ? <p className="mt-1 text-xs font-bold text-red-500">{errors.email}</p> : null}
          <p className="mt-2 text-xs font-extrabold text-emerald-600">이메일 인증 완료</p>
        </div>
      </div>
    </Card>
  );
}
