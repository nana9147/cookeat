'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { SELLER_CATEGORIES } from '@/lib/inquiryCategories';

type InquiryWriteTarget =
  | { kind: 'product'; productId: number }
  | { kind: 'orderItem'; orderItemId: number };

interface Options {
  target: InquiryWriteTarget;
  onSuccess: () => void;
  onClose: () => void;
}

export function useInquiryWriteForm({ target, onSuccess, onClose }: Options) {
  const [category, setCategory] = useState<string>(SELLER_CATEGORIES[0]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  async function handleSubmit() {
    if (!title.trim() || !content.trim()) { setError('제목과 내용을 입력해주세요.'); return; }
    setSubmitting(true);
    setError('');
    try {
      let imageUrls: string[] = [];
      if (images.length > 0) {
        const formData = new FormData();
        images.forEach((file) => formData.append('images', file));
        const { data } = await api.post<{ urls: string[] }>('/inquiries/images', formData, {
          headers: { 'Content-Type': undefined },
        });
        imageUrls = data.urls;
      }

      const body: Record<string, unknown> = { category, title: title.trim(), content: content.trim() };
      if (target.kind === 'product') body.productId = target.productId;
      else body.orderItemId = target.orderItemId;
      if (imageUrls.length > 0) body.images = imageUrls;

      await api.post('/inquiries', body);
      onSuccess();
      onClose();
    } catch (err: unknown) {
      type ApiErr = { response?: { data?: { error?: string } } };
      setError((err as ApiErr)?.response?.data?.error ?? '문의 등록에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  }

  return {
    category, setCategory, title, setTitle, content, setContent,
    images, setImages, submitting, error, handleSubmit,
  };
}
