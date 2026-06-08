'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ProductInfoFieldProps } from '@/types/seller/product';
import { Textarea } from '@/components/ui/textarea';
import type { FoodType } from '@/types/seller/product';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function ProductInfoField({ data, onChange }: ProductInfoFieldProps) {
  const FOOD_TYPES: FoodType[] = [
    '채소',
    '과일·견과',
    '정육·계란',
    '수산·해산물',
    '쌀·잡곡',
    '유제품',
    '오일/소스',
    '밀키트',
    '기타',
  ];

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>상품 정보 제공 고시</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-5 pt-5">
        <label className="block text-sm font-medium text-gray-700 mb-1">품목 또는 명칭</label>
        <Input
          value={data.infoItemName}
          onChange={(e) => onChange('infoItemName', e.target.value)}
          placeholder="예) 강원도 통통 감자 3kg"
        />
        <label className="block text-sm font-medium text-gray-700 mb-1">중량/용량</label>
        <Input
          value={data.infoWeight}
          onChange={(e) => onChange('infoWeight', e.target.value)}
          placeholder="예) 3kg / 약 100g (제품 특성상 조금씩 차이 있음)"
        />
        <label className="block text-sm font-medium text-gray-700 mb-1">상품 유형</label>
        <Select
          value={data.infoFoodType}
          onValueChange={(value) => onChange('infoFoodType', value as FoodType)}
        >
          <SelectTrigger>
            <SelectValue placeholder="식품 유형을 선택하세요" />
          </SelectTrigger>
          <SelectContent>
            {FOOD_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <label className="block text-sm font-medium text-gray-700 mb-1">생산자/수입자</label>
        <Input
          value={data.infoProducer}
          onChange={(e) => onChange('infoProducer', e.target.value)}
          placeholder="예) 멋사네 감자농장"
        />
        <label className="block text-sm font-medium text-gray-700 mb-1">원산지</label>
        <Input
          value={data.infoOrigin}
          onChange={(e) => onChange('infoOrigin', e.target.value)}
          placeholder="예) 국내산 / 강원도"
        />
        <label className="block text-sm font-medium text-gray-700 mb-1">제조연월일/유통기한</label>
        <Textarea
          value={data.infoExpirationDate}
          onChange={(e) => onChange('infoExpirationDate', e.target.value)}
          placeholder="예) 제조연월일: 2026-01-08 / 유통기한:2028-01-07"
          rows={3}
        />
        <label className="block text-sm font-medium text-gray-700 mb-1">보관방법</label>
        <Textarea
          value={data.infoStorageMethod}
          onChange={(e) => onChange('infoStorageMethod', e.target.value)}
          placeholder="예) 개봉전 직사광선이 없는 상온 보관가능, 개봉후 냉장 보관 "
          rows={3}
        />
      </CardContent>
    </Card>
  );
}
