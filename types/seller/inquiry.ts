export type SellerInquiryType = '상품문의' | '배송문의' | '주문문의';

export interface SellerInquiryRow {
  inquiryId: number;
  type: SellerInquiryType;
  title: string;
  content: string;
  author: string;
  linkedName: string;
  isAnswered: boolean;
  reply: { content: string; createdAt: string } | null;
  createdAt: string;
  images: string[];
}

export interface SellerInquiryStats {
  totalCount: number;
  waitingCount: number;
  answeredCount: number;
}

export interface SellerInquiryTableProps {
  inquiries: SellerInquiryRow[];
  isLoading?: boolean;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onReplyClick: (inquiry: SellerInquiryRow) => void;
}

export interface SellerInquiryReplyModalProps {
  inquiry: SellerInquiryRow | null;
  onClose: () => void;
  onSubmitted: () => void;
}
