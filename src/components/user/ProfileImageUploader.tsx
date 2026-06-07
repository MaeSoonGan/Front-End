import { useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import axios from 'axios';
import { membersApi } from '../../api/user/members';
import { parseApiError } from '../../api/parseApiError';

interface ProfileImageUploaderProps {
  image: string | null;
  nickname: string;
  onChange: (image: string | null) => void;
}

export function ProfileImageUploader({ image, nickname, onChange }: ProfileImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleChangeImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    // 같은 파일 재선택 가능하도록 input 초기화
    event.target.value = '';

    setError('');
    setUploading(true);
    try {
      // 1. presigned URL 발급
      const { uploadUrl, imageUrl } = await membersApi.getProfileImageUploadUrl({
        contentType: file.type,
      });

      // 2. S3에 직접 PUT 업로드 (인증 헤더 없이 raw axios 사용)
      await axios.put(uploadUrl, file, {
        headers: { 'Content-Type': file.type },
      });

      // 3. 최종 접근 URL을 프로필 이미지로 반영
      onChange(imageUrl);
    } catch (e) {
      setError(parseApiError(e));
    } finally {
      setUploading(false);
    }
  };

  return (
    <section className="flex flex-col items-center py-2">
      <button
        className="flex h-20 w-20 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-blue-200 bg-[#E5F4FF] text-2xl shadow-sm disabled:cursor-default disabled:opacity-60"
        disabled={uploading}
        onClick={() => fileInputRef.current?.click()}
        type="button"
      >
        {image ? (
          <img alt={`${nickname} 프로필`} className="h-full w-full object-cover" src={image} />
        ) : (
          <span>😊</span>
        )}
      </button>
      <button
        className="mt-3 cursor-pointer text-xs font-extrabold text-[#1565C0] disabled:cursor-default disabled:opacity-60"
        disabled={uploading}
        onClick={() => fileInputRef.current?.click()}
        type="button"
      >
        {uploading ? '업로드 중...' : '프로필 변경'}
      </button>
      {error ? <p className="mt-1 text-xs font-bold text-red-500">{error}</p> : null}
      <input
        accept="image/*"
        className="hidden"
        onChange={handleChangeImage}
        ref={fileInputRef}
        type="file"
      />
    </section>
  );
}
