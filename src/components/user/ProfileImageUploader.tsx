import { useRef } from 'react';
import type { ChangeEvent } from 'react';

interface ProfileImageUploaderProps {
  image: string | null;
  nickname: string;
  onChange: (image: string | null) => void;
}

export function ProfileImageUploader({ image, nickname, onChange }: ProfileImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleChangeImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    // TODO: 실제 이미지 업로드 API 연동 후 업로드 URL을 profileImage로 반영합니다.
    onChange(URL.createObjectURL(file));
  };

  return (
    <section className="flex flex-col items-center py-2">
      <button
        className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 border-blue-200 bg-[#E5F4FF] text-2xl shadow-sm"
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
        className="mt-3 text-xs font-extrabold text-[#1565C0]"
        onClick={() => fileInputRef.current?.click()}
        type="button"
      >
        프로필 변경
      </button>
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
