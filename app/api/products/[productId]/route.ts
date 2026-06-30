import { NextRequest, NextResponse } from 'next/server';
import { getProductDetail } from '@/lib/products';

interface Props {
  params: Promise<{ productId: string }>;
}

export async function GET(_req: NextRequest, { params }: Props) {
  const { productId } = await params;
  const id = Number(productId);

  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ success: false, error: '유효하지 않은 상품 ID입니다.' }, { status: 400 });
  }

  const product = await getProductDetail(id);

  if (!product) {
    return NextResponse.json({ success: false, error: '상품을 찾을 수 없습니다.' }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: product });
}
