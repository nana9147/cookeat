'use client';

import { useState } from 'react';
import ProfileAvatar from './ProfileAvatar';
import ProfileInfoFields from './ProfileInfoFields';
import ProfilePasswordFields from './ProfilePasswordFields';

export default function ProfileEdit() {
  const [nickname, setNickname] = useState('');
  const [phone, setPhone] = useState('');
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [newPwConfirm, setNewPwConfirm] = useState('');

  const mismatch = !!(newPw && newPwConfirm && newPw !== newPwConfirm);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: 개인정보 수정 API 연동
  };

  return (
    <div>
      <h3 className="mb-6 font-bold text-dark-text">개인정보 수정</h3>
      <ProfileAvatar />
      <form onSubmit={handleSubmit} className="space-y-5">
        <ProfileInfoFields nickname={nickname} onNicknameChange={setNickname} phone={phone} onPhoneChange={setPhone} />
        <hr className="border-border" />
        <ProfilePasswordFields current={currentPw} onCurrentChange={setCurrentPw} next={newPw} onNextChange={setNewPw} confirm={newPwConfirm} onConfirmChange={setNewPwConfirm} mismatch={mismatch} />
        <button type="submit" disabled={mismatch} className="h-11 w-full rounded-lg bg-primary text-sm font-medium text-white hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          수정하기
        </button>
      </form>
    </div>
  );
}
