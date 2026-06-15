import PasswordFields from './PasswordFields';
import NicknameField from './NicknameField';
import PhoneInput from '@/components/ui/PhoneInput';

const inputCls = 'h-11 px-4 rounded-lg border border-border text-sm outline-none focus:border-primary transition-colors';

interface Props {
  email: string; onEmailChange: (v: string) => void;
  password: string; onPasswordChange: (v: string) => void;
  showPassword: boolean; onTogglePassword: () => void;
  passwordConfirm: string; onPasswordConfirmChange: (v: string) => void;
  showPasswordConfirm: boolean; onTogglePasswordConfirm: () => void;
  confirmError: string | null;
  nickname: string; onNicknameChange: (v: string) => void;
  nicknameCheckResult: { text: string; ok: boolean } | null;
  onNicknameCheck: () => void; isNicknameChecking: boolean;
  phone: string; onPhoneChange: (v: string) => void;
}

export default function RegisterFormFields(p: Props) {
  return (
    <>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-dark-text">이메일</label>
        <input type="email" value={p.email} onChange={(e) => p.onEmailChange(e.target.value)} placeholder="이메일을 입력해주세요" className={inputCls} />
      </div>
      <PasswordFields
        password={p.password} onPasswordChange={p.onPasswordChange}
        showPassword={p.showPassword} onTogglePassword={p.onTogglePassword}
        passwordConfirm={p.passwordConfirm} onPasswordConfirmChange={p.onPasswordConfirmChange}
        showPasswordConfirm={p.showPasswordConfirm} onTogglePasswordConfirm={p.onTogglePasswordConfirm}
        confirmError={p.confirmError}
      />
      <NicknameField
        nickname={p.nickname} onNicknameChange={p.onNicknameChange}
        nicknameCheckResult={p.nicknameCheckResult}
        onNicknameCheck={p.onNicknameCheck} isNicknameChecking={p.isNicknameChecking}
      />
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-dark-text">전화번호</label>
        <PhoneInput value={p.phone} onChange={p.onPhoneChange} className={inputCls} />
      </div>
    </>
  );
}
