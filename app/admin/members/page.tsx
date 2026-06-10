'use client';

import { useState } from 'react';
import { Eye, Pencil, Ban, Filter, Search } from 'lucide-react';
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

type Grade = '일반' | 'VIP';
type Status = '정상' | '정지';

interface Member {
  id: number;
  name: string;
  email: string;
  joinedAt: string;
  grade: Grade;
  orderCount: number;
  status: Status;
}

const members: Member[] = [
  {
    id: 1,
    name: '김쿡잇',
    email: 'user1@example.com',
    joinedAt: '2024.05.20',
    grade: '일반',
    orderCount: 12,
    status: '정상',
  },
  {
    id: 2,
    name: '이레시피',
    email: 'user2@example.com',
    joinedAt: '2024.05.18',
    grade: '일반',
    orderCount: 8,
    status: '정상',
  },
  {
    id: 3,
    name: '박유리',
    email: 'user3@example.com',
    joinedAt: '2024.05.15',
    grade: '일반',
    orderCount: 3,
    status: '정지',
  },
  {
    id: 4,
    name: '최맛있',
    email: 'user4@example.com',
    joinedAt: '2024.05.10',
    grade: 'VIP',
    orderCount: 25,
    status: '정상',
  },
];

const gradeBadge: Record<Grade, string> = {
  일반: 'bg-beige text-black',
  VIP: 'bg-yellow text-white',
};

const statusBadge: Record<Status, string> = {
  정상: 'bg-primary text-white',
  정지: 'bg-red text-white',
};

export default function MembersPage() {
  const [search, setSearch] = useState('');
  const [memberList, setMemberList] = useState<Member[]>(members);
  const [showFilter, setShowFilter] = useState(false);
  const [filterGrade, setFilterGrade] = useState<Grade | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<Status | 'all'>('all');

  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [editMember, setEditMember] = useState<Member | null>(null);

  const handleViewDetail = (member: Member) => {
    setSelectedMember(member);
  };

  const handleEdit = (member: Member) => {
    setEditMember(member);
  };
  const filtered = memberList.filter((m) => {
    const matchSearch = m.name.includes(search) || m.email.includes(search);
    const matchGrade = filterGrade === 'all' || m.grade === filterGrade;
    const matchStatus = filterStatus === 'all' || m.status === filterStatus;
    return matchSearch && matchGrade && matchStatus;
  });

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">회원 관리</h1>
          <p className="text-sm text-muted-foreground">전체 회원: {memberList.length}명</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className={`gap-1.5 ${showFilter ? 'border-primary text-primary' : ''}`}
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
              onValueChange={(v) => setFilterStatus(v as Status | 'all')}
            >
              <SelectTrigger className="w-28">
                <SelectValue placeholder="전체" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="정상">정상</SelectItem>
                <SelectItem value="정지">정지</SelectItem>
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
            {filtered.map((member) => (
              <TableRow key={member.id}>
                <TableCell className="font-medium">{member.name}</TableCell>
                <TableCell className="text-muted-foreground">{member.email}</TableCell>
                <TableCell className="text-muted-foreground">{member.joinedAt}</TableCell>
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
                    {member.status}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <button
                      className="text-primary"
                      aria-label="상세보기"
                      onClick={() => handleViewDetail(member)}
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
                    <button
                      className="text-red-500"
                      aria-label="삭제"
                      onClick={() =>
                        setMemberList((prev) => prev.filter((m) => m.id !== member.id))
                      }
                    >
                      <Ban size={16} />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
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
                <span className="font-medium">{selectedMember.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">이메일</span>
                <span>{selectedMember.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">가입일</span>
                <span>{selectedMember.joinedAt}</span>
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
                <span className="text-muted-foreground">상태</span>
                <span
                  className={`rounded px-2 py-0.5 text-xs font-medium ${statusBadge[selectedMember.status]}`}
                >
                  {selectedMember.status}
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!editMember} onOpenChange={() => setEditMember(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>회원 정보 수정</DialogTitle>
          </DialogHeader>
          {editMember && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {editMember.name} ({editMember.email})
              </p>
              <div className="space-y-1">
                <label className="text-sm text-muted-foreground">등급</label>
                <Select
                  value={editMember.grade}
                  onValueChange={(value) => setEditMember({ ...editMember, grade: value as Grade })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="일반">일반</SelectItem>
                    <SelectItem value="VIP">VIP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-sm text-muted-foreground">상태</label>
                <Select
                  value={editMember.status}
                  onValueChange={(value) =>
                    setEditMember({ ...editMember, status: value as Status })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="정상">정상</SelectItem>
                    <SelectItem value="정지">정지</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setEditMember(null)}>
                  취소
                </Button>
                <Button
                  onClick={() => {
                    setMemberList((prev) =>
                      prev.map((m) => (m.id === editMember.id ? editMember : m))
                    );
                    setEditMember(null);
                  }}
                >
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
