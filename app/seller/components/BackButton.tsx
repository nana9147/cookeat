'use client';

import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function BackButton() {
  const router = useRouter();

  return (
    <Button variant={'outline'} size="sm" onClick={() => router.back()}>
      <ChevronLeft size={20} className="text-dark-text" />
    </Button>
  );
}
