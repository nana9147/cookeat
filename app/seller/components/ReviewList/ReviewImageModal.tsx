'use client';

import { Dialog, DialogContent } from '@/components/ui/dialog';
import type { ReviewImageModalProps } from '@/types/seller/review';

export default function ReviewImageModal({ open, imageUrl, onClose }: ReviewImageModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl p-2 bg-black border-0">
        {imageUrl && (
          <img src={imageUrl} alt="리뷰 이미지 원본" className="w-full h-auto rounded-lg" />
        )}
      </DialogContent>
    </Dialog>
  );
}
