'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface FormActionsProps {
  onSubmit: () => void;
  submitting: boolean;
  isEdit?: boolean;
}

export default function FormActions({ onSubmit, submitting, isEdit }: FormActionsProps) {
  const router = useRouter();

  return (
    <div className="flex justify-end gap-3">
      <Button type="button" variant="outline" onClick={() => router.back()} disabled={submitting}>
        취소
      </Button>
      <Button type="button" onClick={onSubmit} disabled={submitting}>
        {submitting ? '저장 중...' : isEdit ? '레시피 수정' : '레시피 등록'}
      </Button>
    </div>
  );
}
