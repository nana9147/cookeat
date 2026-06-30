'use client';

import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useUserAddresses } from './useUserAddresses';
import DeliveryAddressList from './DeliveryAddressList';
import AddressFormModal from './AddressFormModal';
import type { UserShippingAddress, CreateShippingAddressInput, SelectedAddress } from '@/types/user/address';

export type { SelectedAddress };

const toSelected = (a: UserShippingAddress): SelectedAddress => ({
  recipient: a.recipient, phone: a.phone, address: a.baseAddress, addressDetail: a.addressDetail,
});

export default function DeliveryInfo({
  onAddressSelect,
}: {
  onAddressSelect?: (addr: SelectedAddress) => void;
}) {
  const { addresses, loading, add, update, remove } = useUserAddresses();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<UserShippingAddress | undefined>(undefined);

  const onSelectRef = useRef(onAddressSelect);
  onSelectRef.current = onAddressSelect;

  const defaultId = addresses.find((a) => a.isDefault)?.addressId ?? addresses[0]?.addressId ?? null;
  const effectiveId = selectedId ?? defaultId;

  useEffect(() => {
    if (effectiveId === null) return;
    const addr = addresses.find((a) => a.addressId === effectiveId);
    if (addr) onSelectRef.current?.(toSelected(addr));
  }, [effectiveId, addresses]);

  async function handleDelete(addr: UserShippingAddress) {
    if (!confirm(`"${addr.label}" 배송지를 삭제하시겠습니까?`)) return;
    try {
      await remove(addr.addressId);
      if (selectedId === addr.addressId) setSelectedId(null);
      toast.success('배송지가 삭제되었습니다.');
    } catch {
      toast.error('삭제에 실패했습니다.');
    }
  }

  async function handleSubmit(form: CreateShippingAddressInput) {
    if (editTarget) {
      const updated = await update(editTarget.addressId, form);
      if (selectedId === editTarget.addressId) setSelectedId(updated.addressId);
      toast.success('배송지가 수정되었습니다.');
    } else {
      const created = await add(form);
      setSelectedId(created.addressId);
      toast.success('배송지가 추가되었습니다.');
    }
  }

  return (
    <section className="py-6 border-b border-border">
      <h3 className="text-h4 font-bold text-dark-text mb-4">배송지 정보{' '}
        <span className="text-sm font-normal text-gray-text">{addresses.length}개</span></h3>
      <DeliveryAddressList
        addresses={addresses} loading={loading} effectiveId={effectiveId}
        onSelect={(addr) => setSelectedId(addr.addressId)}
        onEdit={(addr) => { setEditTarget(addr); setModalOpen(true); }}
        onDelete={handleDelete}
        onAdd={() => { setEditTarget(undefined); setModalOpen(true); }}
      />
      <AddressFormModal
        key={modalOpen ? (editTarget?.addressId ?? 'new') : 'closed'}
        mode={editTarget ? '수정' : '추가'} address={editTarget}
        isOpen={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleSubmit}
      />
    </section>
  );
}
