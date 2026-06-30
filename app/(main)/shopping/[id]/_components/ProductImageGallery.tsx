'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ProductImageGalleryProps {
  images: string[];
  name: string;
  isNew?: boolean;
  discountRate?: number;
}

export default function ProductImageGallery({
  images,
  name,
  isNew,
  discountRate,
}: ProductImageGalleryProps) {
  const [selected, setSelected] = useState(0);

  return (
    <div className="flex flex-col gap-3">
      {/* 메인 이미지 */}
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-card-bg">
        {images[selected] ? (
          <Image src={images[selected]} alt={name} fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-16 h-16 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {/* 배지 */}
        <div className="absolute top-3 left-3 flex gap-1.5">
          {isNew && (
            <span className="bg-primary text-white text-xs font-bold px-2 py-0.5 rounded">NEW</span>
          )}
          {discountRate && (
            <span className="bg-red text-white text-xs font-bold px-2 py-0.5 rounded">
              {discountRate}% SALE
            </span>
          )}
        </div>
      </div>

      {/* 썸네일 */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className={`relative w-14 h-14 rounded-lg overflow-hidden shrink-0 border-2 transition-colors ${
                i === selected ? 'border-primary' : 'border-border hover:border-gray-text'
              }`}
            >
              {src ? (
                <Image src={src} alt={`${name} ${i + 1}`} fill className="object-cover" />
              ) : (
                <div className="w-full h-full bg-card-bg" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
