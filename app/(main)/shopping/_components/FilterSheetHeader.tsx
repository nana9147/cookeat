import { X, SlidersHorizontal } from 'lucide-react';

interface FilterSheetHeaderProps {
  activeFilterCount: number;
  onClose: () => void;
}

export default function FilterSheetHeader({ activeFilterCount, onClose }: FilterSheetHeaderProps) {
  return (
    <div className="flex items-center justify-between px-5 py-3 shrink-0 border-b border-border">
      <div className="flex items-center gap-2">
        <SlidersHorizontal className="w-4 h-4 text-primary" />
        <span className="text-sm font-semibold text-dark-text">필터</span>
        {activeFilterCount > 0 && (
          <span className="w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center font-medium">
            {activeFilterCount}
          </span>
        )}
      </div>
      <button
        onClick={onClose}
        className="w-7 h-7 flex items-center justify-center text-gray-text hover:text-dark-text"
        aria-label="닫기"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}
