import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { PageContainer } from '../../components/common/PageContainer';
import { PasswordChangeForm } from '../../components/user/PasswordChangeForm';
import { ProfileEditForm } from '../../components/user/ProfileEditForm';
import { ProfileImageUploader } from '../../components/user/ProfileImageUploader';
import { profileMock } from '../../mocks/profileMock';
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

function getInitialFormState(): ProfileEditFormState {
  return {
    nickname: profileMock.nickname,
    phone: profileMock.phone,
    email: profileMock.email,
    profileImage: profileMock.profileImage,
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  };
}

export function ProfileEditPage() {
  const navigate = useNavigate();
  const [formState, setFormState] = useState<ProfileEditFormState>(() => getInitialFormState());
  const [errors, setErrors] = useState<ProfileEditErrors>({});
  const [successMessage, setSuccessMessage] = useState('');
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

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

  const handleSaveProfile = () => {
    if (!validateForm()) {
      return;
    }

    // TODO: 회원정보 수정 API 연동 후 서버 응답 기준으로 사용자 정보를 갱신합니다.
    // TODO: 닉네임 중복 검사는 API 연동 후 서버 오류 메시지로 처리합니다.
    // TODO: 현재 비밀번호 일치 여부는 API 연동 후 서버 오류 메시지로 처리합니다.
    console.log('mock profile save:', formState);
    setSuccessMessage('회원 정보가 저장되었습니다');
  };

  const handleWithdraw = () => {
    // TODO: 회원 탈퇴 API 연동 후 서버 상태를 동기화합니다.
    clearTokens();
    navigate('/login', { replace: true });
  };

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

        <Button
          className="h-12 w-full rounded-xl text-sm font-extrabold"
          onClick={handleSaveProfile}
          variant="brand"
        >
          저장하기
        </Button>

        <button
          className="mx-auto block pb-2 pt-4 text-xs font-bold text-slate-400 transition hover:text-rose-500"
          onClick={() => setIsWithdrawModalOpen(true)}
          type="button"
        >
          회원 탈퇴
        </button>
      </div>

      <Modal
        cancelText="취소"
        confirmText="탈퇴하기"
        confirmVariant="danger"
        description="정말 회원 탈퇴하시겠습니까? 탈퇴 후 계정 복구가 어려울 수 있습니다."
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
        onConfirm={handleWithdraw}
        title="회원 탈퇴"
      />
    </PageContainer>
  );
}
