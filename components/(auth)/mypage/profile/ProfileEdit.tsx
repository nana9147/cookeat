'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useUserInfo } from '@/hooks/user/useUserInfo';
import { useNicknameCheck } from '@/hooks/auth/useNicknameCheck';
import ProfileAvatar from './ProfileAvatar';
import ProfileInfoFields from './ProfileInfoFields';
import ProfilePasswordFields from './ProfilePasswordFields';

export default function ProfileEdit() {
  const { email, nickname: initNickname, phone: initPhone, profileImage, isSocial } = useUserInfo();
  const accessToken = useAuthStore((s) => s.accessToken);
  const { nicknameCheck, setNicknameCheck, isNicknameChecking, checkNickname } = useNicknameCheck();

  const [nickname, setNickname] = useState('');
  const [phone, setPhone] = useState('');
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [newPwConfirm, setNewPwConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { setNickname(initNickname); }, [initNickname]);
  useEffect(() => { setPhone(initPhone); }, [initPhone]);

  const handleNicknameChange = (v: string) => { setNickname(v); setNicknameCheck(null); };

  const mismatch = !!(newPw && newPwConfirm && newPw !== newPwConfirm);
  const nicknameChanged = nickname !== initNickname;
  const canSubmit = !mismatch && (!nicknameChanged || nicknameCheck?.ok === true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || !accessToken) return;
    setError(null);
    const body: Record<string, string> = { nickname, phone };
    if (!isSocial && currentPw && newPw) Object.assign(body, { currentPassword: currentPw, newPassword: newPw });
    const res = await fetch('/api/auth/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? '수정 중 오류가 발생했습니다.'); return; }
    alert('수정되었습니다.');
  };

  return (
    <div>
      <h3 className="mb-6 font-bold text-dark-text">개인정보 수정</h3>
      <ProfileAvatar profileImage={profileImage} />
      <form onSubmit={handleSubmit} className="space-y-5">
        <ProfileInfoFields email={email} nickname={nickname} onNicknameChange={handleNicknameChange} nicknameCheck={nicknameCheck} onNicknameCheck={() => checkNickname(nickname)} isNicknameChecking={isNicknameChecking} phone={phone} onPhoneChange={setPhone} />
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
