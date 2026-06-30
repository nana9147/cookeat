'use client';

import PhoneInput from '@/components/ui/PhoneInput';

interface Props {
  recipient: string;
  phone: string;
  onRecipientChange: (v: string) => void;
  onPhoneChange: (v: string) => void;
}

const INPUT =
  'w-full px-3 py-2.5 border border-border rounded-lg text-sm ' +
  'text-dark-text placeholder:text-muted focus:outline-none focus:border-primary transition-colors';

const PHONE_CLS =
  'border-border px-3 py-2.5 text-sm text-dark-text ' +
  'placeholder:text-muted focus:outline-none focus:border-primary transition-colors';

export default function AddressContactFields({
  recipient, phone, onRecipientChange, onPhoneChange,
}: Props) {
  return (
    <>
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-dark-text">수령인 *</label>
        <input type="text" value={recipient} maxLength={50} placeholder="수령인 이름"
          onChange={(e) => onRecipientChange(e.target.value)} className={INPUT} />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-dark-text">연락처 *</label>
        <PhoneInput value={phone} onChange={onPhoneChange} className={PHONE_CLS} />
      </div>
    </>
  );
}
