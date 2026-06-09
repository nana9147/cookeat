'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { FormActionButtonsProps } from '@/types/seller/product';

export default function FormActionButtons({ mode, onSubmit }: FormActionButtonsProps) {
  const router = useRouter();

  return (
    <div className="flex justify-end gap-3 pt-2">
      <Button type="button" variant="outline" onClick={() => router.back()}>
        취소
      </Button>
      <Button type="button" onClick={onSubmit}>
        {mode === 'create' ? '등록하기' : '수정하기'}
      </Button>
    </div>
  );
}
