interface FilterPriceProps {
  minPrice: string;
  maxPrice: string;
  onMinPriceChange: (value: string) => void;
  onMaxPriceChange: (value: string) => void;
}

const inputClass =
  'w-full h-8 rounded-lg border border-border px-2 text-xs text-dark-text bg-white focus:outline-none focus:border-primary';

export default function FilterPrice({ minPrice, maxPrice, onMinPriceChange, onMaxPriceChange }: FilterPriceProps) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-dark-text mb-2">가격대</h3>
      <div className="flex items-center gap-2">
        <input
          type="number"
          placeholder="최소"
          value={minPrice}
          onChange={(e) => onMinPriceChange(e.target.value)}
          className={inputClass}
        />
        <span className="text-muted text-xs shrink-0">~</span>
        <input
          type="number"
          placeholder="최대"
          value={maxPrice}
          onChange={(e) => onMaxPriceChange(e.target.value)}
          className={inputClass}
        />
      </div>
    </div>
  );
}
