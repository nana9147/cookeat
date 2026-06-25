'use client';

import { useSellerApply } from '@/hooks/user/useSellerApply';
import SellerApplyForm from './SellerApplyForm';
import SellerApplyStatus from './SellerApplyStatus';

export default function Sellerapply() {
  const { application, fetchError, submitting, submitError, submit } = useSellerApply();

  if (fetchError) {
    return <div className="py-12 text-center text-sm text-red-500">데이터를 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.</div>;
  }

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
