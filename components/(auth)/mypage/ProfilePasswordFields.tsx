const inputCls = 'h-11 w-full px-4 rounded-lg border border-border text-sm outline-none focus:border-primary transition-colors';

interface Props {
  current: string;
  onCurrentChange: (v: string) => void;
  next: string;
  onNextChange: (v: string) => void;
  confirm: string;
  onConfirmChange: (v: string) => void;
  mismatch: boolean;
}

export default function ProfilePasswordFields({ current, onCurrentChange, next, onNextChange, confirm, onConfirmChange, mismatch }: Props) {
  return (
    <>
      <p className="text-sm font-medium text-dark-text">비밀번호 변경</p>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm text-gray-text">현재 비밀번호</label>
        <input type="password" value={current} onChange={(e) => onCurrentChange(e.target.value)} placeholder="현재 비밀번호를 입력해주세요" className={inputCls} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm text-gray-text">새 비밀번호</label>
        <input type="password" value={next} onChange={(e) => onNextChange(e.target.value)} placeholder="새 비밀번호를 입력해주세요" className={inputCls} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm text-gray-text">새 비밀번호 확인</label>
        <input type="password" value={confirm} onChange={(e) => onConfirmChange(e.target.value)} placeholder="새 비밀번호를 다시 입력해주세요" className={inputCls} />
        {mismatch && <p className="text-xs text-red-500">비밀번호가 일치하지 않습니다.</p>}
      </div>
    </>
  );
}
