interface FilterSheetActionsProps {
  onReset: () => void;
  onClose: () => void;
}

export default function FilterSheetActions({ onReset, onClose }: FilterSheetActionsProps) {
  return (
    <div className="flex gap-2.5 px-5 py-4 shrink-0 border-t border-border">
      <button
        onClick={() => {
          onReset();
          onClose();
        }}
        className="flex-1 h-11 rounded-xl border border-border text-sm text-gray-text hover:bg-hover transition-colors"
      >
        초기화
      </button>
      <button
        onClick={onClose}
        className="flex-2 h-11 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-hover transition-colors"
      >
        적용하기
      </button>
    </div>
  );
}
