import { getPasswordStrength, STRENGTH_CONFIG } from '@/lib/passwordStrength';
import PasswordInput from './PasswordInput';

interface Props {
  password: string;
  onPasswordChange: (v: string) => void;
  showPassword: boolean;
  onTogglePassword: () => void;
  passwordConfirm: string;
  onPasswordConfirmChange: (v: string) => void;
  showPasswordConfirm: boolean;
  onTogglePasswordConfirm: () => void;
  confirmError: string | null;
}

export default function PasswordFields(p: Props) {
  const strength = getPasswordStrength(p.password);
  const config = strength ? STRENGTH_CONFIG[strength] : null;

  return (
    <>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-dark-text">비밀번호</label>
        <p className="text-xs text-muted-foreground">비밀번호는 8자 이상, 대소문자, 숫자, 특수문자를 포함해야 합니다.</p>
        <PasswordInput value={p.password} onChange={p.onPasswordChange} show={p.showPassword} onToggle={p.onTogglePassword} placeholder="비밀번호를 입력해주세요" />
        {config && (
          <div className="flex items-center gap-2">
            <div className="flex flex-1 gap-1">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i < config.segments ? config.color : 'bg-border'}`} />
              ))}
            </div>
            <span className={`text-xs font-medium ${config.textColor}`}>{config.label}</span>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-dark-text">비밀번호 확인</label>
        <PasswordInput value={p.passwordConfirm} onChange={p.onPasswordConfirmChange} show={p.showPasswordConfirm} onToggle={p.onTogglePasswordConfirm} placeholder="비밀번호를 다시 입력해주세요" />
        {p.confirmError && <p className="text-xs text-red">{p.confirmError}</p>}
      </div>
    </>
  );
}
