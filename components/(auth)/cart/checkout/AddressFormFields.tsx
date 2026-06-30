'use client';

interface Props {
  isDefault: boolean;
  loading: boolean;
  error: string;
  onDefaultChange: (v: boolean) => void;
  onClose: () => void;
}

export default function AddressFormFields({
  isDefault, loading, error, onDefaultChange, onClose,
}: Props) {
  return (
    <>
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={isDefault}
          onChange={(e) => onDefaultChange(e.target.checked)} className="w-4 h-4 accent-primary" />
        <span className="text-sm text-dark-text">기본 배송지로 설정</span>
      </label>
      {error && <p className="text-xs text-red-500">{error}</p>}
      <div className="flex gap-3 pt-1">
        <button type="button" onClick={onClose}
          className="flex-1 py-3 rounded-xl border border-border text-sm text-gray-text hover:bg-beige transition-colors">
          취소
        </button>
        <button type="submit" disabled={loading}
          className="flex-1 py-3 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-hover transition-colors disabled:opacity-50">
          {loading ? '저장 중...' : '저장'}
        </button>
      </div>
    </>
  );
}
