'use client';

import { useSellerApply } from '@/hooks/user/useSellerApply';
import SellerApplyForm from './SellerApplyForm';
import SellerApplyStatus from './SellerApplyStatus';

export default function Sellerapply() {
  const { application, submitting, submitError, submit } = useSellerApply();

  if (application === undefined) {
    return <div className="py-12 text-center text-sm text-gray-text">불러오는 중...</div>;
  }

  if (application?.approve_status === 'pending' || application?.approve_status === 'approved') {
    return <SellerApplyStatus status={application.approve_status} />;
  }

  return (
    <SellerApplyForm
      isRejected={application?.approve_status === 'rejected'}
      rejectedReason={application?.rejected_reason ?? ''}
      submitting={submitting}
      submitError={submitError}
      onSubmit={submit}
    />
  );
}
