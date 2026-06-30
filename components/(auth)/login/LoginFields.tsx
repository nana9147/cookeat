import PasswordInput from './PasswordInput';

const inputCls = 'h-11 px-4 rounded-lg border border-border text-sm outline-none focus:border-primary transition-colors';

interface Props {
  email: string;
  onEmailChange: (v: string) => void;
  password: string;
  onPasswordChange: (v: string) => void;
  showPassword: boolean;
  onTogglePassword: () => void;
}

export default function LoginFields({ email, onEmailChange, password, onPasswordChange, showPassword, onTogglePassword }: Props) {
  return (
    <>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-dark-text">이메일</label>
        <input type="email" value={email} onChange={(e) => onEmailChange(e.target.value)} placeholder="이메일을 입력해주세요" className={inputCls} />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-dark-text">비밀번호</label>
        <PasswordInput value={password} onChange={onPasswordChange} show={showPassword} onToggle={onTogglePassword} placeholder="비밀번호를 입력해주세요" />
      </div>
    </>
  );
}
