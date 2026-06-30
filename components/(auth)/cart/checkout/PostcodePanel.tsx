'use client';

import DaumPostcode from 'react-daum-postcode';

interface Props {
  onComplete: (zip: string, base: string) => void;
  onClose: () => void;
}

export default function PostcodePanel({ onComplete, onClose }: Props) {
  return (
    <div className="border border-border rounded-lg overflow-hidden [&_iframe]:w-full! [&_iframe]:block!">
      <div className="flex justify-end p-1 bg-beige border-b border-border">
        <button type="button" onClick={onClose}
          className="text-xs text-gray-text hover:text-dark-text px-2 py-1">
          닫기
        </button>
      </div>
      <DaumPostcode
        onComplete={(d) => { onComplete(d.zonecode, d.address); onClose(); }}
        onClose={onClose}
      />
    </div>
  );
}
