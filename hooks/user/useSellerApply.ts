'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';

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

  const fetchApplication = useCallback(async () => {
    if (!accessToken) return;
    api.get<{ data: SellerApplication | null }>('/seller/apply')
      .then(({ data: json }) => setApplication(json.data ?? null))
      .catch(() => {
        setFetchError(true);
        setApplication(null);
      });
  }, [accessToken]);

  useEffect(() => {
    fetchApplication();
  }, [fetchApplication]);

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

    try {
      await api.post('/seller/apply', fields);
      await fetchApplication();
      return true;
    } catch (err) {
      const data = (err as { data?: { errors?: Record<string, string>; error?: string } }).data;
      if (data?.errors) {
        setSubmitError(Object.values(data.errors)[0]);
      } else {
        setSubmitError((err as Error).message || '신청 중 오류가 발생했습니다.');
      }
      return false;
    } finally {
      setSubmitting(false);
    }
  }

  return { application, fetchError, submitting, submitError, submit };
}
