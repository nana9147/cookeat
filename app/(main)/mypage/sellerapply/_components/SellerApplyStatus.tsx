type ApproveStatus = 'pending' | 'approved';

interface Props {
  status: ApproveStatus;
}

export default function SellerApplyStatus({ status }: Props) {
  if (status === 'pending') {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-yellow-100">
          <span className="text-2xl">⏳</span>
        </div>
        <h3 className="font-bold text-dark-text">심사 중입니다</h3>
        <p className="text-sm text-gray-text">
          판매자 신청이 접수되었습니다.
          <br />
          승인까지 영업일 기준 1~3일이 소요됩니다.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 py-12 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
        <span className="text-2xl">✅</span>
      </div>
      <h3 className="font-bold text-dark-text">판매자로 승인되었습니다</h3>
      <p className="text-sm text-gray-text">이제 상품을 등록하고 판매를 시작할 수 있습니다.</p>
    </div>
  );
}
