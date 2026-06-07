import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { PageContainer } from '../../components/common/PageContainer';
import { PasswordInput } from '../../components/common/PasswordInput';
import { PasswordChangeForm } from '../../components/user/PasswordChangeForm';
import { ProfileEditForm } from '../../components/user/ProfileEditForm';
import { ProfileImageUploader } from '../../components/user/ProfileImageUploader';
import { membersApi } from '../../api/user/members';
import { parseApiError } from '../../api/parseApiError';
import { clearTokens } from '../../utils/tokenStorage';
import type { ProfileEditErrors, ProfileEditFormState } from '../../types/profile';

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{10,}$/;
const PHONE_REGEX = /^010-\d{4}-\d{4}$/;

function formatPhone(value: string) {
  const numbers = value.replace(/\D/g, '').slice(0, 11);

  if (numbers.length <= 3) {
    return numbers;
  }

  if (numbers.length <= 7) {
    return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
  }

  return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7)}`;
}

const EMPTY_FORM: ProfileEditFormState = {
  nickname: '',
  phone: '',
  email: '',
  profileImage: null,
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
};

export function ProfileEditPage() {
  const navigate = useNavigate();
  const [formState, setFormState] = useState<ProfileEditFormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<ProfileEditErrors>({});
  const [successMessage, setSuccessMessage] = useState('');
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawPassword, setWithdrawPassword] = useState('');
  const [withdrawError, setWithdrawError] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    membersApi.getMyProfile()
      .then(data => {
        setFormState({
          nickname: data.nickname ?? '',
          phone: data.phone ?? '',
          email: data.email ?? '',
          profileImage: data.profileImageUrl ?? null,
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      })
      .catch(e => setErrors({ form: parseApiError(e) }))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (name: keyof ProfileEditFormState, value: string) => {
    setSuccessMessage('');
    setErrors((current) => ({ ...current, [name]: undefined }));
    setFormState((current) => ({
      ...current,
      [name]: name === 'phone' ? formatPhone(value) : value,
    }));
  };

  const validateForm = () => {
    const nextErrors: ProfileEditErrors = {};
    const hasPasswordInput =
      Boolean(formState.currentPassword) ||
      Boolean(formState.newPassword) ||
      Boolean(formState.confirmPassword);

    if (!formState.nickname.trim()) {
      nextErrors.nickname = '닉네임을 입력해주세요';
    } else if (formState.nickname.trim().length < 2 || formState.nickname.trim().length > 10) {
      nextErrors.nickname = '닉네임은 2~10자로 입력해주세요';
    }

    if (!PHONE_REGEX.test(formState.phone)) {
      nextErrors.phone = '올바른 전화번호 형식으로 입력해주세요';
    }

    if (hasPasswordInput) {
      if (!formState.currentPassword) {
        nextErrors.currentPassword = '현재 비밀번호를 입력해주세요';
      }

      if (!PASSWORD_REGEX.test(formState.newPassword)) {
        nextErrors.newPassword =
          '비밀번호는 대소문자, 숫자, 특수문자를 포함하여 10자 이상 입력해주세요';
      }

      if (!formState.confirmPassword) {
        nextErrors.confirmPassword = '새 비밀번호를 다시 입력해주세요';
      } else if (formState.newPassword !== formState.confirmPassword) {
        nextErrors.confirmPassword = '비밀번호가 일치하지 않습니다';
      }
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSaveProfile = async () => {
    if (!validateForm()) {
      return;
    }

    const hasPasswordInput =
      Boolean(formState.currentPassword) ||
      Boolean(formState.newPassword) ||
      Boolean(formState.confirmPassword);

    setSaving(true);
    try {
      const updated = await membersApi.updateMyProfile({
        nickname: formState.nickname.trim(),
        phone: formState.phone,
        profileImageUrl: formState.profileImage ?? undefined,
      });

      if (hasPasswordInput) {
        await membersApi.changePassword({
          currentPassword: formState.currentPassword,
          newPassword: formState.newPassword,
          newPasswordConfirm: formState.confirmPassword,
        });
      }

      setFormState((current) => ({
        ...current,
        nickname: updated.nickname ?? current.nickname,
        phone: updated.phone ?? current.phone,
        email: updated.email ?? current.email,
        profileImage: updated.profileImageUrl ?? current.profileImage,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
      setErrors({});
      setSuccessMessage('회원 정보가 저장되었습니다');
    } catch (e) {
      const message = parseApiError(e);
      if (message.includes('닉네임')) {
        setErrors({ nickname: message });
      } else if (message.includes('비밀번호')) {
        setErrors({ currentPassword: message });
      } else {
        setErrors({ form: message });
      }
    } finally {
      setSaving(false);
    }
  };

  const closeWithdrawModal = () => {
    setIsWithdrawModalOpen(false);
    setWithdrawPassword('');
    setWithdrawError('');
  };

  const handleWithdraw = async () => {
    if (!withdrawPassword) {
      setWithdrawError('비밀번호를 입력해주세요');
      return;
    }

    setWithdrawing(true);
    try {
      await membersApi.withdraw({ password: withdrawPassword });
      clearTokens();
      navigate('/login', { replace: true });
    } catch (e) {
      setWithdrawError(parseApiError(e));
    } finally {
      setWithdrawing(false);
    }
  };

  if (loading) {
    return (
      <PageContainer className="min-h-full bg-[#F3F7FC] pt-4">
        <p className="py-10 text-center text-xs font-bold text-[#6C88A4]">불러오는 중...</p>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="min-h-full bg-[#F3F7FC] pt-4">
      <div className="space-y-4">
        <ProfileImageUploader
          image={formState.profileImage}
          nickname={formState.nickname}
          onChange={(image) => setFormState((current) => ({ ...current, profileImage: image }))}
        />

        <ProfileEditForm
          errors={errors}
          formState={formState}
          onChange={handleChange}
        />

        <PasswordChangeForm errors={errors} formState={formState} onChange={handleChange} />

        {successMessage ? (
          <p className="rounded-xl bg-emerald-50 px-4 py-3 text-center text-sm font-extrabold text-emerald-600">
            {successMessage}
          </p>
        ) : null}

        {errors.form ? (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-center text-sm font-extrabold text-red-500">
            {errors.form}
          </p>
        ) : null}

        <Button
          className="h-12 w-full rounded-xl text-sm font-extrabold"
          disabled={saving}
          onClick={handleSaveProfile}
          variant="brand"
        >
          {saving ? '저장 중...' : '저장하기'}
        </Button>

        <button
          className="mx-auto block cursor-pointer pb-2 pt-4 text-xs font-bold text-slate-400 transition hover:text-rose-500"
          onClick={() => setIsWithdrawModalOpen(true)}
          type="button"
        >
          회원 탈퇴
        </button>
      </div>

      <Modal
        cancelText="취소"
        confirmDisabled={withdrawing}
        confirmText={withdrawing ? '처리 중...' : '탈퇴하기'}
        confirmVariant="danger"
        description={'탈퇴하면 계정과 데이터를 복구할 수 없습니다.\n계속하려면 비밀번호를 입력해주세요.'}
        isOpen={isWithdrawModalOpen}
        onClose={closeWithdrawModal}
        onConfirm={handleWithdraw}
        title="회원 탈퇴"
      >
        <label className="mb-1.5 block text-sm font-medium text-slate-700">비밀번호</label>
        <PasswordInput
          autoComplete="current-password"
          className="h-11 rounded-xl border-blue-100 bg-[#F0F6FF] font-bold focus:border-[#1565C0]"
          onChange={(event) => {
            setWithdrawPassword(event.target.value);
            setWithdrawError('');
          }}
          placeholder="비밀번호 입력"
          value={withdrawPassword}
        />
        {withdrawError ? (
          <p className="mt-1 text-xs font-bold text-red-500">{withdrawError}</p>
        ) : null}
      </Modal>
    </PageContainer>
  );
}
