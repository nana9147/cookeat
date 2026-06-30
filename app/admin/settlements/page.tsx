'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CreditCard, Building2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import StatusBadge from '@/components/common/StatusBadge';
import api from '@/lib/api';
import { formatWon } from '@/lib/format';
import type { AdminSettlement, AdminSettlementStats, AdminSettlementRawStatus } from '@/types/admin';

type SettlementDisplayStatus = '정산대기' | '정산완료';

function formatKoreanAmount(won: number): string {
  if (won >= 100_000_000) return `${(won / 100_000_000).toFixed(1)}억원`;
  if (won >= 10_000) return `${Math.round(won / 10_000)}만원`;
  return formatWon(won);
}

function formatPeriod(start: string, end: string): string {
  const s = start.replaceAll('-', '.');
  const [, em, ed] = end.split('-');
  return `${s} ~ ${em}.${ed}`;
}

function toDisplayStatus(status: AdminSettlementRawStatus): SettlementDisplayStatus {
  return status === '대기' ? '정산대기' : '정산완료';
}

export default function SettlementsPage() {
  const [activeTab, setActiveTab] = useState<SettlementDisplayStatus>('정산대기');
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const [settlements, setSettlements] = useState<AdminSettlement[]>([]);
  const [stats, setStats] = useState<AdminSettlementStats>({
    pendingCount: 0,
    pendingAmount: 0,
    completedCount: 0,
    completedAmount: 0,
    totalFee: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSettlements() {
      try {
        setLoading(true);
        const res = await api.get('/admin/settlements');
        setSettlements(res.data.settlements);
        setStats(res.data.stats);
      } catch (err) {
        console.error('정산 목록 조회 실패:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchSettlements();
  }, []);

  async function handleSettle(settlementId: number) {
    const target = settlements.find((s) => s.settlementId === settlementId);
    if (!target) return;

    await api.patch(`/admin/settlements/${settlementId}`, { status: '완료' });

    setSettlements((prev) =>
      prev.map((s) =>
        s.settlementId === settlementId
          ? { ...s, status: '완료' as const, settledAt: new Date().toISOString() }
          : s
      )
    );
    setStats((prev) => ({
      ...prev,
      pendingCount: prev.pendingCount - 1,
      pendingAmount: prev.pendingAmount - target.amount,
      completedCount: prev.completedCount + 1,
      completedAmount: prev.completedAmount + target.amount,
    }));
    setSelectedId(null);
  }

  async function handleBulkSettle() {
    const pending = settlements.filter((s) => s.status === '대기');
    if (pending.length === 0) return;

    const results = await Promise.allSettled(
      pending.map((s) => api.patch(`/admin/settlements/${s.settlementId}`, { status: '완료' }))
    );

    const succeededIds = pending
      .filter((_, i) => results[i].status === 'fulfilled')
      .map((s) => s.settlementId);

    const failCount = results.filter((r) => r.status === 'rejected').length;
    if (failCount > 0) {
      alert(`${failCount}건 처리에 실패했습니다. 목록을 다시 확인해주세요`);
    }

    const now = new Date().toISOString();
    setSettlements((prev) =>
      prev.map((s) =>
        succeededIds.includes(s.settlementId)
          ? { ...s, status: '완료' as const, settledAt: now }
          : s
      )
    );

    const succeededAmount = pending
      .filter((s) => succeededIds.includes(s.settlementId))
      .reduce((sum, s) => sum + s.amount, 0);

    setStats((prev) => ({
      pendingCount: prev.pendingCount - succeededIds.length,
      pendingAmount: prev.pendingAmount - succeededAmount,
      completedCount: prev.completedCount + succeededIds.length,
      completedAmount: prev.completedAmount + succeededAmount,
      totalFee: prev.totalFee,
    }));
  }

  const filtered = settlements.filter((s) => toDisplayStatus(s.status) === activeTab);
  const selectedSettlement = settlements.find((s) => s.settlementId === selectedId) ?? null;

  const statCards = [
    {
      label: '정산 대기',
      value: formatKoreanAmount(stats.pendingAmount),
      sub: `${stats.pendingCount}건`,
    },
    {
      label: '정산 완료',
      value: formatKoreanAmount(stats.completedAmount),
      sub: `${stats.completedCount}건`,
    },
    { label: '수수료 총액', value: formatKoreanAmount(stats.totalFee), sub: '전체 기간' },
    { label: '다음 정산일', value: '-', sub: '' },
  ];

  if (loading) {
    return <div className="p-6 text-muted-foreground">불러오는 중...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">정산 관리</h1>
          <p className="text-sm text-muted-foreground">판매자 정산 처리 및 내역 관리</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" className="gap-1.5" onClick={handleBulkSettle}>
            <CreditCard size={14} />
            일괄 정산
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-4 grid-cols-2 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-5">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="text-2xl font-bold mt-1">{stat.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{stat.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-4">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('정산대기')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === '정산대기'
                ? 'bg-primary text-white'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            정산 대기 ({stats.pendingCount})
          </button>
          <button
            onClick={() => setActiveTab('정산완료')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === '정산완료'
                ? 'bg-primary text-white'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            정산 완료 ({stats.completedCount})
          </button>
        </div>

        <div className="space-y-3">
          {filtered.map((s) => (
            <Card
              onClick={() => setSelectedId(s.settlementId)}
              key={s.settlementId}
              className="cursor-pointer hover:shadow-md transition-shadow"
            >
              <CardContent className="pt-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{s.storeName}</span>
                      <StatusBadge status={toDisplayStatus(s.status)} />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatPeriod(s.periodStart, s.periodEnd)}
                    </p>
                    <div className="grid grid-cols-3 gap-4 max-w-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">매출액</p>
                        <p className="text-sm font-semibold mt-0.5">
                          {formatKoreanAmount(s.amount + s.fee)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">수수료</p>
                        <p className="text-sm font-semibold text-red mt-0.5">
                          -{formatKoreanAmount(s.fee)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">정산액</p>
                        <p className="text-sm font-semibold text-primary mt-0.5">
                          {formatKoreanAmount(s.amount)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Building2 size={13} />
                      {s.bankName} {s.bankAccount}
                    </div>
                  </div>
                  {s.status === '대기' && (
                    <Button
                      size="sm"
                      className="shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSettle(s.settlementId);
                      }}
                    >
                      정산 처리
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Dialog open={!!selectedSettlement} onOpenChange={() => setSelectedId(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedSettlement?.storeName} 정산 내역</DialogTitle>
          </DialogHeader>
          {selectedSettlement && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {formatPeriod(selectedSettlement.periodStart, selectedSettlement.periodEnd)}
              </p>

              <div className="rounded-lg border p-4 space-y-3">
                <p className="text-sm font-semibold">입금 계좌 정보</p>
                <div className="grid grid-cols-2 gap-y-2 text-sm">
                  <span className="text-muted-foreground">은행</span>
                  <span>{selectedSettlement.bankName}</span>
                  <span className="text-muted-foreground">계좌번호</span>
                  <span>{selectedSettlement.bankAccount}</span>
                </div>
              </div>

              <div className="rounded-lg border p-4 space-y-3">
                <p className="text-sm font-semibold">정산 금액 내역</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">총 매출액</span>
                    <span>{formatWon(selectedSettlement.amount + selectedSettlement.fee)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      수수료 ({selectedSettlement.commissionRate}%)
                    </span>
                    <span className="text-red">-{formatWon(selectedSettlement.fee)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 font-semibold">
                    <span>최종 정산액</span>
                    <span className="text-primary">{formatWon(selectedSettlement.amount)}</span>
                  </div>
                </div>
              </div>

              {selectedSettlement.status === '대기' && (
                <Button
                  className="w-full"
                  onClick={() => handleSettle(selectedSettlement.settlementId)}
                >
                  정산 처리하기 → {formatWon(selectedSettlement.amount)} 이체
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
