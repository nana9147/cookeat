'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import api from '@/lib/api';
import { formatDate } from '@/lib/format';
import type { AdminCoupon, AdminCouponDiscountType } from '@/types/admin';

const DISCOUNT_TYPE_LABEL: Record<AdminCouponDiscountType, string> = {
  rate: '정률 (%)',
  fixed: '정액 (원)',
};

const initialForm = {
  code: '',
  discountType: 'rate' as AdminCouponDiscountType,
  discountValue: '',
  minOrderAmount: '',
  expiredAt: '',
};

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<AdminCoupon[]>([]);
  const [loading, setLoading] = useState(false);

  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const { data } = await api.get<{ coupons: AdminCoupon[] }>('/admin/coupons');
        if (!cancelled) setCoupons(data.coupons);
      } catch {
        if (!cancelled) alert('쿠폰 목록을 불러오지 못했습니다.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  function handleOpenCreate() {
    setForm(initialForm);
    setFormError('');
    setShowCreate(true);
  }

  async function handleCreate() {
    setFormError('');
    const discountValue = Number(form.discountValue);
    const minOrderAmount = form.minOrderAmount ? Number(form.minOrderAmount) : null;

    if (!form.code.trim()) {
      setFormError('쿠폰 코드를 입력해주세요.');
      return;
    }
    if (!form.discountValue || isNaN(discountValue) || discountValue <= 0) {
      setFormError('할인 값을 올바르게 입력해주세요.');
      return;
    }
    if (form.discountType === 'rate' && discountValue > 100) {
      setFormError('정률 할인은 100% 이하여야 합니다.');
      return;
    }
    if (!form.expiredAt) {
      setFormError('만료일을 입력해주세요.');
      return;
    }

    setSaving(true);
    try {
      const { data: coupon } = await api.post<AdminCoupon>('/admin/coupons', {
        code: form.code,
        discountType: form.discountType,
        discountValue,
        minOrderAmount,
        expiredAt: new Date(form.expiredAt).toISOString(),
      });

      const { data: issueResult } = await api.post<{ issuedCount: number }>(
        `/admin/coupons/${coupon.couponId}/issue`,
        { issueAll: true }
      );

      setCoupons((prev) => [{ ...coupon, issuedCount: issueResult.issuedCount }, ...prev]);
      setShowCreate(false);
      alert(`쿠폰이 생성되어 ${issueResult.issuedCount}명에게 지급되었습니다.`);
    } catch (e) {
      const msg =
        (e as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        '쿠폰 생성에 실패했습니다.';
      setFormError(msg);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(coupon: AdminCoupon) {
    if (!confirm(`'${coupon.code}' 쿠폰을 삭제하시겠습니까?`)) return;
    setDeletingId(coupon.couponId);
    try {
      await api.delete(`/admin/coupons/${coupon.couponId}`);
      setCoupons((prev) => prev.filter((c) => c.couponId !== coupon.couponId));
    } catch (e) {
      const msg =
        (e as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        '삭제에 실패했습니다.';
      alert(msg);
    } finally {
      setDeletingId(null);
    }
  }

  function isExpired(expiredAt: string) {
    return new Date(expiredAt) < new Date();
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">쿠폰 관리</h1>
          <p className="text-sm text-muted-foreground">전체 쿠폰: {coupons.length}개</p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={handleOpenCreate}>
          <Plus size={14} />
          쿠폰 생성
        </Button>
      </div>

      <div className="overflow-x-auto rounded-md border bg-white">
        <Table>
          <TableHeader className="bg-beige">
            <TableRow>
              <TableHead>코드</TableHead>
              <TableHead>할인</TableHead>
              <TableHead className="hidden md:table-cell">최소주문</TableHead>
              <TableHead>만료일</TableHead>
              <TableHead>상태</TableHead>
              <TableHead>삭제</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                  불러오는 중...
                </TableCell>
              </TableRow>
            ) : coupons.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                  쿠폰이 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              coupons.map((coupon) => {
                const expired = isExpired(coupon.expiredAt);
                const exhausted =
                  coupon.maxUsageCount !== null && coupon.issuedCount >= coupon.maxUsageCount;
                const active = !expired && !exhausted;
                return (
                  <TableRow key={coupon.couponId}>
                    <TableCell className="font-mono font-medium">{coupon.code}</TableCell>
                    <TableCell>
                      {coupon.discountValue.toLocaleString()}
                      {coupon.discountType === 'rate' ? '%' : '원'}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {coupon.minOrderAmount
                        ? `${coupon.minOrderAmount.toLocaleString()}원 이상`
                        : '제한없음'}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(coupon.expiredAt)}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          active ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-text'
                        }`}
                      >
                        {expired ? '만료' : exhausted ? '소진' : '사용가능'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <button
                        className="text-red hover:text-red/80 disabled:opacity-40"
                        aria-label="삭제"
                        disabled={deletingId === coupon.couponId}
                        onClick={() => handleDelete(coupon)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>쿠폰 생성</DialogTitle>
          </DialogHeader>
          <p className="text-xs text-muted-foreground -mt-1">
            생성 즉시 전체 활성 사용자에게 자동 지급됩니다.
          </p>
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-sm font-medium">쿠폰 코드</label>
              <Input
                placeholder="예: SUMMER2026"
                value={form.code}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-sm font-medium">할인 유형</label>
                <Select
                  value={form.discountType}
                  onValueChange={(v) =>
                    setForm((prev) => ({ ...prev, discountType: v as AdminCouponDiscountType }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(
                      Object.entries(DISCOUNT_TYPE_LABEL) as [AdminCouponDiscountType, string][]
                    ).map(([val, label]) => (
                      <SelectItem key={val} value={val}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">
                  할인 값 ({form.discountType === 'rate' ? '%' : '원'})
                </label>
                <Input
                  type="number"
                  min={1}
                  max={form.discountType === 'rate' ? 100 : undefined}
                  placeholder={form.discountType === 'rate' ? '예: 10' : '예: 5000'}
                  value={form.discountValue}
                  onChange={(e) => setForm((prev) => ({ ...prev, discountValue: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-sm font-medium">최소 주문금액 (원, 선택)</label>
                <Input
                  type="number"
                  min={0}
                  placeholder="예: 30000"
                  value={form.minOrderAmount}
                  onChange={(e) => setForm((prev) => ({ ...prev, minOrderAmount: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">만료일</label>
              <Input
                type="datetime-local"
                value={form.expiredAt}
                onChange={(e) => setForm((prev) => ({ ...prev, expiredAt: e.target.value }))}
              />
            </div>
            {formError && <p className="text-xs text-red">{formError}</p>}
            <div className="flex justify-end gap-2 pt-1">
              <Button variant="outline" onClick={() => setShowCreate(false)} disabled={saving}>
                취소
              </Button>
              <Button onClick={handleCreate} disabled={saving}>
                {saving ? '생성 및 지급 중...' : '생성 및 전체 지급'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
