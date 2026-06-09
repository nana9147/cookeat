'use client';

import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    kakao: {
      Postcode: new (options: {
        oncomplete: (data: KakaoPostcodeData) => void;
      }) => { open: () => void };
    };
  }
}

interface KakaoPostcodeData {
  zonecode: string;
  roadAddress: string;
  bname: string;
  buildingName: string;
  apartment: 'Y' | 'N';
}

const inputCls =
  'h-11 w-full px-4 rounded-lg border border-border text-sm outline-none focus:border-primary transition-colors disabled:bg-gray-50 disabled:text-gray-text';

interface Props {
  onChange: (fullAddress: string) => void;
}

export default function AddressField({ onChange }: Props) {
  const [zonecode, setZonecode] = useState('');
  const [roadAddress, setRoadAddress] = useState('');
  const [extraAddress, setExtraAddress] = useState('');
  const [detailAddress, setDetailAddress] = useState('');
  const detailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = '//t1.kakaocdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
    script.async = true;
    document.head.appendChild(script);
    return () => { document.head.removeChild(script); };
  }, []);

  function openPostcode() {
    new window.kakao.Postcode({
      oncomplete(data) {
        let extra = '';
        if (data.bname && /[동로가]$/.test(data.bname)) extra += data.bname;
        if (data.buildingName && data.apartment === 'Y') {
          extra += (extra ? ', ' : '') + data.buildingName;
        }
        const formattedExtra = extra ? `(${extra})` : '';
        setZonecode(data.zonecode);
        setRoadAddress(data.roadAddress);
        setExtraAddress(formattedExtra);
        setDetailAddress('');
        onChange(`${data.roadAddress} ${formattedExtra}`.trim());
        setTimeout(() => detailRef.current?.focus(), 0);
      },
    }).open();
  }

  function handleDetailChange(value: string) {
    setDetailAddress(value);
    onChange(`${roadAddress} ${extraAddress} ${value}`.trim());
  }

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
