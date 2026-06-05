const inputCls = 'h-11 px-4 rounded-lg border border-border text-sm outline-none focus:border-primary transition-colors';
const btnCls = 'shrink-0 px-4 h-11 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-hover transition-colors';

interface Props {
  nickname: string;
  onNicknameChange: (v: string) => void;
  nicknameCheckResult: { text: string; ok: boolean } | null;
  onNicknameCheck: () => void;
  isNicknameChecking: boolean;
}

export default function NicknameField(p: Props) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-dark-text">닉네임</label>
      <div className="flex gap-2">
        <input type="text" value={p.nickname} onChange={(e) => p.onNicknameChange(e.target.value)} placeholder="닉네임을 입력해주세요" className={`flex-1 ${inputCls}`} />
        <button type="button" onClick={p.onNicknameCheck} disabled={p.isNicknameChecking} className={`${btnCls} disabled:opacity-40 disabled:cursor-not-allowed`}>
          {p.isNicknameChecking ? '확인 중...' : '중복 확인'}
        </button>
      </div>
      {p.nicknameCheckResult && (
        <p className={`text-xs ${p.nicknameCheckResult.ok ? 'text-primary' : 'text-red'}`}>
          {p.nicknameCheckResult.text}
        </p>
      )}
    </div>
  );
}
