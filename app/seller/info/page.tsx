'use client';

import { useState } from 'react';
import { SellerApplication } from '@/types/seller/seller';
import SellerBasicInfo from '../components/Info/SellerBasicInfo';
import SellerBankInfo from '../components/Info/SellerBankInfo';
import SellerBusinessInfo from '../components/Info/SellerBusinessInfo';
import { Button } from '@/components/ui/button';

const MOCK_SELLER: SellerApplication = {
  seller_id: 1,
  store_name: '당근나라',
  business_number: '123-45-67890',
  business_address: '서울시 강남구 테헤란로 123, 456호',
  bank_name: '카카오뱅크',
  bank_account: '3333-01-1234567',
  approve_status: 'rejected',
  rejected_reason: '사업자 등록증 서류가 불분명합니다. 재제출 해주세요.',
  created_at: '2026-01-15T09:00:00Z',
};

export default function SellerInfoPage() {
  const [localData, setLocalData] = useState<SellerApplication>(MOCK_SELLER);
  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (updated: Partial<SellerApplication>) => {
    setLocalData((prev) => ({ ...prev, ...updated }));
  };

  const handleSave = () => {
    // TODO: API 호출
    setIsEditing(false);
  };

  const handleCancel = () => {
    setLocalData(MOCK_SELLER);
    setIsEditing(false);
  };

  return (
    <div className="bg-background p-8 flex flex-col gap-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-h2 font-bold text-dark-text">판매자 정보</h1>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancel}>
                취소
              </Button>
              <Button onClick={handleSave}>저장</Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)}>수정</Button>
          )}
        </div>
      </div>
      <SellerBasicInfo data={localData} isEditing={isEditing} onChange={handleChange} />
      <SellerBusinessInfo data={localData} isEditing={isEditing} onChange={handleChange} />
      <SellerBankInfo data={localData} isEditing={isEditing} onChange={handleChange} />
    </div>
  );
}
