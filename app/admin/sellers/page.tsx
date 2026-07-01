'use client';

import { Eye, Pencil, Filter, Star, Search } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
  SelectItem,
} from '@/components/ui/select';
import StatusBadge from '@/components/common/StatusBadge';
import api from '@/lib/api';
import Pagination from '@/components/ui/Pagination';
import { useDebounce } from '@/hooks/useDebounce';
import { getPageNumbers } from '@/lib/utils';
import { formatDate } from '@/lib/format';
import type { AdminApiSeller, AdminSellerStatus } from '@/types/admin';

const PAGE_SIZE = 20;

interface Seller {
  id: number;
  number: string;
  name: string;
  charge: string;
  joinedAt: string;
  productCount: number;
  address: string;
  bankName: string;
  bankAccount: string;
  representativeName: string;
  csPhone: string;
  rating: number | null;
  status: AdminSellerStatus;
}

function toSeller(s: AdminApiSeller): Seller {
  return {
    id: s.sellerId,
    number: s.businessNumber,
    name: s.storeName,
    charge: `${s.commissionRate}%`,
    joinedAt: formatDate(s.createdAt),
    productCount: s.productCount,
    address: s.businessAddress,
    bankName: s.bankName,
    bankAccount: s.bankAccount,
    representativeName: s.representativeName,
    csPhone: s.csPhone,
    rating: s.rating,
    status: s.status,
  };
}

function StarRating({ rating }: { rating: number | null }) {
  if (rating === null) return <span className="text-xs text-muted-foreground">-</span>;
  return (
    <div className="flex items-center gap-1">
      <Star size={14} className="fill-yellow text-yellow" />
      <span className="text-xs text-muted-foreground">{rating.toFixed(1)}</span>
    </div>
  );
}

