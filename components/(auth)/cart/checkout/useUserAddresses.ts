'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import type {
  UserShippingAddress,
  CreateShippingAddressInput,
  UpdateShippingAddressInput,
} from '@/types/user/address';

const BASE = '/users/me/addresses';
type ListRes = { success: boolean; data: UserShippingAddress[] };
type OneRes = { success: boolean; data: UserShippingAddress };

export function useUserAddresses() {
  const [addresses, setAddresses] = useState<UserShippingAddress[]>([]);
  const [loading, setLoading] = useState(true);

  // 초기 로드: setLoading(true)를 effect 안에서 동기 호출하지 않도록
  // loading 초기값을 true로 두고 .finally()에서만 false로 전환
  useEffect(() => {
    let cancelled = false;
    api
      .get<ListRes>(BASE)
      .then(({ data }) => { if (!cancelled) setAddresses(data.data); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const refresh = useCallback(async () => {
    const { data } = await api.get<ListRes>(BASE);
    setAddresses(data.data);
  }, []);

  const add = useCallback(
    async (input: CreateShippingAddressInput) => {
      const { data } = await api.post<OneRes>(BASE, input);
      await refresh();
      return data.data;
    },
    [refresh]
  );

  const update = useCallback(
    async (id: number, input: UpdateShippingAddressInput) => {
      const { data } = await api.patch<OneRes>(`${BASE}/${id}`, input);
      await refresh();
      return data.data;
    },
    [refresh]
  );

  const remove = useCallback(async (id: number) => {
    await api.delete(`${BASE}/${id}`);
    setAddresses((prev) => prev.filter((a) => a.addressId !== id));
  }, []);

  return { addresses, loading, add, update, remove, refresh };
}
