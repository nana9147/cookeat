'use client';

import { useState } from 'react';
import api from '@/lib/api';
import { GENERAL_CATEGORIES } from '@/lib/inquiryCategories';

// 상품/주문 관련 문의는 상품 상세·주문 상세의 "문의하기"에서 각각 연결값과 함께 등록된다.
// 여기 마이페이지 문의하기는 연결값이 없는 일반 문의만 다루며, 사진 첨부는 없다
// (계정/포인트/레시피 문의는 사진 증빙이 필요한 배송·주문 문의와 달리 첨부가 필요 없음).
type Props = { onSubmitted: () => void; onCancel: () => void };

export default function InquiryForm({ onSubmitted, onCancel }: Props) {
  const [category, setCategory] = useState<string>(GENERAL_CATEGORIES[0]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError('제목과 내용을 입력해주세요.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await api.post('/inquiries', { category, title: title.trim(), content: content.trim() });
      onSubmitted();
    } catch {
      setError('문의 등록에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <h4 className="font-semibold text-dark-text">1:1 문의 등록</h4>
      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-gray-text">문의 유형</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="h-10 rounded-lg border border-border px-3 text-sm text-dark-text bg-white focus:outline-none focus:ring-1 focus:ring-primary"
        >
          {GENERAL_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
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
          rows={15}
          placeholder="문의 내용을 입력하세요"
          className="rounded-lg border border-border px-3 py-2.5 text-sm text-dark-text placeholder:text-muted resize-none focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>
      {error && <p className="text-xs text-red">{error}</p>}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 h-10 rounded-lg border border-border text-sm text-gray-text hover:bg-hover transition-colors"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 h-10 rounded-lg bg-primary text-sm text-white font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {submitting ? '등록 중...' : '문의 등록'}
        </button>
      </div>
    </form>
  );
}
