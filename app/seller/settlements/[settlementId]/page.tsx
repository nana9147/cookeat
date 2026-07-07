'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import { toast } from 'sonner';
import { SettlementDetail } from '@/types/seller/settlement';
import BackButton from '../../components/BackButton';
import SettlementBasicInfo from '../../components/SettlementDetail/SettlementBasicInfo';
import SettlementAmountDetail from '../../components/SettlementDetail/SettlementAmountDetail';
import SettlementBankInfo from '../../components/SettlementDetail/SettlementBankInfo';
import SettlementOrderTable from '../../components/SettlementDetail/SettlementOrderTable';

export default function SettlementDetailPage() {
  const params = useParams();
  const settlementId = params.settlementId as string;

  const [detail, setDetail] = useState<SettlementDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      setIsLoading(true);
      try {
        const res = await api.get(`/seller/settlements/${settlementId}`);
        setDetail(res.data.data);
      } catch (e) {
        const msg = e instanceof Error ? e.message : '정산 상세를 불러오지 못했습니다.';
        toast.error(msg, { id: msg });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetail();
  }, [settlementId]);

  if (isLoading) {
    return (
      <div className="bg-background p-8 max-tablet:p-5 max-mobile:p-4 text-center text-gray-400">
        불러오는 중...
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="bg-background p-8 max-tablet:p-5 max-mobile:p-4 text-center text-gray-400">
        정산 내역을 찾을 수 없습니다.
      </div>
    );
  }

  return (
    <div className="bg-background p-8 max-tablet:p-5 max-mobile:p-4">
      <div className="flex flex-row justify-between items-center mb-8">
        <div className="flex items-center gap-2">
          <BackButton />
          <h1 className="text-h2 font-bold text-dark-text leading-none">정산 상세</h1>
        </div>
      </div>

      <SettlementBasicInfo detail={detail} />
      <SettlementAmountDetail detail={detail} />
      <SettlementOrderTable orders={detail.orders} />
      <SettlementBankInfo detail={detail} />
    </div>
  );
}
