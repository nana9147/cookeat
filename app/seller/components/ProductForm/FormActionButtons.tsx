'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface FormActionButtonsProps {
  onSubmit: () => void;
}

export default function FormActionButtons({ onSubmit }: FormActionButtonsProps) {
  const router = useRouter();

  return (
    <div className="flex justify-end gap-3 pt-2">
      <Button type="button" variant="outline" onClick={() => router.back()}>
        취소
      </Button>
      <Button type="button" onClick={onSubmit}>
        등록하기
      </Button>
    </div>
  );
}
