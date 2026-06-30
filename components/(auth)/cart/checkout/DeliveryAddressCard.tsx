'use client';

import AddressCardInfo from './AddressCardInfo';
import type { UserShippingAddress } from '@/types/user/address';

interface Props {
  addr: UserShippingAddress;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const BTN =
  'text-xs text-gray-text border border-border ' +
  'rounded px-2 py-1 hover:bg-beige transition-colors';

export default function DeliveryAddressCard({ addr, isSelected, onSelect, onEdit, onDelete }: Props) {
  const fullAddress = addr.addressDetail
    ? `${addr.baseAddress} ${addr.addressDetail}`
    : addr.baseAddress;

  return (
    <div
      onClick={onSelect}
      className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${
        isSelected ? 'border-primary bg-hover' : 'border-border bg-white'
      }`}
    >
      <div
        className={`mt-0.5 w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors ${
          isSelected ? 'border-primary' : 'border-muted'
        }`}
      >
        {isSelected && <div className="w-2 h-2 rounded-full bg-primary" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-2">
          <span className="text-sm font-semibold text-dark-text">{addr.label}</span>
          <span className="text-2xs px-1.5 py-0.5 rounded border border-primary text-primary leading-none">
            {addr.label}
          </span>
          {addr.isDefault && (
            <span className="text-2xs px-1.5 py-0.5 rounded bg-primary text-white leading-none">기본</span>
          )}
        </div>
        <AddressCardInfo recipient={addr.recipient} phone={addr.phone} fullAddress={fullAddress} />
      </div>
      <div className="flex gap-1 shrink-0">
        <button type="button" onClick={(e) => { e.stopPropagation(); onEdit(); }} className={BTN}>수정</button>
        <button type="button" onClick={(e) => { e.stopPropagation(); onDelete(); }} className={BTN}>삭제</button>
      </div>
    </div>
  );
}
