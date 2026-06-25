'use client';

import { useProfileEditForm } from '@/hooks/user/useProfileEditForm';
import ProfileAvatar from './ProfileAvatar';
import ProfileInfoFields from './ProfileInfoFields';
import ProfilePasswordFields from './ProfilePasswordFields';

export default function ProfileEdit() {
  const {
    email, nickname, phone, onPhoneChange, profileImage, isSocial,
    accessToken, patchUser,
    nicknameCheck, isNicknameChecking, handleNicknameChange, onNicknameCheck,
    currentPw, setCurrentPw, newPw, setNewPw, newPwConfirm, setNewPwConfirm,
    mismatch, canSubmit, error, handleSubmit,
  } = useProfileEditForm();

  return (
    <div>
      <h3 className="mb-6 font-bold text-dark-text" suppressHydrationWarning>개인정보 수정</h3>
      <ProfileAvatar
        profileImage={profileImage}
        accessToken={accessToken}
        onUploaded={(url) => patchUser({ profileImage: url })}
      />
      <form onSubmit={handleSubmit} className="space-y-5">
        <ProfileInfoFields email={email} nickname={nickname} onNicknameChange={handleNicknameChange} nicknameCheck={nicknameCheck} onNicknameCheck={onNicknameCheck} isNicknameChecking={isNicknameChecking} phone={phone} onPhoneChange={onPhoneChange} />
        <hr className="border-border" />
        <ProfilePasswordFields isSocial={isSocial} current={currentPw} onCurrentChange={setCurrentPw} next={newPw} onNextChange={setNewPw} confirm={newPwConfirm} onConfirmChange={setNewPwConfirm} mismatch={mismatch} />
        {error && <p className="text-xs text-red-500">{error}</p>}
        <button type="submit" disabled={!canSubmit} className="h-11 w-full rounded-lg bg-primary text-sm font-medium text-white hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          수정하기
        </button>
      </form>
    </div>
  );
}
