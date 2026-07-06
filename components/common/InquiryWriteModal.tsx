'use client';

import { X } from 'lucide-react';
import { useInquiryWriteForm } from '@/hooks/useInquiryWriteForm';
import { InquiryImagePicker } from './InquiryImagePicker';
import { SELLER_CATEGORIES } from '@/lib/inquiryCategories';

type Props =
  | { target: 'product'; productId: number; targetName: string; onClose: () => void; onSuccess: () => void }
  | { target: 'orderItem'; orderItemId: number; targetName: string; onClose: () => void; onSuccess: () => void };

export default function InquiryWriteModal(props: Props) {
  const { target, targetName, onClose, onSuccess } = props;
  const inquiryTarget =
    target === 'product'
      ? { kind: 'product' as const, productId: props.productId }
      : { kind: 'orderItem' as const, orderItemId: props.orderItemId };

  const { category, setCategory, title, setTitle, content, setContent, images, setImages, submitting, error, handleSubmit } =
    useInquiryWriteForm({ target: inquiryTarget, onSuccess, onClose });

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-xl flex flex-col">
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-border">
          <h2 className="font-bold text-dark-text">1:1 문의</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-hover transition-colors">
            <X className="w-5 h-5 text-gray-text" />
          </button>
        </div>
        <div className="px-5 py-5 flex flex-col gap-4">
          <p className="text-sm text-gray-text">{targetName}</p>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-gray-text">문의 유형</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="h-10 rounded-lg border border-border px-3 text-sm text-dark-text bg-white focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {SELLER_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-gray-text">제목</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="문의 제목을 입력하세요"
              className="h-10 rounded-lg border border-border px-3 text-sm text-dark-text placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-gray-text">내용</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              placeholder="문의 내용을 입력하세요"
              className="rounded-lg border border-border px-3 py-2.5 text-sm text-dark-text placeholder:text-muted resize-none focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <InquiryImagePicker files={images} onChange={setImages} />
          {error && <p className="text-xs text-red">{error}</p>}
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 h-11 rounded-xl border border-border text-sm text-gray-text font-medium hover:bg-hover transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 h-11 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {submitting ? '등록 중...' : '문의 등록'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
