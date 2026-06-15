'use client';

import { useEffect, useState } from 'react';
import { User, Phone, Place } from './CheckoutIcons';

const MOCK_ADDRESSES = [
  { id: 1, label: '우리집', isDefault: true, name: '김○주', phone: '010-1234-5678', address: '서울시 강남구 테헤란로 123 456호' },
  { id: 2, label: '회사', isDefault: false, name: '김○주', phone: '010-1234-5678', address: '서울시 서초구 서초대로 456 7동' },
];

type Address = (typeof MOCK_ADDRESSES)[number];

export interface SelectedAddress {
  recipient: string;
  phone: string;
  address: string;
}

function AddressCard({ addr, isSelected, onSelect }: { addr: Address; isSelected: boolean; onSelect: (id: number) => void }) {
  return (
    <div
      onClick={() => onSelect(addr.id)}
      className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${isSelected ? 'border-primary bg-hover' : 'border-border bg-white'}`}
    >
      <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'border-primary' : 'border-muted'}`}>
        {isSelected && <div className="w-2 h-2 rounded-full bg-primary" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-2">
          <span className="text-sm font-semibold text-dark-text">{addr.label}</span>
          <span className="text-2xs px-1.5 py-0.5 rounded border border-primary text-primary leading-none">{addr.label}</span>
          {addr.isDefault && <span className="text-2xs px-1.5 py-0.5 rounded bg-primary text-white leading-none">기본</span>}
        </div>
        <div className="flex flex-col gap-1">
          {[{ Icon: User, text: addr.name }, { Icon: Phone, text: addr.phone }, { Icon: Place, text: addr.address }].map(({ Icon, text }) => (
            <div key={text} className="flex items-center gap-1.5"><Icon /><span className="text-xs text-gray-text">{text}</span></div>
          ))}
        </div>
      </div>
      <button type="button" onClick={(e) => e.stopPropagation()} className="shrink-0 text-xs text-gray-text border border-border rounded px-2 py-1 hover:bg-beige transition-colors">
        수정
      </button>
    </div>
  );
}

export default function DeliveryInfo({ onAddressSelect }: { onAddressSelect?: (addr: SelectedAddress) => void }) {
  const [selectedId, setSelectedId] = useState(1);

  useEffect(() => {
    const initial = MOCK_ADDRESSES.find((a) => a.id === 1)!;
    onAddressSelect?.({ recipient: initial.name, phone: initial.phone, address: initial.address });
  }, []);

  function handleSelect(id: number) {
    setSelectedId(id);
    const selected = MOCK_ADDRESSES.find((a) => a.id === id)!;
    onAddressSelect?.({ recipient: selected.name, phone: selected.phone, address: selected.address });
  }

  return (
    <section className="py-6 border-b border-border">
      <h3 className="text-h4 font-bold text-dark-text mb-4">
        배송지 정보 <span className="text-sm font-normal text-gray-text">{MOCK_ADDRESSES.length}개</span>
      </h3>
      <div className="flex flex-col gap-3">
        {MOCK_ADDRESSES.map((addr) => (
          <AddressCard key={addr.id} addr={addr} isSelected={selectedId === addr.id} onSelect={handleSelect} />
        ))}
      </div>
      <button type="button" className="mt-3 w-full py-3 border border-dashed border-muted rounded-xl text-sm text-gray-text hover:bg-hover transition-colors">
        + 새 배송지 추가
      </button>
    </section>
  );
}
