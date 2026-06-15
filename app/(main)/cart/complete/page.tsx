import { Suspense } from 'react';
import Complete from '@/components/(auth)/cart/complete/Complete';

export default function CompletePage() {
  return (
    <Suspense>
      <Complete />
    </Suspense>
  );
}
