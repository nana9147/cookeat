import ProductDetailPage from '@/app/(main)/shopping/[id]/page';

interface Props {
  params: Promise<{ productId: string }>;
}

export default async function SellerProductPreviewPage({ params }: Props) {
  const { productId } = await params;
  // 원본 페이지가 기대하는 params 형태({ id })로 맞춰서 그대로 전달
  return <ProductDetailPage params={Promise.resolve({ id: productId })} />;
}
