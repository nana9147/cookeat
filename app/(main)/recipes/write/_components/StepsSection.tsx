'use client';

import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StepItem from './StepItem';
import type { StepFormItem } from './types';

interface StepsSectionProps {
  steps: StepFormItem[];
  onAdd: () => void;
  onRemove: (id: string) => void;
  onChange: (id: string, field: 'title' | 'description' | 'tip', value: string) => void;
  onImageChange: (id: string, file: File | null, preview: string | null) => void;
}

export default function StepsSection({
  steps,
  onAdd,
  onRemove,
  onChange,
  onImageChange,
}: StepsSectionProps) {
  return (
    <Card>
      <CardHeader className="border-b flex items-center justify-between">
        <CardTitle>조리 순서</CardTitle>
        <Button type="button" size="sm" onClick={onAdd} className="gap-1">
          <Plus className="w-4 h-4" /> 단계 추가
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 pt-5">
        {steps.map((step, index) => (
          <StepItem
            key={step.id}
            step={step}
            order={index + 1}
            canRemove={steps.length > 1}
            onChange={onChange}
            onRemove={onRemove}
            onImageChange={onImageChange}
          />
        ))}
      </CardContent>
    </Card>
  );
}
