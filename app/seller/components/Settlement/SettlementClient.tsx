'use client';

import { useState } from 'react';
import type { Settlement, SettlementNext } from '@/types/seller/settlement';
import SettlementHeroCard from './SettlementHeroCard';
import SettlementSummaryCards from './SettlementSummaryCards';
import SettlementSearchFilter from './SettlementSearchFilter';
import SettlementTable from './SettlementTable';

const MOCK_NEXT_SETTLEMENT: SettlementNext = {
  nextSettlementAmount: 2535000,
  totalSalesAmount: 2850000,
  commission: 285000,
  commissionRate: 10,
  shippingFee: 30000,
  nextSettlementDate: '2026-06-23',
};

const MOCK_SUMMARY = {
  settlementAmount: 12369300,
  settlementCount: 3,
  commissionRate: 10,
  shippingFee: 131700,
};

const MOCK_SETTLEMENTS: Settlement[] = [
  {
    id: 'SET-001',
    period: '2026년 6월 3주차',
    totalSalesAmount: 4850000,
    commission: 485000,
    shippingFee: 42000,
    settlementAmount: 4323000,
    settlementDate: '2026-06-16',
    status: '정산예정',
  },
  {
    id: 'SET-002',
    period: '2026년 6월 2주차',
    totalSalesAmount: 3920000,
    commission: 392000,
    shippingFee: 38500,
    settlementAmount: 3489500,
    settlementDate: '2026-06-09',
    status: '정산완료',
  },
  {
    id: 'SET-003',
    period: '2026년 6월 1주차',
    totalSalesAmount: 5120000,
    commission: 512000,
    shippingFee: 51200,
    settlementAmount: 4556800,
    settlementDate: '2026-06-02',
    status: '정산보류',
  },
  {
    id: 'SET-004',
    period: '2026년 5월 3주차',
    totalSalesAmount: 4850000,
    commission: 485000,
    shippingFee: 42000,
    settlementAmount: 4323000,
    settlementDate: '2026-05-26',
    status: '정산완료',
  },
  {
    id: 'SET-005',
    period: '2026년 5월 2주차',
    totalSalesAmount: 3920000,
    commission: 392000,
    shippingFee: 38500,
    settlementAmount: 3489500,
    settlementDate: '2026-05-19',
    status: '정산완료',
  },
  {
    id: 'SET-006',
    period: '2026년 5월 1주차',
    totalSalesAmount: 5120000,
    commission: 512000,
    shippingFee: 51200,
    settlementAmount: 4556800,
    settlementDate: '2026-05-12',
    status: '정산완료',
  },
];

export default function SettlementClient() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filteredData, setFilteredData] = useState<Settlement[]>(MOCK_SETTLEMENTS);

  const handleSearch = () => {
    const filtered = MOCK_SETTLEMENTS.filter((s) => {
      if (!startDate && !endDate) return true;
      if (startDate && s.settlementDate < startDate) return false;
      if (endDate && s.settlementDate > endDate) return false;
      return true;
    });
    setFilteredData(filtered);
  };

  return (
    <div className="p-6">
      <h1 className="text-h2 font-bold text-dark-text mb-6">정산 관리</h1>
      <SettlementHeroCard nextSettlement={MOCK_NEXT_SETTLEMENT} />
      <SettlementSummaryCards
        settlementAmount={MOCK_SUMMARY.settlementAmount}
        settlementCount={MOCK_SUMMARY.settlementCount}
        commissionRate={MOCK_SUMMARY.commissionRate}
        shippingFee={MOCK_SUMMARY.shippingFee}
      />
      <SettlementSearchFilter
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onSearch={handleSearch}
      />
      <SettlementTable data={filteredData} />
    </div>
  );
}
