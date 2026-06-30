'use client';

import { useState } from 'react';
import AddressLabelPicker from './AddressLabelPicker';
import AddressContactFields from './AddressContactFields';
import AddressSearch from './AddressSearch';
import AddressFormFields from './AddressFormFields';
import type { UserShippingAddress, CreateShippingAddressInput } from '@/types/user/address';

interface Props {
  mode: '추가' | '수정';
  address?: UserShippingAddress;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (form: CreateShippingAddressInput) => Promise<void>;
}

const PRESETS = ['집', '회사'];

function initForm(mode: Props['mode'], addr?: UserShippingAddress) {
  if (mode === '수정' && addr) {
    const { label, recipient, phone, zipCode, baseAddress, addressDetail, isDefault } = addr;
    return { label, recipient, phone, zipCode, baseAddress, addressDetail, isDefault };
  }
  return {
    label: '',
    recipient: '',
    phone: '',
    zipCode: '',
    baseAddress: '',
    addressDetail: null,
    isDefault: false,
  };
}

export default function AddressFormModal({ mode, address, isOpen, onClose, onSubmit }: Props) {
  const [form, setForm] = useState<CreateShippingAddressInput>(() => initForm(mode, address));
  const [customLabel, setCustomLabel] = useState(() =>
    mode === '수정' && address && !PRESETS.includes(address.label) ? address.label : ''
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = <K extends keyof CreateShippingAddressInput>(
    k: K,
    v: CreateShippingAddressInput[K]
  ) => setForm((p) => ({ ...p, [k]: v }));

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    const label = PRESETS.includes(form.label) ? form.label : customLabel.trim();
    if (!label) return setError('배송지 이름을 입력해주세요.');
    if (!form.recipient.trim()) return setError('수령인을 입력해주세요.');
    if (!form.phone.trim()) return setError('연락처를 입력해주세요.');
    if (!form.zipCode) return setError('주소를 검색해주세요.');
    setLoading(true);
    setError('');
    try {
      await onSubmit({ ...form, label });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : '저장에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 className="text-base font-bold text-dark-text">배송지 {mode}</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-text hover:text-dark-text text-xl leading-none"
          >
            ×
          </button>
        </div>
        <form
          onSubmit={handleSubmit}
          className="px-6 py-5 flex flex-col gap-4 max-h-[80vh] overflow-y-auto"
        >
          <AddressLabelPicker
            value={form.label}
            customLabel={customLabel}
            onPreset={(p) => set('label', p)}
            onCustomChange={setCustomLabel}
          />
          <AddressContactFields
            recipient={form.recipient}
            phone={form.phone}
            onRecipientChange={(v) => set('recipient', v)}
            onPhoneChange={(v) => set('phone', v)}
          />
          <AddressSearch
            zipCode={form.zipCode}
            baseAddress={form.baseAddress}
            addressDetail={form.addressDetail}
            onSearch={(zip, base) => {
              set('zipCode', zip);
              set('baseAddress', base);
            }}
            onDetailChange={(v) => set('addressDetail', v)}
          />
          <AddressFormFields
            isDefault={form.isDefault}
            loading={loading}
            error={error}
            onClose={onClose}
            onDefaultChange={(v) => set('isDefault', v)}
          />
        </form>
      </div>
    </div>
  );
}
