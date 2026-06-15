'use client';

import { useAvatarUpload } from '@/hooks/user/useAvatarUpload';

interface Props {
  profileImage: string | null;
  accessToken: string | null;
  onUploaded: (url: string) => void;
}

export default function ProfileAvatar({ profileImage, accessToken, onUploaded }: Props) {
  const { preview, uploading, inputRef, handleChange } = useAvatarUpload(accessToken, onUploaded);
  const src = preview ?? profileImage;

  return (
    <div className="mb-6 flex flex-col items-center gap-3">
      {src
        ? <img src={src} alt="프로필" className="size-20 rounded-full object-cover" />
        : <div className="size-20 rounded-full bg-primary" />
      }
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleChange} />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="text-xs text-gray-text underline underline-offset-2 hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {uploading ? '업로드 중...' : '프로필 사진 변경'}
      </button>
    </div>
  );
}
