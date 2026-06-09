'use client';

import { useKakaoPostcode } from '@/hooks/user/useKakaoPostcode';

const inputCls =
  'h-11 w-full px-4 rounded-lg border border-border text-sm outline-none focus:border-primary transition-colors disabled:bg-gray-50 disabled:text-gray-text';

interface Props {
  onChange: (fullAddress: string) => void;
}

export default function AddressField({ onChange }: Props) {
  const { zonecode, roadAddress, extraAddress, detailAddress, detailRef, openPostcode, handleDetailChange } =
    useKakaoPostcode(onChange);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={zonecode}
          readOnly
          placeholder="우편번호"
          className={`${inputCls} w-32 cursor-default`}
        />
        <button
          type="button"
          onClick={openPostcode}
          className="h-11 shrink-0 rounded-lg border border-primary px-4 text-sm text-primary hover:bg-primary hover:text-white transition-colors"
        >
          주소 검색
        </button>
      </div>
      <input
        type="text"
        value={roadAddress ? `${roadAddress} ${extraAddress}`.trim() : ''}
        readOnly
        placeholder="기본 주소"
        className={`${inputCls} cursor-default`}
      />
      <input
        ref={detailRef}
        type="text"
        value={detailAddress}
        onChange={(e) => handleDetailChange(e.target.value)}
        placeholder="상세 주소를 입력해주세요"
        maxLength={100}
        className={inputCls}
      />
    </div>
  );
}
