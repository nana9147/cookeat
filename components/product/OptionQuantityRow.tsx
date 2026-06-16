'use client';

import { Minus, Plus } from 'lucide-react';

export interface ProductOption {
  label: string;
  price: number;
}

interface Props {
  option: ProductOption;
  qty: number;
  unitPrice: number;
  stock: number;
  onDecrement: () => void;
  onIncrement: () => void;
  onQtyChange: (v: number) => void;
}

export function OptionQuantityRow({
  option,
  qty,
  unitPrice,
  stock,
  onDecrement,
  onIncrement,
  onQtyChange,
}: Props) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5 bg-hover">
      <span className="text-sm font-medium text-dark-text truncate mr-2">{option.label}</span>
      <div className="flex items-center gap-2 shrink-0">
        <div className="flex items-center border border-border rounded-lg overflow-hidden bg-white">
          <button
            onClick={onDecrement}
            className="w-7 h-7 flex items-center justify-center text-gray-text hover:bg-hover transition-colors"
            aria-label="수량 감소"
          >
            <Minus className="w-3 h-3" />
          </button>
          <input
            type="number"
            min={1}
            max={stock}
            value={qty}
            onChange={(e) => {
              const v = parseInt(e.target.value, 10);
              if (!isNaN(v)) onQtyChange(Math.min(stock, Math.max(1, v)));
            }}
            className="w-10 text-center text-sm font-medium text-dark-text bg-white focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          <button
            onClick={onIncrement}
            className="w-7 h-7 flex items-center justify-center text-gray-text hover:bg-hover transition-colors"
            aria-label="수량 증가"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>
        <span className="text-sm font-semibold text-dark-text w-20 text-right">
          {(unitPrice * qty).toLocaleString()}원
        </span>
      </div>
    </div>
  );
}
