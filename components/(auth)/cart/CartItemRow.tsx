import Image from 'next/image';
import CircleCheckbox from './CircleCheckbox';
import QtyControl from './QtyControl';
import type { MergedCartItem } from './useCartItems';

type Props = {
  item: MergedCartItem;
  checked: boolean;
  onToggle: () => void;
  onQtyChange: (qty: number) => void;
  onDelete: () => void;
};

export default function CartItemRow({ item, checked, onToggle, onQtyChange, onDelete }: Props) {
  const unavailable = !item.available;
  const handleDecrement = () => onQtyChange(Math.max(1, item.quantity - 1));
  const handleIncrement = () => onQtyChange(Math.min(item.stock, item.quantity + 1));

  return (
    <div className={`flex items-start gap-2 tablet:gap-3 py-4 ${unavailable || !checked ? 'opacity-50' : ''}`}>
      <CircleCheckbox checked={checked} onChange={onToggle} className="mt-1" disabled={unavailable} />
      <div className="relative w-12 h-12 tablet:w-14 tablet:h-14 rounded-lg bg-card-bg shrink-0 overflow-hidden">
        {item.image ? (
          <Image src={item.image} alt={item.name} fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-5 h-5 tablet:w-6 tablet:h-6 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        {item.origin && <p className="text-xs text-light-gray mb-0.5 truncate">{item.origin}</p>}
        <div className="flex items-center gap-1.5 flex-wrap">
          <p className="text-sm font-medium text-dark-text leading-snug">{item.name}</p>
          {item.stock === 0 && <span className="text-xs font-semibold text-white bg-gray-400 px-1.5 py-0.5 rounded">품절</span>}
          {item.stock > 0 && unavailable && <span className="text-xs font-semibold text-white bg-gray-400 px-1.5 py-0.5 rounded">판매중단</span>}
        </div>
        {item.seller && <p className="text-xs text-gray-text mt-0.5 truncate">{item.seller}</p>}
        <div className="flex items-center justify-between mt-2 tablet:hidden">
          <QtyControl qty={item.quantity} disabled={unavailable} onDecrement={handleDecrement} onIncrement={handleIncrement} />
          <p className="text-sm font-medium text-dark-text">{(item.price * item.quantity).toLocaleString()}원</p>
        </div>
      </div>
      <div className="hidden tablet:flex items-center gap-1 shrink-0">
        <QtyControl qty={item.quantity} disabled={unavailable} onDecrement={handleDecrement} onIncrement={handleIncrement} />
      </div>
      <p className="hidden tablet:block text-sm font-medium text-dark-text shrink-0 w-16 text-right">
        {(item.price * item.quantity).toLocaleString()}원
      </p>
      <button type="button" onClick={onDelete} className="text-muted hover:text-gray-text shrink-0 text-base leading-none">×</button>
    </div>
  );
}
