'use client';

import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    kakao?: {
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

export function useKakaoPostcode(onChange: (fullAddress: string) => void) {
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
    if (!window.kakao) return;
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

  return { zonecode, roadAddress, extraAddress, detailAddress, detailRef, openPostcode, handleDetailChange };
}
