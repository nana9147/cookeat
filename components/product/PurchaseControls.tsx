import { ProductOption, OptionQuantityRow } from './OptionQuantityRow';

interface Props {
  options: ProductOption[];
  selectedOption: ProductOption | null;
  qty: number;
  stock: number;
  unitPrice: number;
  totalPrice: number;
  onSelect: (opt: ProductOption | null) => void;
  onDecrement: () => void;
  onIncrement: () => void;
  onQtyChange: (v: number) => void;
}

export function PurchaseControls({
  options,
  selectedOption,
  qty,
  stock,
  unitPrice,
  totalPrice,
  onSelect,
  onDecrement,
  onIncrement,
  onQtyChange,
}: Props) {
  return (
    <>
      {options.length > 0 && (
        <select
          className="w-full h-10 rounded-lg border border-border bg-hover px-3 text-sm text-dark-text focus:outline-none focus:border-primary"
          value={selectedOption?.label ?? ''}
          onChange={(e) => {
            onSelect(options.find((o) => o.label === e.target.value) ?? null);
          }}
        >
          <option value="">옵션을 선택해주세요</option>
          {options.map((opt) => (
            <option key={opt.label} value={opt.label}>
              {opt.label}
            </option>
          ))}
        </select>
      )}
      {selectedOption && (
        <OptionQuantityRow
          option={selectedOption}
          qty={qty}
          unitPrice={unitPrice}
          stock={stock}
          onDecrement={onDecrement}
          onIncrement={onIncrement}
          onQtyChange={onQtyChange}
        />
      )}
      <div className="flex items-center justify-between pt-1 border-t border-border mt-auto">
        <span className="text-sm text-gray-text">총 결제 금액</span>
        <span className="text-xl font-bold text-dark-text">{totalPrice.toLocaleString()}원</span>
      </div>
    </>
  );
}
