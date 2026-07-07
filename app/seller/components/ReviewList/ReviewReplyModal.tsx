'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import type { ReviewReplyModalProps } from '@/types/seller/review';

export default function ReviewReplyModal({
  open,
  review,
  onClose,
  onSubmit,
}: ReviewReplyModalProps) {
  const [reply, setReply] = useState('');
  const [prevOpen, setPrevOpen] = useState(open);

  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) setReply(review?.reply?.content ?? '');
  }

  const handleSubmit = () => {
    if (!review || !reply.trim()) return;
    onSubmit(review.reviewId, reply);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-md">
        <DialogHeader>
          <DialogTitle>답글 작성</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <div className="bg-beige rounded-lg p-3">
            <p className="text-xs text-light-gray mb-1">
              {review?.userName} · {review?.productName}
            </p>
            <p className="text-sm text-gray-text">{review?.content}</p>
          </div>
          <Textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="답글을 입력하세요"
            className="resize-none h-28"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            취소
          </Button>
          <Button onClick={handleSubmit} disabled={!reply.trim()}>
            등록
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
