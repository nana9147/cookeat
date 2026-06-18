import Link from 'next/link';

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 flex flex-col items-center gap-4">
      <p className="text-sm text-gray-text">{orderId}</p>
      <p className="text-sm text-gray-text">주문 상세 페이지 준비 중입니다.</p>
      <Link href="/mypage" className="text-sm text-primary hover:underline">
        주문 목록으로 돌아가기
      </Link>
    </div>
  );
}
