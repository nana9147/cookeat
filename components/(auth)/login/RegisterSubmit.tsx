interface Props {
  agreed: boolean;
  onAgreeChange: (v: boolean) => void;
  submitError: string | null;
  canSubmit: boolean;
  isLoading: boolean;
}

export default function RegisterSubmit({ agreed, onAgreeChange, submitError, canSubmit, isLoading }: Props) {
  return (
    <>
      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input type="checkbox" checked={agreed} onChange={(e) => onAgreeChange(e.target.checked)} className="accent-primary" />
        이용약관 및 개인정보처리방침에 동의합니다
      </label>
      {submitError && <p className="text-xs text-red">{submitError}</p>}
      <button
        type="submit"
        disabled={!canSubmit || isLoading}
        className="h-11 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {isLoading ? '처리 중...' : '회원가입'}
      </button>
    </>
  );
}
