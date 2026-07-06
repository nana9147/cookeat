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
import StatusBadge from '@/components/common/StatusBadge';
import { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import api from '@/lib/api';
import Pagination from '@/components/ui/Pagination';
import { useDebounce } from '@/hooks/useDebounce';
import { getPageNumbers, formatDateTime } from '@/lib/utils';
import { formatWon, formatDate } from '@/lib/format';
import type { AdminOrder, AdminOrderStatus } from '@/types/admin';

const PAGE_SIZE = 20;
const STATUSES: AdminOrderStatus[] = ['결제전', '결제완료', '주문확인', '배송준비', '배송중', '배송완료', '구매확정', '취소', '환불'];

export default function OrdersPage() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);
  const prevSearchRef = useRef(debouncedSearch);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [orderList, setOrderList] = useState<AdminOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFilter, setShowFilter] = useState(false);
  const [filterStatus, setFilterStatus] = useState<AdminOrderStatus | 'all'>('all');

  useEffect(() => {
    let cancelled = false;
    const isNewSearch = prevSearchRef.current !== debouncedSearch;
    prevSearchRef.current = debouncedSearch;

    const load = async () => {
      if (isNewSearch && page !== 1) {
        setPage(1);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const params: Record<string, string> = {
          page: String(page),
          limit: String(PAGE_SIZE),
        };
        if (debouncedSearch) params.keyword = debouncedSearch;
        if (filterStatus !== 'all') params.status = filterStatus;

        const { data } = await api.get('/admin/orders', { params });
        if (!cancelled) {
          setOrderList((data.orders as AdminOrder[]) ?? []);
          setTotal(data.pagination?.total ?? 0);
        }
      } catch (e) {
        if (!cancelled)
          setError(e instanceof Error ? e.message : '주문 목록을 불러오지 못했습니다.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, filterStatus, page]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  function handleFilterStatusChange(value: AdminOrderStatus | 'all') {
    setFilterStatus(value);
    setPage(1);
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">주문 관리</h1>
          <p className="text-sm text-muted-foreground">전체 주문: {total}건</p>
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
              onValueChange={(v) => handleFilterStatusChange(v as AdminOrderStatus | 'all')}
            >
              <SelectTrigger className="w-28">
                <SelectValue placeholder="전체" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                {STATUSES.map((o) => (
                  <SelectItem key={o} value={o}>
                    {o}
                  </SelectItem>
                ))}
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

      {error && <p className="text-sm text-red">{error}</p>}
      <div className="overflow-x-auto rounded-md border bg-white">
        <Table>
          <TableHeader className="bg-beige">
            <TableRow>
              <TableHead>주문번호</TableHead>
              <TableHead>주문자</TableHead>
              <TableHead className="hidden md:table-cell">주문일시</TableHead>
              <TableHead className="hidden md:table-cell">상품수</TableHead>
              <TableHead className="hidden md:table-cell">결제금액</TableHead>
              <TableHead>상태</TableHead>
              <TableHead>관리</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                  불러오는 중...
                </TableCell>
              </TableRow>
            ) : orderList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                  상품이 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              orderList.map((o) => (
                <TableRow key={o.orderId}>
                  <TableCell className="font-medium">{o.orderId}</TableCell>
                  <TableCell className="text-muted-foreground">{o.recipient}</TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">
                    {formatDate(o.createdAt)}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{o.orderItems.length}개</TableCell>
                  <TableCell className="hidden md:table-cell">{formatWon(o.finalAmount)}</TableCell>
                  <TableCell>
                    <StatusBadge status={o.status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <button
                        className="text-primary"
                        aria-label="상세보기"
                        onClick={() => setSelectedOrder(o)}
                      >
                        <Eye size={16} />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {total > 0 && (
        <div className="text-sm text-muted-foreground">
          {total}개 중 {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)}개
        </div>
      )}
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
        getPageNumbers={() => getPageNumbers(page, totalPages)}
      />

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
                  <span>{formatDateTime(selectedOrder.createdAt)}</span>
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
                      <span>{formatWon(item.unitPrice * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 font-semibold">결제 정보</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">상품 합계</span>
                    <span>{formatWon(selectedOrder.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">배송비</span>
                    <span>{formatWon(selectedOrder.shippingFee)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">쿠폰 할인</span>
                    <span>-{formatWon(selectedOrder.couponDiscount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">포인트 사용</span>
                    <span>-{formatWon(selectedOrder.usedPoint)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-1 font-semibold">
                    <span>최종 결제금액</span>
                    <span>{formatWon(selectedOrder.finalAmount)}</span>
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
