'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import type { ReviewReportModalProps } from '@/types/seller/review';

const REPORT_REASONS = ['욕설 및 비방', '광고 및 스팸', '허위 사실', '개인정보 포함', '기타'];

export default function ReviewReportModal({
  open,
  review,
  onClose,
  onSubmit,
}: ReviewReportModalProps) {
  const [reason, setReason] = useState('');
  const [detail, setDetail] = useState('');

  useEffect(() => {
    if (open) {
      setReason('');
      setDetail('');
    }
  }, [open]);

  const handleSubmit = () => {
    if (!review || !reason) return;
    const finalReason = reason === '기타' ? detail : reason;
    onSubmit(review.reviewId, finalReason);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>리뷰 신고</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <p className="text-xs text-light-gray">신고 사유를 선택해주세요</p>
          <RadioGroup value={reason} onValueChange={setReason} className="flex flex-col gap-2">
            {REPORT_REASONS.map((r) => (
              <div key={r} className="flex items-center gap-2">
                <RadioGroupItem value={r} id={r} />
                <Label htmlFor={r} className="text-sm text-gray-text cursor-pointer">
                  {r}
                </Label>
              </div>
            ))}
          </RadioGroup>
          {reason === '기타' && (
            <Textarea
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              placeholder="신고 사유를 입력해주세요"
              className="resize-none h-24"
            />
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            취소
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!reason || (reason === '기타' && !detail.trim())}
            className="bg-red hover:bg-red/90 text-white border-0"
          >
            신고하기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
