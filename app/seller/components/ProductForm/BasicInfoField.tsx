'use client';

import type { BasicInfoFieldProps } from '@/types/seller/product';

export default function BasicInfoField({
  name,
  category,
  manufacturer,
  origin,
  onNameChange,
  onCategoryChange,
  onManufacturerChange,
  onOriginChange,
}: BasicInfoFieldProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 flex flex-col gap-5">
      <h2 className="text-sm font-semibold text-gray-700">기본 정보</h2>

      {/* 카테고리 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          카테고리 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          placeholder="카테고리를 입력하세요"
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      {/* 상품명 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          상품명 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="상품명을 입력하세요 (30자 이내 권장)"
          maxLength={100}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
        <p className="text-xs text-gray-400 mt-1">{name.length} / 100</p>
      </div>

      {/* 제조사 + 원산지 */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">제조사</label>
          <input
            type="text"
            value={manufacturer}
            onChange={(e) => onManufacturerChange(e.target.value)}
            placeholder="제조사"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">원산지</label>
          <input
            type="text"
            value={origin}
            onChange={(e) => onOriginChange(e.target.value)}
            placeholder="예) 국내산, 중국산"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  );
}
