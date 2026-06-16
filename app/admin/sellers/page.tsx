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
import { useState, useEffect } from 'react';
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

const PAGE_SIZE = 20;

type Status = '승인' | '대기' | '거절' | '정지';

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
  status: Status;
}

interface ApiSeller {
  sellerId: number;
  storeName: string;
  businessNumber: string;
  businessAddress: string;
  bankName: string;
  bankAccount: string;
  commissionRate: number;
  representativeName: string;
  csPhone: string;
  status: Status;
  productCount: number;
  rating: number | null;
  createdAt: string;
}

function toSeller(s: ApiSeller): Seller {
  return {
    id: s.sellerId,
    number: s.businessNumber,
    name: s.storeName,
    charge: `${s.commissionRate}%`,
    joinedAt: s.createdAt.split('T')[0].replace(/-/g, '.'),
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
  const [sellerList, setSellerList] = useState<Seller[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);
  const [editSeller, setEditSeller] = useState<Seller | null>(null);

  const [showFilter, setShowFilter] = useState(false);
  const [filterStatus, setFilterStatus] = useState<Status | 'all'>('all');
  const [filterCharge, setFilterCharge] = useState<string>('all');
  const [filterRating, setFilterRating] = useState<string>('all');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (filterStatus !== 'all') params.set('status', filterStatus);
        if (filterCharge !== 'all') params.set('chargeRange', filterCharge);
        if (filterRating !== 'all') {
          params.set('limit', '1000');
        } else {
          params.set('page', String(page));
          params.set('limit', String(PAGE_SIZE));
        }
        const { data } = await api.get<{ sellers: ApiSeller[]; pagination: { total: number } }>(
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
  }, [filterStatus, filterCharge, filterRating, page]);

  function handleFilterStatusChange(value: Status | 'all') {
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

  const totalPages = Math.ceil(total / PAGE_SIZE);

  function getPageNumbers(): (number | string)[] {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (page <= 4) return [1, 2, 3, 4, 5, '...', totalPages];
    if (page >= totalPages - 3)
      return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, '...', page - 1, page, page + 1, '...', totalPages];
  }

  const handleViewDetail = (seller: Seller) => setSelectedSeller(seller);
  const handleEdit = (seller: Seller) => setEditSeller({ ...seller });

  const handleSaveEdit = async () => {
    if (!editSeller) return;
    try {
      const isSuspend = editSeller.status === '정지';
      const statusMap: Record<Exclude<Status, '정지'>, string> = {
        승인: 'approved',
        대기: 'pending',
        거절: 'rejected',
      };
      const commissionRate = parseFloat(editSeller.charge);
      await api.patch(`/admin/sellers/${editSeller.id}/approve`, {
        ...(isSuspend
          ? { suspend: true }
          : { status: statusMap[editSeller.status as Exclude<Status, '정지'>] }),
        ...(!isNaN(commissionRate) ? { commissionRate } : {}),
      });
      setSellerList((prev) => prev.map((s) => (s.id === editSeller.id ? editSeller : s)));
      setEditSeller(null);
    } catch (e) {
      console.error('판매자 정보 수정 실패', e);
    }
  };

  const filtered = sellerList.filter((s) => {
    const matchSearch = s.name.includes(search) || s.number.includes(search);
    const matchRating =
      filterRating === 'all' ||
      s.rating === null ||
      (filterRating === '4.5+' && s.rating >= 4.5) ||
      (filterRating === '4.0+' && s.rating >= 4.0 && s.rating < 4.5) ||
      (filterRating === 'low' && s.rating < 4.0);
    return matchSearch && matchRating;
  });

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
              onValueChange={(v) => handleFilterStatusChange(v as Status | 'all')}
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
              <TableHead>사업자번호</TableHead>
              <TableHead>가입일</TableHead>
              <TableHead>상품수</TableHead>
              <TableHead>평점</TableHead>
              <TableHead>수수료율</TableHead>
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
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                  판매자가 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell className="text-muted-foreground">{s.number}</TableCell>
                  <TableCell className="text-muted-foreground">{s.joinedAt}</TableCell>
                  <TableCell>{s.productCount}건</TableCell>
                  <TableCell>
                    <StarRating rating={s.rating} />
                  </TableCell>
                  <TableCell>{s.charge}</TableCell>
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
        {total > 0 && (
          <div className="text-sm text-muted-foreground">
            {total}명 중 {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)}명
          </div>
        )}
      </div>
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
        getPageNumbers={getPageNumbers}
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
                    setEditSeller({ ...editSeller, status: value as Status })
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
