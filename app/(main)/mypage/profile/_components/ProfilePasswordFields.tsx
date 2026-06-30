import { Input } from '@/components/ui/input';

const inputCls = 'h-11 px-4 border-border text-sm focus-visible:border-primary focus-visible:ring-0 disabled:bg-gray-50 disabled:text-gray-text disabled:opacity-100';

interface Props {
  isSocial: boolean;
  current: string;
  onCurrentChange: (v: string) => void;
  next: string;
  onNextChange: (v: string) => void;
  confirm: string;
  onConfirmChange: (v: string) => void;
  mismatch: boolean;
}

export default function ProfilePasswordFields({ isSocial, current, onCurrentChange, next, onNextChange, confirm, onConfirmChange, mismatch }: Props) {
  return (
    <>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-dark-text">비밀번호 변경</p>
        {isSocial && <p className="text-xs text-gray-text">소셜 로그인은 비밀번호 변경이 불가합니다.</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm text-gray-text">현재 비밀번호</label>
        <Input type="password" value={current} onChange={(e) => onCurrentChange(e.target.value)} placeholder="현재 비밀번호를 입력해주세요" disabled={isSocial} className={inputCls} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm text-gray-text">새 비밀번호</label>
        <Input type="password" value={next} onChange={(e) => onNextChange(e.target.value)} placeholder="새 비밀번호를 입력해주세요" disabled={isSocial} className={inputCls} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm text-gray-text">새 비밀번호 확인</label>
        <Input type="password" value={confirm} onChange={(e) => onConfirmChange(e.target.value)} placeholder="새 비밀번호를 다시 입력해주세요" disabled={isSocial} className={inputCls} />
        {mismatch && <p className="text-xs text-red-500">비밀번호가 일치하지 않습니다.</p>}
      </div>
    </>
  );
}
