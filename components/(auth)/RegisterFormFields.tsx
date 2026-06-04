import { getPasswordStrength, STRENGTH_CONFIG } from '@/lib/passwordStrength';
import PasswordInput from './PasswordInput';

// 공통 인풋/버튼 스타일
const inputCls = 'h-11 px-4 rounded-lg border border-border text-sm outline-none focus:border-primary transition-colors';
const btnCls = 'shrink-0 px-4 h-11 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-hover transition-colors';

interface Props {
  email: string; onEmailChange: (v: string) => void;
  emailCheckResult: { text: string; ok: boolean } | null; onEmailCheck: () => void;
  password: string; onPasswordChange: (v: string) => void;
  showPassword: boolean; onTogglePassword: () => void;
  passwordConfirm: string; onPasswordConfirmChange: (v: string) => void;
  showPasswordConfirm: boolean; onTogglePasswordConfirm: () => void;
  confirmError: string | null;
  nickname: string; onNicknameChange: (v: string) => void;
}

// 회원가입 입력 필드 모음 (이메일·비밀번호·비밀번호 확인·닉네임)
export default function RegisterFormFields(p: Props) {
  const strength = getPasswordStrength(p.password);
  // 비밀번호 강도에 따른 색상·라벨·세그먼트 수 설정
  const config = strength ? STRENGTH_CONFIG[strength] : null;

  return (
    <>
      {/* 이메일 + 중복 확인 */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-dark-text">이메일</label>
        <div className="flex gap-2">
          <input type="email" value={p.email} onChange={(e) => p.onEmailChange(e.target.value)} placeholder="이메일을 입력해주세요" className={`flex-1 ${inputCls}`} />
          <button type="button" onClick={p.onEmailCheck} className={btnCls}>중복 확인</button>
        </div>
        {p.emailCheckResult && (
          <p className={`text-xs ${p.emailCheckResult.ok ? 'text-primary' : 'text-red'}`}>{p.emailCheckResult.text}</p>
        )}
      </div>
      {/* 비밀번호 + 강도 바 */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-dark-text">비밀번호</label>
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
      {/* 비밀번호 확인 */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-dark-text">비밀번호 확인</label>
        <PasswordInput value={p.passwordConfirm} onChange={p.onPasswordConfirmChange} show={p.showPasswordConfirm} onToggle={p.onTogglePasswordConfirm} placeholder="비밀번호를 다시 입력해주세요" />
        {p.confirmError && <p className="text-xs text-red">{p.confirmError}</p>}
      </div>
      {/* 닉네임 */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-dark-text">닉네임</label>
        <input type="text" value={p.nickname} onChange={(e) => p.onNicknameChange(e.target.value)} placeholder="닉네임을 입력해주세요" className={inputCls} />
      </div>
    </>
  );
}
