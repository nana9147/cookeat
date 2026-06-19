'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye } from 'lucide-react';
import StatusBadge from '@/components/common/StatusBadge';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';

type RecipeStatus = '공개' | '비공개' | '신고';

interface Recipe {
  id: number;
  title: string;
  author: string;
  email: string;
  createdAt: string;
  cookTime: string;
  difficulty: string;
  category: string;
  description: string;
  ingredients: string[];
  views: number;
  likes: number;
  points: number;
  reportCount: number;
  status: RecipeStatus;
}

const recipes: Recipe[] = [
  {
    id: 1,
    title: '김치찌개',
    author: '김쿡잇',
    email: 'user1@example.com',
    createdAt: '2024.05.20',
    cookTime: '30분',
    difficulty: '쉬움',
    category: '찌개',
    description: '깊은 맛의 묵은지 김치찌개 레시피입니다.',
    ingredients: ['묵은지 200g', '돼지고기 150g', '두부 1/2모', '대파 1대', '양파 1/2개'],
    views: 1234,
    likes: 89,
    points: 1560,
    reportCount: 0,
    status: '공개',
  },
  {
    id: 2,
    title: '된장찌개',
    author: '이레시피',
    email: 'user2@example.com',
    createdAt: '2024.06.03',
    cookTime: '25분',
    difficulty: '쉬움',
    category: '찌개',
    description: '구수하고 담백한 된장찌개 레시피입니다.',
    ingredients: ['된장 2큰술', '두부 1/2모', '애호박 1/4개', '대파 1대', '바지락 100g'],
    views: 892,
    likes: 54,
    points: 1130,
    reportCount: 0,
    status: '공개',
  },
  {
    id: 3,
    title: '불고기',
    author: '박요리',
    email: 'user3@example.com',
    createdAt: '2024.04.15',
    cookTime: '40분',
    difficulty: '보통',
    category: '구이',
    description: '달콤짭짤한 소불고기 레시피입니다.',
    ingredients: ['소고기 300g', '간장 3큰술', '설탕 1큰술', '참기름 1큰술', '배 1/4개'],
    views: 2341,
    likes: 201,
    points: 2950,
    reportCount: 2,
    status: '신고',
  },
];


export default function RecipesPage() {
  const [pointsPerView, setPointsPerView] = useState(5);
  const [registerBonus, setRegisterBonus] = useState(500);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const selectedRecipes = recipes.find((s) => s.id === selectedId) ?? null;

  const totalUnsettled = recipes
    .filter((r) => r.status !== '신고')
    .reduce((sum, r) => sum + r.points, 0);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">레시피/포인트 관리</h1>
        <p className="text-sm text-muted-foreground">전체: 1,567개</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-5 flex flex-col gap-4">
            <p className="font-bold">레시피 수익 정책</p>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">조회당 포인트</p>
              <Input
                type="number"
                value={pointsPerView}
                onChange={(e) => setPointsPerView(Number(e.target.value))}
                className="w-24 text-right"
              />
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">등록 보너스</p>
              <Input
                type="number"
                value={registerBonus}
                onChange={(e) => setRegisterBonus(Number(e.target.value))}
                className="w-24 text-right"
              />
            </div>
            <Button className="w-full">정책 저장</Button>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 flex flex-col gap-4">
            <p className="font-bold">포인트 정산</p>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">미정산</p>
              <p className="text-xl font-bold text-yellow">
                {(totalUnsettled / 1000).toFixed(1)}만P
              </p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">정산 완료</p>
              <p className="text-xl font-bold text-primary">324.6만P</p>
            </div>
            <Button className="w-full">일괄 정산</Button>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-lg border overflow-x-auto bg-white">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="text-left px-4 py-3 font-medium">레시피명</TableHead>
              <TableHead className="hidden md:table-cell text-left px-4 py-3 font-medium">작성자</TableHead>
              <TableHead className="hidden md:table-cell text-right px-4 py-3 font-medium">조회수</TableHead>
              <TableHead className="hidden md:table-cell text-right px-4 py-3 font-medium">수익</TableHead>
              <TableHead className="text-center px-4 py-3 font-medium">상태</TableHead>
              <TableHead className="text-center px-4 py-3 font-medium">관리</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y">
            {recipes.map((recipe) => (
              <TableRow key={recipe.id} className="hover:bg-muted/30 transition-colors">
                <TableCell className="px-4 py-3 font-medium">{recipe.title}</TableCell>
                <TableCell className="hidden md:table-cell px-4 py-3 text-muted-foreground">{recipe.author}</TableCell>
                <TableCell className="hidden md:table-cell px-4 py-3 text-right">
                  {recipe.views.toLocaleString()}
                </TableCell>
                <TableCell className="hidden md:table-cell px-4 py-3 text-right">
                  {Math.floor(recipe.points / 10)}백P
                </TableCell>
                <TableCell className="px-4 py-3 text-center">
                  <StatusBadge status={recipe.status} />
                </TableCell>
                <TableCell className="px-4 py-3 text-center">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0"
                    onClick={() => setSelectedId(recipe.id)}
                  >
                    <Eye size={16} />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Dialog open={!!selectedRecipes} onOpenChange={() => setSelectedId(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>레시피 상세 정보</DialogTitle>
          </DialogHeader>
          {selectedRecipes && (
            <div className="space-y-5 text-sm">
              <p className="text-muted-foreground">레시피 ID: {selectedRecipes.id}</p>

              <div className="space-y-3">
                <p className="font-semibold">기본 정보</p>
                <div className="grid grid-cols-2 gap-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">레시피명</p>
                    <p className="font-medium">{selectedRecipes.title}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">작성자</p>
                    <p>{selectedRecipes.author}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">이메일</p>
                    <p>{selectedRecipes.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">작성일</p>
                    <p>{selectedRecipes.createdAt}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">조리시간</p>
                    <p>{selectedRecipes.cookTime}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">난이도</p>
                    <p>{selectedRecipes.difficulty}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">상태</p>
                    <StatusBadge status={selectedRecipes.status} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">신고 횟수</p>
                    <p>{selectedRecipes.reportCount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">카테고리</p>
                    <p>{selectedRecipes.category}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <p className="font-semibold">레시피 설명</p>
                <p className="text-muted-foreground">{selectedRecipes.description}</p>
              </div>

              <div className="space-y-2">
                <p className="font-semibold">재료</p>
                <ul className="space-y-1">
                  {selectedRecipes.ingredients.map((item) => (
                    <li key={item} className="text-muted-foreground">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2">
                <p className="font-semibold">통계</p>
                <div className="grid grid-cols-3 text-center rounded-lg border divide-x">
                  <div className="p-3">
                    <p className="text-xs text-muted-foreground mb-1">조회수</p>
                    <p className="font-bold">{selectedRecipes.views.toLocaleString()}</p>
                  </div>
                  <div className="p-3">
                    <p className="text-xs text-muted-foreground mb-1">좋아요</p>
                    <p className="font-bold">{selectedRecipes.likes}</p>
                  </div>
                  <div className="p-3">
                    <p className="text-xs text-muted-foreground mb-1">포인트 수익</p>
                    <p className="font-bold">{Math.floor(selectedRecipes.points / 10)}백P</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="destructive" className="flex-1">
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
