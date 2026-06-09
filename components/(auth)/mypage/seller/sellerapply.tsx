'use client';

import SellerApplyForm from './SellerApplyForm';
import SellerApplyStatus from './SellerApplyStatus';

// TODO: 훅으로 교체
type ApproveStatus = 'pending' | 'approved' | 'rejected' | null;
const MOCK_STATUS: ApproveStatus = null;
const MOCK_REJECTED_REASON = '';

export default function Sellerapply() {
  const status = MOCK_STATUS;

  if (status === 'pending' || status === 'approved') {
    return <SellerApplyStatus status={status} />;
  }

  return (
    <SellerApplyForm
      isRejected={status === 'rejected'}
      rejectedReason={MOCK_REJECTED_REASON}
    />
  );
}
