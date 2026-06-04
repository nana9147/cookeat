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

  const filtered = members.filter((m) => m.name.includes(search) || m.email.includes(search));

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">회원 관리</h1>
          <p className="text-sm text-muted-foreground">전체 회원: 1,234명</p>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Filter size={14} />
          필터
        </Button>
      </div>

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

      <div className="rounded-md border bg-white">
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
                    <button className="text-primary" aria-label="상세보기">
                      <Eye size={16} />
                    </button>
                    <button className="text-gray-text " aria-label="수정">
                      <Pencil size={16} />
                    </button>
                    <button className="text-red-500 " aria-label="정지">
                      <Ban size={16} />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
