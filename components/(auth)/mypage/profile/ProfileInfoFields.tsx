import PhoneInput from '@/components/ui/PhoneInput';

const inputCls = 'h-11 w-full px-4 rounded-lg border border-border text-sm outline-none focus:border-primary transition-colors disabled:bg-gray-50 disabled:text-gray-text';

type CheckResult = { text: string; ok: boolean } | null;

interface Props {
  email: string;
  nickname: string;
  onNicknameChange: (v: string) => void;
  nicknameCheck: CheckResult;
  onNicknameCheck: () => void;
  isNicknameChecking: boolean;
  phone: string;
  onPhoneChange: (v: string) => void;
}

export default function ProfileInfoFields({ email, nickname, onNicknameChange, nicknameCheck, onNicknameCheck, isNicknameChecking, phone, onPhoneChange }: Props) {
  return (
    <>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-dark-text">이메일</label>
        <input type="email" value={email} disabled className={inputCls} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-dark-text">닉네임</label>
        <div className="flex gap-2">
          <input type="text" value={nickname} onChange={(e) => onNicknameChange(e.target.value)} placeholder="닉네임을 입력해주세요" className={inputCls} />
          <button type="button" onClick={onNicknameCheck} disabled={isNicknameChecking || !nickname.trim()} className="h-11 shrink-0 rounded-lg border border-primary px-4 text-sm text-primary hover:bg-primary hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            {isNicknameChecking ? '확인 중...' : '중복확인'}
          </button>
        </div>
        {nicknameCheck && <p className={`text-xs ${nicknameCheck.ok ? 'text-primary' : 'text-red-500'}`}>{nicknameCheck.text}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-dark-text">전화번호</label>
        <PhoneInput value={phone} onChange={onPhoneChange} className={inputCls} />
      </div>
    </>
  );
}
