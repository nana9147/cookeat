'use client';

import { Eye, Filter, Search } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type Status = '결제완료' | '주문확인' | '배송준비' | '배송중' | '배송완료' | '취소';

interface OrderItem {
  itemId: number;
  orderId: string;
  productId: number;
  productName: string;
  sellerId: number;
  quantity: number;
  unitPrice: number;
}

interface Shipping {
  shippingId: number;
  orderId: string;
  carrier: string;
  trackingNumber: string;
  shippedAt: string | null;
  deliveredAt: string | null;
}

interface Order {
  orderId: string;
  userId: number;
  totalAmount: number;
  shippingFee: number;
  usedPoint: number;
  couponId: number | null;
  couponDiscount: number;
  finalAmount: number;
  paymentMethod: string;
  status: Status;
  recipient: string;
  phone: string;
  address: string;
  addressDetail: string;
  shippingRequest: string | null;
  createdAt: string;
  updatedAt: string;
  orderItems: OrderItem[];
}

const order: Order[] = [
  {
    orderId: 'ORD-001',
    userId: 1,
    totalAmount: 18000,
    shippingFee: 3000,
    usedPoint: 0,
    couponId: null,
    couponDiscount: 0,
    finalAmount: 21000,
    paymentMethod: '카드',
    status: '배송중',
    recipient: '김쿡잇',
    phone: '010-1234-5678',
    address: '서울시 강남구 테헤란로 123',
    addressDetail: '456호',
    shippingRequest: null,
    createdAt: '2026-06-04T00:00:00',
    updatedAt: '2026-06-04T00:00:00',
    orderItems: [
      {
        itemId: 1,
        orderId: 'ORD-001',
        productId: 10,
        productName: '된장찌개 밀키트',
        sellerId: 1,
        quantity: 2,
        unitPrice: 8000,
      },
      {
        itemId: 2,
        orderId: 'ORD-001',
        productId: 11,
        productName: '김치볶음밥 밀키트',
        sellerId: 1,
        quantity: 1,
        unitPrice: 2000,
      },
    ],
  },
  {
    orderId: 'ORD-002',
    userId: 2,
    totalAmount: 19000,
    shippingFee: 3000,
    usedPoint: 0,
    couponId: null,
    couponDiscount: 0,
    finalAmount: 22000,
    paymentMethod: '카드',
    status: '결제완료',
    recipient: '이레시피',
    phone: '010-1234-5678',
    address: '서울시 강남구 테헤란로 123',
    addressDetail: '456호',
    shippingRequest: '문 앞에 놔주세요',
    createdAt: '2026-06-04T00:00:00',
    updatedAt: '2026-06-04T00:00:00',
    orderItems: [
      {
        itemId: 3,
        orderId: 'ORD-002',
        productId: 12,
        productName: '부대찌개 밀키트',
        sellerId: 2,
        quantity: 1,
        unitPrice: 9500,
      },
      {
        itemId: 4,
        orderId: 'ORD-002',
        productId: 13,
        productName: '순두부찌개 밀키트',
        sellerId: 2,
        quantity: 1,
        unitPrice: 9500,
      },
    ],
  },
  {
    orderId: 'ORD-003',
    userId: 3,
    totalAmount: 8000,
    shippingFee: 3000,
    usedPoint: 0,
    couponId: null,
    couponDiscount: 0,
    finalAmount: 11000,
    paymentMethod: '카드',
    status: '취소',
    recipient: '박요리',
    phone: '010-1234-5678',
    address: '서울시 강남구 테헤란로 123',
    addressDetail: '456호',
    shippingRequest: null,
    createdAt: '2026-06-04T00:00:00',
    updatedAt: '2026-06-04T00:00:00',
    orderItems: [
      {
        itemId: 5,
        orderId: 'ORD-003',
        productId: 14,
        productName: '갈비찜 밀키트',
        sellerId: 3,
        quantity: 1,
        unitPrice: 8000,
      },
    ],
  },
  {
    orderId: 'ORD-004',
    userId: 4,
    totalAmount: 38000,
    shippingFee: 3000,
    usedPoint: 0,
    couponId: null,
    couponDiscount: 0,
    finalAmount: 41000,
    paymentMethod: '카드',
    status: '배송완료',
    recipient: '최맛있',
    phone: '010-1234-5678',
    address: '서울시 강남구 테헤란로 123',
    addressDetail: '456호',
    shippingRequest: null,
    createdAt: '2026-06-04T00:00:00',
    updatedAt: '2026-06-04T00:00:00',
    orderItems: [
      {
        itemId: 6,
        orderId: 'ORD-004',
        productId: 15,
        productName: '삼겹살 구이 밀키트',
        sellerId: 4,
        quantity: 2,
        unitPrice: 12000,
      },
      {
        itemId: 7,
        orderId: 'ORD-004',
        productId: 16,
        productName: '닭갈비 밀키트',
        sellerId: 4,
        quantity: 1,
        unitPrice: 9000,
      },
      {
        itemId: 8,
        orderId: 'ORD-004',
        productId: 17,
        productName: '해물파전 밀키트',
        sellerId: 4,
        quantity: 1,
        unitPrice: 5000,
      },
    ],
  },
];

