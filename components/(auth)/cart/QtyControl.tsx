const qtyBtn =
  'w-6 h-6 rounded border border-border flex items-center justify-center text-gray-text hover:bg-hover text-sm disabled:opacity-40 disabled:cursor-not-allowed';

type Props = { qty: number; disabled: boolean; onDecrement: () => void; onIncrement: () => void };

export default function QtyControl({ qty, disabled, onDecrement, onIncrement }: Props) {
  return (
    <div className="flex items-center gap-1">
      <button type="button" onClick={onDecrement} disabled={disabled} className={qtyBtn}>-</button>
      <span className="w-6 text-center text-sm text-dark-text">{qty}</span>
      <button type="button" onClick={onIncrement} disabled={disabled} className={qtyBtn}>+</button>
    </div>
  );
}
