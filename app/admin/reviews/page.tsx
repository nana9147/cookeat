'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, MessageCircle, Eye, Trash2, Star } from 'lucide-react';
import api from '@/lib/api';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import StatusBadge from '@/components/common/StatusBadge';
import Pagination from '@/components/ui/Pagination';
import { getPageNumbers } from '@/lib/utils';
import type { AdminReview, AdminReport, AdminReviewStats } from '@/types/admin';

const PAGE_SIZE = 20;

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      <Star size={14} className="fill-yellow text-yellow" />
      <span className="text-xs text-muted-foreground">{rating.toFixed(1)}</span>
    </div>
  );
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [stats, setStats] = useState<AdminReviewStats>({ total: 0, pendingReports: 0 });
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const selected = reviews.find((r) => r.id === selectedId) ?? null;

  const totalPages = Math.ceil(total / PAGE_SIZE);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const { data } = await api.get(`/admin/reviews?page=${page}&limit=${PAGE_SIZE}`);
        if (cancelled) return;

        setStats(data.stats ?? { total: 0, pendingReports: 0, resolved: 0 });
        const mapped: AdminReview[] = (data.reviews ?? []).map(
          (r: {
            reviewId: number;
            targetName: string;
            author: string;
            authorEmail: string;
            rating: number;
            content: string;
            createdAt: string;
            state: '정상' | '신고';
            reportCount: number;
            reports: AdminReport[];
          }) => ({
            id: r.reviewId,
            productName: r.targetName,
            author: r.author,
            email: r.authorEmail,
            rating: r.rating,
            date: new Date(r.createdAt).toLocaleString('ko-KR'),
            state: r.state,
            reportCount: r.reportCount,
            content: r.content,
            reports: r.reports,
          })
        );
        setReviews(mapped);
        setTotal(data.pagination?.total ?? 0);
      } catch (err) {
        if (!cancelled)
          setError(err instanceof Error ? err.message : '리뷰 목록을 불러오지 못했습니다.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [page]);

  async function handleDelete(id: number) {
    const target = reviews.find((r) => r.id === id) ?? null;
    try {
      await api.delete(`/admin/reviews/${id}`);
      setReviews((prev) => prev.filter((r) => r.id !== id));
      setTotal((prev) => prev - 1);
      setStats((prev) => ({
        ...prev,
        total: prev.total - 1,
        pendingReports: target?.state === '신고' ? prev.pendingReports - 1 : prev.pendingReports,
      }));
      setSelectedId(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : '삭제에 실패했습니다.');
    }
  }

  async function handleResolve(id: number) {
    try {
      await api.patch(`/admin/reviews/${id}`, { status: '정상' });
      setReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, state: '정상' } : r))
      );
      setStats((prev) => ({
        ...prev,
        pendingReports: prev.pendingReports - 1,
      }));
      setSelectedId(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : '처리에 실패했습니다.');
    }
  }

  if (loading) return <div className="p-6 text-muted-foreground">불러오는 중...</div>;
  if (error) return <div className="p-6 text-red">{error}</div>;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">리뷰/신고 관리</h1>
        <p className="text-sm text-muted-foreground">
          전체 리뷰: {stats.total.toLocaleString()}개 (신고 대기: {stats.pendingReports}개)
        </p>
      </div>

      <div className="grid grid-cols-1 tablet:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-2">
              <AlertCircle size={18} className="text-red" />
              <p className="text-sm text-muted-foreground">신고 대기</p>
            </div>
            <p className="text-3xl font-bold mt-2 text-red">{stats.pendingReports}건</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-2">
              <MessageCircle size={18} className="text-yellow" />
              <p className="text-sm text-muted-foreground">전체 리뷰</p>
            </div>
            <p className="text-3xl font-bold mt-2 text-yellow">{stats.total.toLocaleString()}건</p>
          </CardContent>
        </Card>
      </div>

      <div className="overflow-x-auto rounded-md border bg-white">
        <Table>
          <TableHeader className="bg-beige">
            <TableRow>
              <TableHead>상품명</TableHead>
              <TableHead className="hidden md:table-cell">작성자</TableHead>
              <TableHead>평점</TableHead>
              <TableHead className="hidden md:table-cell">작성일</TableHead>
              <TableHead className="hidden md:table-cell">신고수</TableHead>
              <TableHead>상태</TableHead>
              <TableHead>관리</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reviews.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center text-muted-foreground">
                  리뷰가 없습니다.
                </TableCell>
              </TableRow>
            )}
            {reviews.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">{r.productName}</TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground">
                  {r.author}
                </TableCell>
                <TableCell>
                  <StarRating rating={r.rating} />
                </TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground">
                  {r.date}
                </TableCell>
                <TableCell className="hidden md:table-cell text-red font-medium">
                  {r.reportCount > 0 ? `${r.reportCount}건` : '-'}
                </TableCell>
                <TableCell>
                  <StatusBadge status={r.state} />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <button
                      className="text-primary"
                      aria-label="상세보기"
                      onClick={() => setSelectedId(r.id)}
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      className="text-red"
                      aria-label="삭제"
                      onClick={() => handleDelete(r.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
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

      <Dialog open={!!selected} onOpenChange={() => setSelectedId(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>리뷰 상세 정보</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 text-sm">
              <p className="text-muted-foreground">리뷰 ID: {selected.id}</p>

              {selected.reportCount > 0 && (
                <div className="flex items-start gap-2 rounded-lg bg-red/10 border border-red/20 p-3">
                  <AlertCircle size={16} className="text-red mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-red">신고된 리뷰입니다</p>
                    <p className="text-muted-foreground text-xs mt-0.5">
                      총 {selected.reportCount}건의 신고가 접수되었습니다. 내용을 확인하고 적절한
                      조치를 취해주세요.
                    </p>
                  </div>
                </div>
              )}

              <div className="rounded-lg border p-4 space-y-3">
                <p className="font-semibold">리뷰 정보</p>
                <div className="grid grid-cols-2 gap-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">상품명</p>
                    <p className="font-medium">{selected.productName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">작성자</p>
                    <p>{selected.author}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">이메일</p>
                    <p>{selected.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">작성일</p>
                    <p>{selected.date}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">평점</p>
                    <StarRating rating={selected.rating} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">상태</p>
                    <StatusBadge status={selected.state} />
                  </div>
                </div>
              </div>

              <div className="rounded-lg border p-4 space-y-2">
                <p className="font-semibold">리뷰 내용</p>
                <p className="text-muted-foreground leading-relaxed">{selected.content}</p>
              </div>

              {selected.reports.length > 0 && (
                <div className="rounded-lg border p-4 space-y-3">
                  <p className="font-semibold">신고 내역 ({selected.reports.length}건)</p>
                  <div className="space-y-2">
                    {selected.reports.map((rep, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{rep.reporter}</span>
                          <span className="text-muted-foreground text-xs">{rep.date}</span>
                        </div>
                        <span className="text-xs bg-beige px-2 py-0.5 rounded">{rep.reason}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 hover:bg-transparent hover:text-inherit"
                  onClick={() => setSelectedId(null)}
                >
                  목록
                </Button>
                {selected.state === '신고' && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 hover:bg-transparent hover:text-inherit"
                    onClick={() => handleResolve(selected.id)}
                  >
                    신고 기각
                  </Button>
                )}
                <Button
                  size="sm"
                  className="flex-1 bg-red text-white hover:bg-red hover:text-white"
                  onClick={() => handleDelete(selected.id)}
                >
                  삭제
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
