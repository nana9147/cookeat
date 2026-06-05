'use client';

import { useRouter } from 'next/navigation';

interface FormActionButtonsProps {
  onSubmit: () => void;
}

export default function FormActionButtons({ onSubmit }: FormActionButtonsProps) {
  const router = useRouter();

  return (
    <div className="flex justify-end gap-3 pt-2">
      <button
        type="button"
        onClick={() => router.back()}
        className="px-5 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
      >
        취소
      </button>
      <button
        type="button"
        onClick={onSubmit}
        className="px-5 py-2 text-sm text-white bg-green-700 rounded-md hover:bg-green-800 transition-colors"
      >
        등록하기
      </button>
    </div>
  );
}
