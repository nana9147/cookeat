'use client';

import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import type { SellerInquiryTableProps } from '@/types/seller/inquiry';

export default function InquiryTable({
  inquiries,
  isLoading,
  page,
  totalPages,
  onPageChange,
  onReplyClick,
}: SellerInquiryTableProps) {
  return (
    <div className="min-w-0 rounded-md border bg-card overflow-x-auto">
      <Table className="min-w-[720px]">
        <TableHeader>
          <TableRow>
            <TableHead className="whitespace-nowrap">유형</TableHead>
            <TableHead>제목</TableHead>
            <TableHead className="whitespace-nowrap">연결 정보</TableHead>
            <TableHead className="whitespace-nowrap">작성자</TableHead>
            <TableHead className="whitespace-nowrap">작성일</TableHead>
            <TableHead className="whitespace-nowrap">상태</TableHead>
            <TableHead className="whitespace-nowrap">관리</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-light-gray py-8">
                불러오는 중...
              </TableCell>
            </TableRow>
          ) : inquiries.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-light-gray py-8">
                문의 내역이 없습니다.
              </TableCell>
            </TableRow>
          ) : (
            inquiries.map((inquiry) => (
              <TableRow key={inquiry.inquiryId}>
                <TableCell className="text-sm text-gray-text whitespace-nowrap">
                  {inquiry.type}
                </TableCell>
                <TableCell className="max-w-[240px] truncate">{inquiry.title}</TableCell>
                <TableCell className="text-sm text-gray-text whitespace-nowrap max-w-[180px] truncate">
                  {inquiry.linkedName}
                </TableCell>
                <TableCell className="whitespace-nowrap">{inquiry.author}</TableCell>
                <TableCell className="whitespace-nowrap">
                  {inquiry.createdAt.split('T')[0]}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <span className={inquiry.isAnswered ? 'text-emerald-500' : 'text-amber-500'}>
                    {inquiry.isAnswered ? '답변완료' : '미답변'}
                  </span>
                </TableCell>
                <TableCell>
                  <Button size="sm" variant="outline" onClick={() => onReplyClick(inquiry)}>
                    {inquiry.isAnswered ? '답변보기' : '답변하기'}
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 py-4">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`w-8 h-8 rounded-md text-sm ${
                p === page ? 'bg-primary text-white' : 'text-gray-text hover:bg-beige'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
