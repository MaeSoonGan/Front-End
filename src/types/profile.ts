export interface UserProfile {
  nickname: string;
  phone: string;
  email: string;
  profileImage: string | null;
  emailVerified: boolean;
}

export interface ProfileEditFormState {
  nickname: string;
  phone: string;
  email: string;
  profileImage: string | null;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ProfileEditErrors {
  nickname?: string;
  phone?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}
