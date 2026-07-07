'use client';

import { useEffect, useRef, useState } from 'react';
import { Eye, Pencil, Filter, Search } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import api from '@/lib/api';
import Pagination from '@/components/ui/Pagination';
import StatusBadge, { StatusBadgeStatus } from '@/components/common/StatusBadge';
import { useDebounce } from '@/hooks/useDebounce';
import { getPageNumbers } from '@/lib/utils';
import { formatDate } from '@/lib/format';
import type { AdminMember, AdminMemberGrade, AdminMemberStatus } from '@/types/admin';

const statusLabel: Record<AdminMemberStatus, StatusBadgeStatus> = {
  active: '정상',
  suspended: '정지',
};

const PAGE_SIZE = 20;

export default function MembersPage() {
  const [members, setMembers] = useState<AdminMember[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);
  const prevSearchRef = useRef(debouncedSearch);
  const [showFilter, setShowFilter] = useState(false);
  const [filterGrade, setFilterGrade] = useState<AdminMemberGrade | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<AdminMemberStatus | 'all'>('all');
  const [selectedMember, setSelectedMember] = useState<AdminMember | null>(null);
  const [editMember, setEditMember] = useState<AdminMember | null>(null);
  const [editStatus, setEditStatus] = useState<AdminMemberStatus>('active');

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
        if (filterGrade !== 'all') params.set('grade', filterGrade);
        params.set('page', String(page));
        params.set('limit', String(PAGE_SIZE));
        const { data } = await api.get(`/admin/users?${params}`);
        if (!cancelled) {
          setMembers(data.users ?? []);
          setTotal(data.pagination?.total ?? 0);
        }
      } catch (e) {
        if (!cancelled)
          alert(e instanceof Error ? e.message : '회원 목록을 불러오지 못했습니다.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, filterStatus, filterGrade, page]);

  function handleFilterStatusChange(value: AdminMemberStatus | 'all') {
    setFilterStatus(value);
    setPage(1);
  }

  function handleFilterGradeChange(value: AdminMemberGrade | 'all') {
    setFilterGrade(value);
    setPage(1);
  }

  function handleEdit(member: AdminMember) {
    setEditMember(member);
    setEditStatus(member.status);
  }

  async function handleEditSave() {
    if (!editMember) return;
    try {
      await api.patch(`/admin/users/${editMember.userId}/status`, { status: editStatus });
      setMembers((prev) =>
        prev.map((m) => (m.userId === editMember.userId ? { ...m, status: editStatus } : m))
      );
      setEditMember(null);
    } catch {
      alert('상태 변경에 실패했습니다.');
    }
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">회원 관리</h1>
          <p className="text-sm text-muted-foreground">전체 회원: {total}명</p>
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
            <span className="text-xs text-muted-foreground">등급</span>
            <Select
              value={filterGrade}
              onValueChange={(v) => handleFilterGradeChange(v as AdminMemberGrade | 'all')}
            >
              <SelectTrigger className="w-28">
                <SelectValue placeholder="전체" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="일반">일반</SelectItem>
                <SelectItem value="VIP">VIP</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">상태</span>
            <Select
              value={filterStatus}
              onValueChange={(v) => handleFilterStatusChange(v as AdminMemberStatus | 'all')}
            >
              <SelectTrigger className="w-28">
                <SelectValue placeholder="전체" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="active">정상</SelectItem>
                <SelectItem value="suspended">정지</SelectItem>
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
          placeholder="회원명, 이메일로 검색"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto rounded-md border bg-white">
        <Table>
          <TableHeader className="bg-beige">
            <TableRow>
              <TableHead>회원명</TableHead>
              <TableHead className="hidden md:table-cell">이메일</TableHead>
              <TableHead className="hidden md:table-cell">가입일</TableHead>
              <TableHead className="hidden md:table-cell">등급</TableHead>
              <TableHead className="hidden md:table-cell">주문수</TableHead>
              <TableHead>상태</TableHead>
              <TableHead>관리</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-10">
                  불러오는 중...
                </TableCell>
              </TableRow>
            ) : members.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-10">
                  회원이 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              members.map((member) => (
                <TableRow key={member.userId}>
                  <TableCell className="font-medium">{member.nickname}</TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">{member.email}</TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">
                    {formatDate(member.createdAt)}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <StatusBadge status={member.grade} />
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{member.orderCount}건</TableCell>
                  <TableCell>
                    <StatusBadge status={statusLabel[member.status]} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <button
                        className="text-primary"
                        aria-label="상세보기"
                        onClick={() => setSelectedMember(member)}
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        className="text-gray-text"
                        aria-label="수정"
                        onClick={() => handleEdit(member)}
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
        {total > 0
          ? `${total}명 중 ${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, total)}명`
          : '결과 없음'}
      </div>
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
        getPageNumbers={() => getPageNumbers(page, totalPages)}
      />

      <Dialog open={!!selectedMember} onOpenChange={() => setSelectedMember(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>회원 상세 정보</DialogTitle>
          </DialogHeader>
          {selectedMember && (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">이름</span>
                <span className="font-medium">{selectedMember.nickname}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">이메일</span>
                <span>{selectedMember.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">가입일</span>
                <span>{formatDate(selectedMember.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">등급</span>
                <StatusBadge status={selectedMember.grade} />
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">주문수</span>
                <span>{selectedMember.orderCount}건</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">포인트</span>
                <span>{selectedMember.point.toLocaleString()}P</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">상태</span>
                <StatusBadge status={statusLabel[selectedMember.status]} />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!editMember} onOpenChange={() => setEditMember(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>회원 상태 수정</DialogTitle>
          </DialogHeader>
          {editMember && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {editMember.nickname} ({editMember.email})
              </p>
              <div className="space-y-1">
                <label className="text-sm text-muted-foreground">상태</label>
                <Select
                  value={editStatus}
                  onValueChange={(v) => setEditStatus(v as AdminMemberStatus)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">정상</SelectItem>
                    <SelectItem value="suspended">정지</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setEditMember(null)}>
                  취소
                </Button>
                <Button onClick={handleEditSave}>저장</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
