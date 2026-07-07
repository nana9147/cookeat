'use client';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import ThumbnailUploadField from './ThumbnailUploadField';
import type { RecipeBasicInfo, RecipeCategoryOption } from './types';

const DIFFICULTY_OPTIONS: RecipeBasicInfo['difficulty'][] = ['쉬움', '보통', '어려움'];

interface BasicInfoSectionProps {
  data: RecipeBasicInfo;
  categories: RecipeCategoryOption[];
  onChange: <K extends keyof RecipeBasicInfo>(field: K, value: RecipeBasicInfo[K]) => void;
}

export default function BasicInfoSection({ data, categories, onChange }: BasicInfoSectionProps) {
  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>기본 정보</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-5 pt-5">
        <ThumbnailUploadField
          preview={data.thumbnailPreview}
          onChange={(file, preview) => {
            onChange('thumbnail', file);
            onChange('thumbnailPreview', preview);
          }}
        />

        <div>
          <label className="block text-sm font-medium text-dark-text mb-1">
            레시피 제목 <span className="text-red-500">*</span>
          </label>
          <Input
            value={data.title}
            onChange={(e) => onChange('title', e.target.value)}
            placeholder="예: 크림 버섯 파스타"
            maxLength={100}
          />
        </div>

        <div className="grid grid-cols-1 tablet:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-dark-text mb-1">
              카테고리 <span className="text-red-500">*</span>
            </label>
            <Select
              value={data.recipeCategoryId}
              onValueChange={(value) => onChange('recipeCategoryId', value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="카테고리 선택" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.recipeCategoryId} value={String(c.recipeCategoryId)}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-text mb-1">
              조리시간 <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              min={1}
              value={data.cookingTime}
              onChange={(e) => onChange('cookingTime', e.target.value)}
              placeholder="25"
            />
            <p className="text-xs text-gray-text mt-1">분 단위</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-text mb-1">
              인분 <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              min={1}
              value={data.servings}
              onChange={(e) => onChange('servings', e.target.value)}
              placeholder="2"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-dark-text mb-1">
            난이도 <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {DIFFICULTY_OPTIONS.map((level) => (
              <Button
                key={level}
                type="button"
                variant={data.difficulty === level ? 'default' : 'outline'}
                onClick={() => onChange('difficulty', level)}
              >
                {level}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-dark-text mb-1">
            설명 <span className="text-red-500">*</span>
          </label>
          <Textarea
            value={data.description}
            onChange={(e) => onChange('description', e.target.value)}
            placeholder="레시피에 대한 간단한 설명을 입력하세요"
            rows={3}
          />
        </div>
      </CardContent>
    </Card>
  );
}
