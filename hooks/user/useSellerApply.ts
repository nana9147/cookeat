'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';

export type ApproveStatus = 'pending' | 'approved' | 'rejected';

export interface SellerApplication {
  seller_id: number;
  is_co_representative: boolean;
  representative_name: string;
  cs_phone: string;
  store_name: string;
  business_number: string;
  business_address: string | null;
  bank_name: string;
  bank_account: string;
  approve_status: ApproveStatus;
  rejected_reason: string | null;
  created_at: string;
}

export function useSellerApply() {
  const { accessToken } = useAuthStore();
  const [application, setApplication] = useState<SellerApplication | null | undefined>(undefined);
  const [fetchError, setFetchError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  async function fetchApplication() {
    if (!accessToken) return;
    fetch('/api/seller/apply', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((json) => setApplication(json.data ?? null))
      .catch(() => {
        setFetchError(true);
        setApplication(null);
      });
  }

  useEffect(() => {
    fetchApplication();
  }, [accessToken]);

  async function submit(fields: {
    isCoRepresentative: boolean;
    representativeName: string;
    csPhone: string;
    storeName: string;
    businessNumber: string;
    businessAddress: string;
    bankName: string;
    bankAccount: string;
  }) {
    setSubmitError('');
    setSubmitting(true);

    const res = await fetch('/api/seller/apply', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(fields),
    });

    const json = await res.json();
    setSubmitting(false);

    if (!res.ok) {
      // 필드별 validation 에러는 첫 번째 메시지만 노출
      if (json.errors) {
        const first = Object.values(json.errors as Record<string, string>)[0];
        setSubmitError(first);
      } else {
        setSubmitError(json.error ?? '신청 중 오류가 발생했습니다.');
      }
      return false;
    }

    await fetchApplication();
    return true;
  }

  return { application, fetchError, submitting, submitError, submit };
}