const statusBadge: Record<Status, string> = {
  결제완료: 'bg-primary text-white',
  주문확인: 'bg-primary text-white',
  배송준비: 'bg-yellow text-white',
  배송중: 'bg-yellow text-white',
  배송완료: 'bg-muted text-white',
  취소: 'bg-red text-white',
};

export default function MembersPage() {
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderList, setOrderList] = useState<Order[]>(order);

  const [showFilter, setShowFilter] = useState(false);
  const [filterStatus, setFilterStatus] = useState<Status | 'all'>('all');

  const handleViewDetail = (order: Order) => {
    setSelectedOrder(order);
  };

  const filtered = orderList.filter((o) => {
    const matchSearch = o.orderId.includes(search) || o.recipient.includes(search);
    const matchStatus = filterStatus === 'all' || o.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">주문 관리</h1>
          <p className="text-sm text-muted-foreground">오늘 주문: 234건</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={() => setShowFilter((prev) => !prev)}
        >
          <Filter size={14} />
          필터
        </Button>
      </div>

      {showFilter && (
        <div className="flex flex-wrap items-end gap-3 rounded-md border bg-white p-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">상태</span>
            <Select
              value={filterStatus}
              onValueChange={(v) => setFilterStatus(v as Status | 'all')}
            >
              <SelectTrigger className="w-28">
                <SelectValue placeholder="전체" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="결제완료">결제완료</SelectItem>
                <SelectItem value="주문확인">주문확인</SelectItem>
                <SelectItem value="배송중">배송중</SelectItem>
                <SelectItem value="배송완료">배송완료</SelectItem>
                <SelectItem value="배송준비">배송준비</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      <div className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          className="pl-9"
          placeholder="주문자명, 주문 번호로 검색"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto rounded-md border bg-white">
        <Table>
          <TableHeader className="bg-beige">
            <TableRow>
              <TableHead>주문번호</TableHead>
              <TableHead>주문자</TableHead>
              <TableHead>주문일시</TableHead>
              <TableHead>상품수</TableHead>
              <TableHead>결제금액</TableHead>
              <TableHead>상태</TableHead>
              <TableHead>관리</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((o) => (
              <TableRow key={o.orderId}>
                <TableCell className="font-medium">{o.orderId}</TableCell>
                <TableCell className="text-muted-foreground">{o.recipient}</TableCell>
                <TableCell className="text-muted-foreground">{o.createdAt}</TableCell>
                <TableCell>{o.orderItems.length}개</TableCell>
                <TableCell>{o.finalAmount.toLocaleString()}원</TableCell>
                <TableCell>
                  <span
                    className={`rounded px-2 py-0.5 text-xs font-medium ${statusBadge[o.status]}`}
                  >
                    {o.status}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <button
                      className="text-primary"
                      aria-label="상세보기"
                      onClick={() => handleViewDetail(o)}
                    >
                      <Eye size={16} />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>주문 상세정보</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">주문일시</span>
                  <span>{selectedOrder.createdAt}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">수령인</span>
                  <span>{selectedOrder.recipient}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">연락처</span>
                  <span>{selectedOrder.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">배송지</span>
                  <span>
                    {selectedOrder.address} {selectedOrder.addressDetail}
                  </span>
                </div>
                {selectedOrder.shippingRequest && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">배송 요청사항</span>
                    <span>{selectedOrder.shippingRequest}</span>
                  </div>
                )}
              </div>

              <div>
                <p className="mb-2 font-semibold">주문 상품</p>
                <div className="space-y-1">
                  {selectedOrder.orderItems.map((item) => (
                    <div key={item.itemId} className="flex justify-between text-sm">
                      <span>
                        {item.productName} x{item.quantity}
                      </span>
                      <span>{(item.unitPrice * item.quantity).toLocaleString()}원</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 font-semibold">결제 정보</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">상품 합계</span>
                    <span>{selectedOrder.totalAmount.toLocaleString()}원</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">배송비</span>
                    <span>{selectedOrder.shippingFee.toLocaleString()}원</span>
                  </div>
                  {
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">쿠폰 할인</span>
                      <span>-{selectedOrder.couponDiscount.toLocaleString()}원</span>
                    </div>
                  }
                  {
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">포인트 사용</span>
                      <span>-{selectedOrder.usedPoint.toLocaleString()}원</span>
                    </div>
                  }
                  <div className="flex justify-between border-t pt-1 font-semibold">
                    <span>최종 결제금액</span>
                    <span>{selectedOrder.finalAmount.toLocaleString()}원</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">결제수단</span>
                    <span>{selectedOrder.paymentMethod}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
