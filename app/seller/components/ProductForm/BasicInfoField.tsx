'use client';

import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    <Card>
      <CardHeader className="border-b">
        <CardTitle>기본 정보</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-5 pt-5">
        {/* 카테고리 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            카테고리 <span className="text-red-500">*</span>
          </label>
          <Input
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            placeholder="카테고리를 입력하세요"
          />
        </div>

        {/* 상품명 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            상품명 <span className="text-red-500">*</span>
          </label>
          <Input
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="상품명을 입력하세요 (30자 이내 권장)"
            maxLength={100}
          />
          <p className="text-xs text-gray-400 mt-1">{name.length} / 100</p>
        </div>

        {/* 제조사 + 원산지 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">제조사</label>
            <Input
              value={manufacturer}
              onChange={(e) => onManufacturerChange(e.target.value)}
              placeholder="제조사"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">원산지</label>
            <Input
              value={origin}
              onChange={(e) => onOriginChange(e.target.value)}
              placeholder="예) 국내산, 중국산"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
