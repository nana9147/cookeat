'use client';

import { useState } from 'react';
import PostcodePanel from './PostcodePanel';

interface Props {
  zipCode: string;
  baseAddress: string;
  addressDetail: string | null;
  onSearch: (zip: string, base: string) => void;
  onDetailChange: (v: string | null) => void;
}

const INPUT_BASE =
  'px-3 py-2.5 border border-border rounded-lg text-sm ' +
  'text-dark-text placeholder:text-muted focus:outline-none focus:border-primary transition-colors';

export default function AddressSearch({
  zipCode, baseAddress, addressDetail, onSearch, onDetailChange,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-dark-text">주소 *</label>
      <div className="flex items-center gap-2 w-full">
        <input type="text" value={zipCode} readOnly placeholder="우편번호"
          className={INPUT_BASE + ' flex-1 bg-beige cursor-default'} />
        <button type="button" onClick={() => setOpen((p) => !p)}
          className="shrink-0 px-3 py-2.5 border border-border rounded-lg text-sm text-gray-text hover:bg-beige transition-colors">
          주소 검색
        </button>
      </div>
      {open && (
        <PostcodePanel
          onComplete={(zip, base) => { onSearch(zip, base); setOpen(false); }}
          onClose={() => setOpen(false)}
        />
      )}
      <input type="text" value={baseAddress} readOnly placeholder="기본 주소"
        className={INPUT_BASE + ' w-full bg-beige cursor-default'} />
      <input type="text" value={addressDetail ?? ''} maxLength={100}
        onChange={(e) => onDetailChange(e.target.value || null)}
        placeholder="상세 주소 (동/호수 등, 선택)" className={INPUT_BASE + ' w-full'} />
    </div>
  );
}
