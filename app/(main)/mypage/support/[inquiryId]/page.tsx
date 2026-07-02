'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { formatDateTime } from '@/lib/format';

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
    <div className="flex flex-col gap-4 px-1">
      <div className="h-6 w-24 rounded-lg bg-beige animate-pulse" />
      <div className="h-14 rounded-2xl bg-beige animate-pulse" />
      <div className="flex justify-end">
        <div className="h-20 w-3/4 rounded-2xl bg-beige animate-pulse" />
      </div>
      <div className="flex justify-start">
        <div className="h-20 w-3/4 rounded-2xl bg-beige animate-pulse" />
      </div>
    </div>
  );

  if (!inquiry) return (
    <div className="flex flex-col items-center gap-3 py-20">
      <p className="text-sm text-gray-text">문의를 찾을 수 없습니다.</p>
      <Link href="/mypage/support" className="text-xs text-primary hover:underline">목록으로</Link>
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      {/* 헤더 */}
      <div className="flex items-center gap-2">
        <Link href="/mypage/support" className="text-xs text-gray-text hover:text-dark-text">← 목록</Link>
      </div>

      {/* 제목 & 태그 */}
      <div className="flex flex-col gap-2 px-1">
        <div className="flex items-center gap-2">
          <span className="text-xs bg-beige text-gray-text px-2 py-0.5 rounded-full">{inquiry.category}</span>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${inquiry.isAnswered ? 'bg-primary/10 text-primary' : 'bg-muted/20 text-muted'}`}>
            {inquiry.isAnswered ? '답변완료' : '답변대기'}
          </span>
        </div>
        <h3 className="font-semibold text-dark-text">{inquiry.title}</h3>
      </div>

      {/* 채팅 영역 */}
      <div className="flex flex-col gap-4 pt-2">

        {/* 사용자 메시지 — 오른쪽 */}
        <div className="flex flex-col items-end gap-1">
          <div className="max-w-[80%] bg-primary text-white rounded-2xl rounded-tr-sm px-4 py-3">
            <p className="text-sm whitespace-pre-wrap leading-relaxed">{inquiry.content}</p>
          </div>
          <span className="text-[11px] text-gray-text pr-1">{formatDateTime(inquiry.createdAt)}</span>
        </div>

        {/* Cookeat 답변 — 왼쪽 */}
        {inquiry.reply ? (
          <div className="flex flex-col items-start gap-1">
            <span className="text-xs font-semibold text-primary pl-1">Cookeat</span>
            <div className="max-w-[80%] bg-beige border border-border rounded-2xl rounded-tl-sm px-4 py-3">
              <p className="text-sm text-dark-text whitespace-pre-wrap leading-relaxed">{inquiry.reply.content}</p>
            </div>
            <span className="text-[11px] text-gray-text pl-1">{formatDateTime(inquiry.reply.createdAt)}</span>
          </div>
        ) : (
          <div className="flex flex-col items-start gap-1">
            <span className="text-xs font-semibold text-muted pl-1">Cookeat</span>
            <div className="max-w-[80%] bg-beige border border-border border-dashed rounded-2xl rounded-tl-sm px-4 py-3">
              <p className="text-sm text-muted">답변을 준비 중입니다. 잠시만 기다려 주세요.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