export default function SellersPage() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);
  const prevSearchRef = useRef(debouncedSearch);
  const [sellerList, setSellerList] = useState<Seller[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);
  const [editSeller, setEditSeller] = useState<Seller | null>(null);

  const [showFilter, setShowFilter] = useState(false);
  const [filterStatus, setFilterStatus] = useState<AdminSellerStatus | 'all'>('all');
  const [filterCharge, setFilterCharge] = useState<string>('all');
  const [filterRating, setFilterRating] = useState<string>('all');

  useEffect(() => {
    let cancelled = false;
    const isNewSearch = prevSearchRef.current !== debouncedSearch;
    prevSearchRef.current = debouncedSearch;

    async function load() {
      if (isNewSearch && page !== 1) {
        setPage(1);
        return;
      }
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (debouncedSearch) params.set('keyword', debouncedSearch);
        if (filterStatus !== 'all') params.set('status', filterStatus);
        if (filterCharge !== 'all') params.set('chargeRange', filterCharge);
        if (filterRating !== 'all') {
          params.set('limit', '1000');
        } else {
          params.set('page', String(page));
          params.set('limit', String(PAGE_SIZE));
        }
        const { data } = await api.get<{ sellers: AdminApiSeller[]; pagination: { total: number } }>(
          `/admin/sellers?${params}`
        );
        if (!cancelled) {
          setSellerList(data.sellers.map(toSeller));
          setTotal(data.pagination.total);
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, filterStatus, filterCharge, filterRating, page]);

  function handleFilterStatusChange(value: AdminSellerStatus | 'all') {
    setFilterStatus(value);
    setPage(1);
  }

  function handleFilterChargeChange(value: string) {
    setFilterCharge(value);
    setPage(1);
  }

  function handleFilterRatingChange(value: string) {
    setFilterRating(value);
    setPage(1);
  }

  const handleViewDetail = (seller: Seller) => setSelectedSeller(seller);
  const handleEdit = (seller: Seller) => setEditSeller({ ...seller });

  const handleSaveEdit = async () => {
    if (!editSeller) return;
    try {
      const isSuspend = editSeller.status === '정지';
      const statusMap: Record<Exclude<AdminSellerStatus, '정지'>, string> = {
        승인: 'approved',
        대기: 'pending',
        거절: 'rejected',
      };
      const commissionRate = parseFloat(editSeller.charge);
      await api.patch(`/admin/sellers/${editSeller.id}/approve`, {
        ...(isSuspend
          ? { suspend: true }
          : { status: statusMap[editSeller.status as Exclude<AdminSellerStatus, '정지'>] }),
        ...(!isNaN(commissionRate) ? { commissionRate } : {}),
      });
      setSellerList((prev) => prev.map((s) => (s.id === editSeller.id ? editSeller : s)));
      setEditSeller(null);
    } catch {
      alert('판매자 정보 수정에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const filtered = sellerList.filter((s) => {
    if (filterRating === 'all') return true;
    if (s.rating === null) return true;
    if (filterRating === '4.5+') return s.rating >= 4.5;
    if (filterRating === '4.0+') return s.rating >= 4.0 && s.rating < 4.5;
    if (filterRating === 'low') return s.rating < 4.0;
    return true;
  });

  const filteredTotal = filterRating !== 'all' ? filtered.length : total;
  const totalPages = Math.ceil(filteredTotal / PAGE_SIZE);
  const pagedSellers =
    filterRating !== 'all' ? filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE) : filtered;

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">판매자 관리</h1>
          <p className="text-sm text-muted-foreground">전체 판매자: {total}명</p>
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
              onValueChange={(v) => handleFilterStatusChange(v as AdminSellerStatus | 'all')}
            >
              <SelectTrigger className="w-28">
                <SelectValue placeholder="전체" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="승인">승인</SelectItem>
                <SelectItem value="대기">대기</SelectItem>
                <SelectItem value="거절">거절</SelectItem>
                <SelectItem value="정지">정지</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">수수료율</span>
            <Select value={filterCharge} onValueChange={handleFilterChargeChange}>
              <SelectTrigger className="w-28">
                <SelectValue placeholder="전체" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="low">10% 이하</SelectItem>
                <SelectItem value="mid">10~20%</SelectItem>
                <SelectItem value="high">20% 초과</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">평점</span>
            <Select value={filterRating} onValueChange={handleFilterRatingChange}>
              <SelectTrigger className="w-28">
                <SelectValue placeholder="전체" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="4.5+">4.5 이상</SelectItem>
                <SelectItem value="4.0+">4.0 ~ 4.5</SelectItem>
                <SelectItem value="low">4.0 미만</SelectItem>
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
          placeholder="판매자명, 사업자 번호로 검색"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto rounded-md border bg-white">
        <Table>
          <TableHeader className="bg-beige">
            <TableRow>
              <TableHead>판매자명</TableHead>
              <TableHead className="hidden md:table-cell">사업자번호</TableHead>
              <TableHead className="hidden md:table-cell">가입일</TableHead>
              <TableHead className="hidden lg:table-cell">상품수</TableHead>
              <TableHead className="hidden lg:table-cell">평점</TableHead>
              <TableHead className="hidden md:table-cell">수수료율</TableHead>
              <TableHead>상태</TableHead>
              <TableHead>관리</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                  불러오는 중...
                </TableCell>
              </TableRow>
            ) : pagedSellers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                  판매자가 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              pagedSellers.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">{s.number}</TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">{s.joinedAt}</TableCell>
                  <TableCell className="hidden lg:table-cell">{s.productCount}건</TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <StarRating rating={s.rating} />
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{s.charge}</TableCell>
                  <TableCell>
                    <StatusBadge status={s.status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <button
                        className="text-primary"
                        aria-label="상세보기"
                        onClick={() => handleViewDetail(s)}
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        className="text-gray-text"
                        aria-label="수정"
                        onClick={() => handleEdit(s)}
                      >
                        <Pencil size={16} />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="text-sm text-muted-foreground">
        {filteredTotal > 0 && (
          <div className="text-sm text-muted-foreground">
            {filteredTotal}명 중 {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filteredTotal)}명
          </div>
        )}
      </div>
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
        getPageNumbers={() => getPageNumbers(page, totalPages)}
      />

      <Dialog open={!!selectedSeller} onOpenChange={() => setSelectedSeller(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>판매자 상세 정보</DialogTitle>
          </DialogHeader>
          {selectedSeller && (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">판매자명</span>
                <span className="font-medium">{selectedSeller.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">사업자 번호</span>
                <span>{selectedSeller.number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">대표자명</span>
                <span>{selectedSeller.representativeName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">CS 연락처</span>
                <span>{selectedSeller.csPhone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">가입일</span>
                <span>{selectedSeller.joinedAt}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">상품수</span>
                <span>{selectedSeller.productCount}건</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">평점</span>
                <StarRating rating={selectedSeller.rating} />
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">수수료율</span>
                <span>{selectedSeller.charge}</span>
              </div>
              <div className="border-t pt-3 flex justify-between">
                <span className="text-muted-foreground">상태</span>
                <StatusBadge status={selectedSeller.status} />
              </div>
              <div className="border-t pt-3 flex justify-between">
                <span className="text-muted-foreground">사업장 주소</span>
                <span className="text-right max-w-[60%]">{selectedSeller.address}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">정산 계좌</span>
                <span>
                  {selectedSeller.bankName} {selectedSeller.bankAccount}
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!editSeller} onOpenChange={() => setEditSeller(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>판매자 정보 수정</DialogTitle>
          </DialogHeader>
          {editSeller && (
            <div className="space-y-4 text-sm">
              <div className="flex flex-col gap-1.5">
                <label className="text-muted-foreground">수수료율</label>
                <input
                  className="border rounded px-3 py-1.5 text-sm w-full"
                  value={editSeller.charge}
                  onChange={(e) => setEditSeller({ ...editSeller, charge: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-muted-foreground">상태</label>
                <Select
                  value={editSeller.status}
                  onValueChange={(value) =>
                    setEditSeller({ ...editSeller, status: value as AdminSellerStatus })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="승인">승인</SelectItem>
                    <SelectItem value="대기">대기</SelectItem>
                    <SelectItem value="거절">거절</SelectItem>
                    <SelectItem value="정지">정지</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => setEditSeller(null)}>
                  취소
                </Button>
                <Button size="sm" onClick={handleSaveEdit}>
                  저장
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
