'use client';

import { useEffect, useState } from 'react';
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

type Grade = '일반' | 'VIP';
type Status = 'active' | 'suspended';

interface Member {
  userId: number;
  email: string;
  nickname: string;
  createdAt: string;
  grade: Grade;
  orderCount: number;
  status: Status;
  point: number;
}

const gradeBadge: Record<Grade, string> = {
  일반: 'bg-beige text-black',
  VIP: 'bg-yellow text-white',
};

const statusBadge: Record<Status, string> = {
  active: 'bg-primary text-white',
  suspended: 'bg-red text-white',
};

const statusLabel: Record<Status, string> = {
  active: '정상',
  suspended: '정지',
};

const PAGE_SIZE = 20;

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [total, setTotal] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [filterGrade, setFilterGrade] = useState<Grade | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<Status | 'all'>('all');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [editMember, setEditMember] = useState<Member | null>(null);
  const [editStatus, setEditStatus] = useState<Status>('active');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (filterStatus !== 'all') params.set('status', filterStatus);
        params.set('page', String(page));
        params.set('limit', String(PAGE_SIZE));
        const { data } = await api.get(`/admin/users?${params}`);
        if (!cancelled) {
          setMembers(data.users);
          setTotal(data.pagination.total);
          setHasNext(data.pagination.hasNext);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [filterStatus, page]);

  function handleFilterStatusChange(value: Status | 'all') {
    setFilterStatus(value);
    setPage(1);
  }

  function handleEdit(member: Member) {
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

  const filtered = members.filter((m) => {
    const matchSearch = m.nickname.includes(search) || m.email.includes(search);
    const matchGrade = filterGrade === 'all' || m.grade === filterGrade;
    return matchSearch && matchGrade;
  });

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
            <Select value={filterGrade} onValueChange={(v) => setFilterGrade(v as Grade | 'all')}>
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
              onValueChange={(v) => handleFilterStatusChange(v as Status | 'all')}
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
              <TableHead>이메일</TableHead>
              <TableHead>가입일</TableHead>
              <TableHead>등급</TableHead>
              <TableHead>주문수</TableHead>
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
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-10">
                  회원이 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((member) => (
                <TableRow key={member.userId}>
                  <TableCell className="font-medium">{member.nickname}</TableCell>
                  <TableCell className="text-muted-foreground">{member.email}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(member.createdAt).toLocaleDateString('ko-KR')}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`rounded px-2 py-0.5 text-xs font-medium ${gradeBadge[member.grade]}`}
                    >
                      {member.grade}
                    </span>
                  </TableCell>
                  <TableCell>{member.orderCount}건</TableCell>
                  <TableCell>
                    <span
                      className={`rounded px-2 py-0.5 text-xs font-medium ${statusBadge[member.status]}`}
                    >
                      {statusLabel[member.status]}
                    </span>
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

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {total}명 중 {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)}명
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => p - 1)}
            disabled={page === 1 || loading}
          >
            이전
          </Button>
          <span className="px-1">{page}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => p + 1)}
            disabled={!hasNext || loading}
          >
            다음
          </Button>
        </div>
      </div>

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
                <span>{new Date(selectedMember.createdAt).toLocaleDateString('ko-KR')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">등급</span>
                <span
                  className={`rounded px-2 py-0.5 text-xs font-medium ${gradeBadge[selectedMember.grade]}`}
                >
                  {selectedMember.grade}
                </span>
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
                <span
                  className={`rounded px-2 py-0.5 text-xs font-medium ${statusBadge[selectedMember.status]}`}
                >
                  {statusLabel[selectedMember.status]}
                </span>
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
                <Select value={editStatus} onValueChange={(v) => setEditStatus(v as Status)}>
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
