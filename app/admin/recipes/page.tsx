'use client';

import { useEffect, useState } from 'react';
import Pagination from '@/components/ui/Pagination';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye } from 'lucide-react';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import api from '@/lib/api';
import { useDebounce } from '@/hooks/useDebounce';
import { getPageNumbers } from '@/lib/utils';
import { formatDate } from '@/lib/format';
import type { AdminRecipe, AdminPointStats } from '@/types/admin';

const PAGE_SIZE = 20;

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<AdminRecipe[]>([]);
  const [total, setTotal] = useState(0);
  const [pointStats, setPointStats] = useState<AdminPointStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const search = useDebounce(searchInput, 300);
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    setPage(1);
  }, [search]);

  useEffect(() => {
    let cancelled = false;

    async function fetchRecipes() {
      setLoading(true);
      try {
        const { data } = await api.get('/admin/recipes', {
          params: { keyword: search, page, limit: PAGE_SIZE },
        });
        if (!cancelled) {
          setRecipes(data.recipes);
          setTotal(data.pagination.total);
        }
      } catch {
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchRecipes();
    return () => {
      cancelled = true;
    };
  }, [search, page]);

  useEffect(() => {
    api
      .get('/admin/recipes/points')
      .then(({ data }) => setPointStats(data))
      .catch(() => {});
  }, []);

  async function handleDelete(recipeId: number) {
    if (!confirm('레시피를 삭제하시겠습니까? ')) return;
    try {
      await api.delete(`/admin/recipes/${recipeId}`);
      setRecipes((prev) => prev.filter((r) => r.recipeId !== recipeId));
      setTotal((prev) => prev - 1);
      if (selectedId === recipeId) setSelectedId(null);
      if (recipes.length === 1 && page > 1) setPage((p) => p - 1);
    } catch {
      alert('삭제에 실패했습니다. 다시 시도해주세요.');
    }
  }

  const selected = recipes.find((r) => r.recipeId === selectedId) ?? null;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">레시피/포인트 관리</h1>
        <p className="text-sm text-muted-foreground">전체: {total.toLocaleString()}개</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-5 flex flex-col gap-4">
            <p className="font-bold">레시피 수익 정책</p>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">정책</p>
              <p className="text-sm font-medium">레시피 추천 구매</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">지급 기준</p>
              <p className="text-sm font-medium">구매금액의 1%</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">수혜자</p>
              <p className="text-sm font-medium">레시피 작성자</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">총 추천 구매</p>
              <p className="text-sm font-bold">
                {pointStats ? `${pointStats.referralOrderCount.toLocaleString()}건` : '-'}
              </p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">총 지급 포인트</p>
              <p className="text-sm font-bold text-yellow">
                {pointStats ? `${pointStats.totalReferralPoints.toLocaleString()}P` : '-'}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 flex flex-col gap-4">
            <p className="font-bold">포인트 현황</p>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">총 적립</p>
              <p className="text-xl font-bold text-yellow">
                {pointStats ? `${(pointStats.totalEarned / 10000).toFixed(1)}만P` : '-'}
              </p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">총 사용</p>
              <p className="text-xl font-bold text-primary">
                {pointStats ? `${(pointStats.totalUsed / 10000).toFixed(1)}만P` : '-'}
              </p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">잔여 (적립 - 사용)</p>
              <p className="text-xl font-bold">
                {pointStats ? `${(pointStats.netOutstanding / 10000).toFixed(1)}만P` : '-'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="relative">
        <Input
          className="pl-4 bg-white"
          placeholder="레시피 제목 검색"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
      </div>

      <div className="rounded-lg border overflow-x-auto bg-white">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="text-left px-4 py-3 font-medium">레시피명</TableHead>
              <TableHead className="hidden md:table-cell text-left px-4 py-3 font-medium">
                작성자
              </TableHead>
              <TableHead className="hidden md:table-cell text-left px-4 py-3 font-medium">
                카테고리
              </TableHead>
              <TableHead className="hidden md:table-cell text-right px-4 py-3 font-medium">
                좋아요
              </TableHead>
              <TableHead className="hidden md:table-cell text-right px-4 py-3 font-medium">
                스크랩
              </TableHead>
              <TableHead className="text-center px-4 py-3 font-medium">관리</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y">
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                  불러오는 중...
                </TableCell>
              </TableRow>
            ) : recipes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                  레시피가 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              recipes.map((recipe) => (
                <TableRow key={recipe.recipeId} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="px-4 py-3 font-medium">{recipe.title}</TableCell>
                  <TableCell className="hidden md:table-cell px-4 py-3 text-muted-foreground">
                    {recipe.author}
                  </TableCell>
                  <TableCell className="hidden md:table-cell px-4 py-3 text-muted-foreground">
                    {recipe.category}
                  </TableCell>
                  <TableCell className="hidden md:table-cell px-4 py-3 text-right">
                    {recipe.likeCount.toLocaleString()}
                  </TableCell>
                  <TableCell className="hidden md:table-cell px-4 py-3 text-right">
                    {recipe.scrapCount.toLocaleString()}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-center">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0"
                      onClick={() => setSelectedId(recipe.recipeId)}
                    >
                      <Eye size={16} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {total > 0 && (
        <p className="text-sm text-muted-foreground">
          {total}개 중 {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)}개
        </p>
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
            <DialogTitle>레시피 상세 정보</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-5 text-sm">
              <p className="text-muted-foreground">레시피 ID: {selected.recipeId}</p>

              <div className="space-y-3">
                <p className="font-semibold">기본 정보</p>
                <div className="grid grid-cols-2 gap-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">레시피명</p>
                    <p className="font-medium">{selected.title}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">작성자</p>
                    <p>{selected.author}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">이메일</p>
                    <p>{selected.authorEmail}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">작성일</p>
                    <p>{formatDate(selected.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">카테고리</p>
                    <p>{selected.category}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">난이도</p>
                    <p>{selected.difficulty}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">조리 시간</p>
                    <p>{selected.cookingTime}분</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 text-center rounded-lg border divide-x">
                <div className="p-3">
                  <p className="text-xs text-muted-foreground mb-1">좋아요</p>
                  <p className="font-bold">{selected.likeCount.toLocaleString()}</p>
                </div>
                <div className="p-3">
                  <p className="text-xs text-muted-foreground mb-1">스크랩</p>
                  <p className="font-bold">{selected.scrapCount.toLocaleString()}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => handleDelete(selected.recipeId)}
                >
                  삭제
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => setSelectedId(null)}>
                  목록
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
