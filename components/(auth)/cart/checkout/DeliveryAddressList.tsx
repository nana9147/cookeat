'use client';

import DeliveryAddressCard from './DeliveryAddressCard';
import type { UserShippingAddress } from '@/types/user/address';

interface Props {
  addresses: UserShippingAddress[];
  loading: boolean;
  effectiveId: number | null;
  onSelect: (addr: UserShippingAddress) => void;
  onEdit: (addr: UserShippingAddress) => void;
  onDelete: (addr: UserShippingAddress) => void;
  onAdd: () => void;
}

export default function DeliveryAddressList({
  addresses, loading, effectiveId, onSelect, onEdit, onDelete, onAdd,
}: Props) {
  return (
    <div className="flex flex-col gap-3">
      {loading ? (
        [1, 2].map((i) => <div key={i} className="h-24 rounded-xl bg-beige animate-pulse" />)
      ) : addresses.length === 0 ? (
        <p className="text-sm text-gray-text py-4 text-center">등록된 배송지가 없습니다.</p>
      ) : (
        addresses.map((addr) => (
          <DeliveryAddressCard
            key={addr.addressId}
            addr={addr}
            isSelected={effectiveId === addr.addressId}
            onSelect={() => onSelect(addr)}
            onEdit={() => onEdit(addr)}
            onDelete={() => onDelete(addr)}
          />
        ))
      )}
      <button
        type="button"
        onClick={onAdd}
        className="w-full py-3 border border-dashed border-muted rounded-xl text-sm text-gray-text hover:bg-hover transition-colors"
      >
        + 새 배송지 추가
      </button>
    </div>
  );
}
