'use client';

import { Button } from '@/components/ui/button';

export default function TempSaveButton() {
  const handleTempSave = () => {
    // TODO: 임시저장 로직
    alert('임시저장 되었습니다.');
  };

  return (
    <Button type="button" variant="outline" onClick={handleTempSave}>
      임시저장
    </Button>
  );
}
