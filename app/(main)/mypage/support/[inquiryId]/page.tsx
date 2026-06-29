'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { formatDate } from '@/lib/format';

type InquiryDetail = {
  inquiryId: number; category: string; title: string; content: string;
  createdAt: string; isAnswered: boolean;
  reply: { content: string; createdAt: string } | null;
};

export default function InquiryDetailPage({ params }: { params: Promise<{ inquiryId: string }> }) {
  const { inquiryId } = use(params);
  const [inquiry, setInquiry] = useState<InquiryDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<InquiryDetail>(`/inquiries/${inquiryId}`)
      .then(({ data }) => setInquiry(data))
      .catch(() => setInquiry(null))
      .finally(() => setLoading(false));
  }, [inquiryId]);

  if (loading) return (
    <div className="flex flex-col gap-4">
      {[1,2].map((i) => <div key={i} className="h-24 rounded-xl bg-beige animate-pulse" />)}
    </div>
  );

  if (!inquiry) return (
    <div className="flex flex-col items-center gap-3 py-20">
      <p className="text-sm text-gray-text">문의를 찾을 수 없습니다.</p>
      <Link href="/mypage/support" className="text-xs text-primary hover:underline">목록으로</Link>
    </div>
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-2">
        <Link href="/mypage/support" className="text-xs text-gray-text hover:text-dark-text">← 목록</Link>
        <span className="text-xs text-muted">/</span>
        <span className="text-xs text-dark-text">문의 상세</span>
      </div>
      <div className="flex flex-col gap-3 rounded-2xl border border-border p-5">
        <div className="flex items-center gap-2">
          <span className="text-xs bg-beige text-gray-text px-2 py-0.5 rounded-full">{inquiry.category}</span>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${inquiry.isAnswered ? 'bg-primary/10 text-primary' : 'bg-muted/20 text-muted'}`}>
            {inquiry.isAnswered ? '답변완료' : '답변대기'}
          </span>
        </div>
        <h3 className="font-semibold text-dark-text">{inquiry.title}</h3>
        <p className="text-xs text-gray-text">{formatDate(inquiry.createdAt)}</p>
        <hr className="border-border" />
        <p className="text-sm text-dark-text whitespace-pre-wrap">{inquiry.content}</p>
      </div>

      {inquiry.reply && (
        <div className="flex flex-col gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-primary">Cookeat 답변</span>
            <span className="text-xs text-gray-text">{formatDate(inquiry.reply.createdAt)}</span>
          </div>
          <p className="text-sm text-dark-text whitespace-pre-wrap">{inquiry.reply.content}</p>
        </div>
      )}
    </div>
  );
}
