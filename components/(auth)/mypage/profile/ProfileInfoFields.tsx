const inputCls = 'h-11 w-full px-4 rounded-lg border border-border text-sm outline-none focus:border-primary transition-colors disabled:bg-gray-50 disabled:text-gray-text';

interface Props {
  nickname: string;
  onNicknameChange: (v: string) => void;
  phone: string;
  onPhoneChange: (v: string) => void;
}

export default function ProfileInfoFields({ nickname, onNicknameChange, phone, onPhoneChange }: Props) {
  return (
    <>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-dark-text">이메일</label>
        <input type="email" value="이메일" disabled className={inputCls} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-dark-text">닉네임</label>
        <div className="flex gap-2">
          <input type="text" value={nickname} onChange={(e) => onNicknameChange(e.target.value)} placeholder="닉네임을 입력해주세요" className={inputCls} />
          <button type="button" className="h-11 shrink-0 rounded-lg border border-primary px-4 text-sm text-primary hover:bg-primary hover:text-white transition-colors">
            중복확인
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-dark-text">전화번호</label>
        <input type="tel" value={phone} onChange={(e) => onPhoneChange(e.target.value)} placeholder="010-0000-0000" className={inputCls} />
      </div>
    </>
  );
}
