'use client';

import { useState } from 'react';
import Image from 'next/image';
import api from '@/lib/api';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { X, ChevronLeft, ChevronRight, User, Package, Calendar, MessageCircle } from 'lucide-react';
import type { SellerInquiryReplyModalProps } from '@/types/seller/inquiry';

const TYPE_BADGE_STYLE: Record<string, string> = {
  상품문의: 'bg-blue-50 text-blue-600',
  배송문의: 'bg-purple-50 text-purple-600',
  주문문의: 'bg-amber-50 text-amber-600',
};

export default function InquiryReplyModal({
  inquiry,
  onClose,
  onSubmitted,
}: SellerInquiryReplyModalProps) {
  const [content, setContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [prevInquiryId, setPrevInquiryId] = useState(inquiry?.inquiryId);

  if (inquiry?.inquiryId !== prevInquiryId) {
    setPrevInquiryId(inquiry?.inquiryId);
    setContent('');
    setIsEditing(false);
    setPreviewIndex(null);
  }

  if (!inquiry) return null;

  const isNewReply = !inquiry.isAnswered;
  const showForm = isNewReply || isEditing;
  const images = inquiry.images;

  const startEditing = () => {
    setContent(inquiry.reply?.content ?? '');
    setIsEditing(true);
  };

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast.error('답변 내용을 입력해주세요.');
      return;
    }
    setIsSubmitting(true);
    try {
      if (isNewReply) {
        await api.post(`/seller/inquiries/${inquiry.inquiryId}/reply`, { content: content.trim() });
        toast.success('답변이 등록되었습니다.');
      } else {
        await api.patch(`/seller/inquiries/${inquiry.inquiryId}/reply`, {
          content: content.trim(),
        });
        toast.success('답변이 수정되었습니다.');
      }
      onSubmitted();
    } catch (e) {
      const msg =
        (e as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        (e instanceof Error ? e.message : '답변 처리에 실패했습니다.');
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Dialog open onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-xl max-mobile:max-w-[92vw] p-0 overflow-hidden gap-0">
          {/* 헤더 */}
          <DialogHeader className="px-6 pt-6 pb-4 space-y-3">
            <div className="flex items-center gap-2">
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-medium ${TYPE_BADGE_STYLE[inquiry.type] ?? 'bg-beige text-gray-text'}`}
              >
                {inquiry.type}
              </span>
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                  inquiry.isAnswered
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'bg-amber-50 text-amber-600'
                }`}
              >
                {inquiry.isAnswered ? '답변완료' : '미답변'}
              </span>
            </div>
            <DialogTitle className="text-lg font-bold text-dark-text leading-snug text-left">
              {inquiry.title}
            </DialogTitle>
          </DialogHeader>

          <div className="px-6 max-mobile:px-4 pb-6 space-y-4 max-h-[70vh] max-mobile:max-h-[65vh] overflow-y-auto">
            {/* 메타 정보 */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-light-gray">
              <span className="flex items-center gap-1">
                <User size={13} />
                {inquiry.author}
              </span>
              <span className="flex items-center gap-1">
                <Package size={13} />
                {inquiry.linkedName}
              </span>
              <span className="flex items-center gap-1">
                <Calendar size={13} />
                {inquiry.createdAt.split('T')[0]}
              </span>
            </div>

            {/* 문의 원문 */}
            <div className="bg-beige/60 rounded-xl p-4">
              <p className="text-sm text-dark-text whitespace-pre-wrap leading-relaxed">
                {inquiry.content}
              </p>

              {images.length > 0 && (
                <div className="flex gap-2 flex-wrap mt-3">
                  {images.map((url, i) => (
                    <button
                      key={url}
                      type="button"
                      onClick={() => setPreviewIndex(i)}
                      className="group relative w-16 h-16 rounded-lg overflow-hidden border border-border shrink-0 transition-shadow hover:shadow-md"
                    >
                      <Image
                        src={url}
                        alt={`첨부 이미지 ${i + 1}`}
                        fill
                        className="object-cover transition-transform duration-200 group-hover:scale-110"
                        sizes="64px"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 답변 영역 */}
            {showForm ? (
              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-text flex items-center gap-1">
                  <MessageCircle size={13} />
                  판매자 답변
                </p>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="고객이 남긴 문의에 답변을 작성해주세요."
                  rows={5}
                  autoFocus
                  className="resize-none focus-visible:ring-primary/40"
                />
              </div>
            ) : (
              <div className="rounded-xl border-l-4 border-primary bg-primary/5 p-4">
                <p className="text-xs font-medium text-primary mb-1.5 flex items-center gap-1">
                  <MessageCircle size={13} />
                  판매자 답변
                </p>
                <p className="text-sm text-dark-text whitespace-pre-wrap leading-relaxed">
                  {inquiry.reply?.content}
                </p>
                {inquiry.reply?.createdAt && (
                  <p className="text-[11px] text-light-gray mt-2">
                    {inquiry.reply.createdAt.split('T')[0]} 답변
                  </p>
                )}
              </div>
            )}
          </div>

          <DialogFooter className="px-6 max-mobile:px-4 pt-4 pb-6 border-t border-border bg-beige/30">
            {showForm ? (
              <>
                {isEditing && (
                  <Button
                    variant="ghost"
                    onClick={() => setIsEditing(false)}
                    disabled={isSubmitting}
                  >
                    취소
                  </Button>
                )}
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? '처리 중...' : isNewReply ? '답변 등록' : '수정 완료'}
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={startEditing}>
                답변 수정
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 라이트박스 */}
      {previewIndex !== null && (
        <div
          className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-150"
          onClick={() => setPreviewIndex(null)}
        >
          <button
            type="button"
            onClick={() => setPreviewIndex(null)}
            className="absolute top-5 right-5 max-mobile:top-3 max-mobile:right-3 text-white/80 hover:text-white transition-colors"
          >
            <X size={28} />
          </button>

          {images.length > 1 && previewIndex > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setPreviewIndex((i) => (i !== null ? i - 1 : i));
              }}
              className="absolute left-2 max-mobile:left-1 text-white/70 hover:text-white transition-colors"
            >
              <ChevronLeft size={32} className="max-mobile:w-6 max-mobile:h-6" />
            </button>
          )}

          <div
            className="relative w-full max-w-3xl h-[80vh] animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[previewIndex]}
              alt={`첨부 이미지 확대보기 ${previewIndex + 1}`}
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>

          {images.length > 1 && previewIndex < images.length - 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setPreviewIndex((i) => (i !== null ? i + 1 : i));
              }}
              className="absolute right-2 max-mobile:right-1 text-white/70 hover:text-white transition-colors"
            >
              <ChevronRight size={32} className="max-mobile:w-6 max-mobile:h-6" />
            </button>
          )}

          {images.length > 1 && (
            <span className="absolute bottom-6 text-white/60 text-sm">
              {previewIndex + 1} / {images.length}
            </span>
          )}
        </div>
      )}
    </>
  );
}
