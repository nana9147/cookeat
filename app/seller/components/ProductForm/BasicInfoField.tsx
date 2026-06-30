'use client';

import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { BasicInfoFieldProps, ProductStatus } from '@/types/seller/product';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function BasicInfoField({ data, categories, onChange }: BasicInfoFieldProps) {
  const STATUS_OPTIONS: ProductStatus[] = ['판매중', '판매종료'];
  const selectedParent = categories.find((c) => String(c.categoryId) === data.parentCategoryId);

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
          <div className="flex gap-4">
            <Select
              value={data.parentCategoryId}
              onValueChange={(value) => {
                onChange('parentCategoryId', value);
                onChange('categoryId', '');
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="카테고리을 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.categoryId} value={String(c.categoryId)}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={data.categoryId}
              onValueChange={(value) => onChange('categoryId', value)}
              disabled={!selectedParent}
            >
              <SelectTrigger>
                <SelectValue placeholder="세부 카테고리를 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {(selectedParent?.children ?? []).map((child) => (
                  <SelectItem key={child.categoryId} value={String(child.categoryId)}>
                    {child.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 상품명 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            상품명 <span className="text-red-500">*</span>
          </label>
          <Input
            value={data.name}
            onChange={(e) => onChange('name', e.target.value)}
            placeholder="상품명을 입력하세요 (30자 이내 권장)"
            maxLength={100}
          />
          <p className="text-xs text-gray-400 mt-1">{data.name.length} / 100</p>
        </div>

        {/* 제조사 + 원산지 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">제조사</label>
            <Input
              value={data.brand}
              onChange={(e) => onChange('brand', e.target.value)}
              placeholder="제조사"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">원산지</label>
            <Input
              value={data.origin}
              onChange={(e) => onChange('origin', e.target.value)}
              placeholder="예) 국내산, 중국산"
            />
          </div>
        </div>
        {/* 판매 상태 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            판매 상태 <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            {STATUS_OPTIONS.map((s) => (
              <Button
                key={s}
                type="button"
                variant={data.status === s ? 'default' : 'outline'}
                size="sm"
                onClick={() => onChange('status', s)}
              >
                {s}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
