'use client';

import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function BackButton() {
  const router = useRouter();

  return (
    <Button className="p-4" size="sm" onClick={() => router.back()}>
      <ChevronLeft />
      뒤로가기
    </Button>
  );
}
