import { NextRequest, NextResponse } from 'next/server';
import { requireSellerContext } from '@/lib/sellerContext';
import { getSellerProductById, updateSellerProduct, deleteSellerProduct } from './db';
import { resolveDiscountValue } from '@/lib/productPricing';

interface RouteParams {
  params: Promise<{ productId: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  const sellerCtx = await requireSellerContext(req);
  if (sellerCtx instanceof NextResponse) return sellerCtx;

  const { productId } = await params;
  const productIdNum = Number(productId);

  if (!productIdNum || Number.isNaN(productIdNum)) {
    return NextResponse.json({ success: false, error: '잘못된 상품 ID입니다.' }, { status: 400 });
  }

  try {
    const { product, subImages } = await getSellerProductById(sellerCtx.sellerId, productIdNum);
    return NextResponse.json({ success: true, data: { product, subImages } });
  } catch (err) {
    const message = err instanceof Error ? err.message : '상품 조회에 실패했습니다.';
    const status =
      message === '상품을 찾을 수 없습니다.'
        ? 404
        : message === '해당 상품에 접근할 권한이 없습니다.'
          ? 403
          : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const sellerCtx = await requireSellerContext(req);
  if (sellerCtx instanceof NextResponse) return sellerCtx;

  const { productId } = await params;
  const productIdNum = Number(productId);

  if (!productIdNum || Number.isNaN(productIdNum)) {
    return NextResponse.json({ success: false, error: '잘못된 상품 ID입니다.' }, { status: 400 });
  }

  const formData = await req.formData();

  const name = formData.get('name') as string | null;
  const brand = (formData.get('brand') as string | null) ?? '';
  const origin = formData.get('origin') as string | null;
  const categoryId = formData.get('categoryId') as string | null;
  const status = formData.get('status') as string | null;
  const price = formData.get('price') as string | null;
  const stock = formData.get('stock') as string | null;
  const description = (formData.get('description') as string | null) ?? '';
  const shippingTemplateId = formData.get('shippingTemplateId') as string | null;
  const returnPolicyTemplateId = formData.get('returnPolicyTemplateId') as string | null;
  const discountType = (formData.get('discountType') as string | null) ?? 'none';
  const discountValue = resolveDiscountValue(
    discountType,
    formData.get('discountValue') as string | null
  );

  const representativeImageRaw = formData.get('image');
  const representativeImage =
    representativeImageRaw instanceof File ? representativeImageRaw : null;

  const metaRaw = formData.get('subImages_meta') as string | null;
  const subImagesFiles = formData
    .getAll('subImages_files')
    .filter((f): f is File => f instanceof File);

  if (!name || !origin || !categoryId || !status || !price || !stock) {
    return NextResponse.json(
      { success: false, error: '필수 항목이 누락되었습니다.' },
      { status: 400 }
    );
  }
  if (!shippingTemplateId || !returnPolicyTemplateId) {
    return NextResponse.json(
      { success: false, error: '배송 템플릿과 반품정책을 선택해주세요.' },
      { status: 400 }
    );
  }

  let subImages: { imageId?: number; file?: File }[] = [];
  if (metaRaw) {
    try {
      const meta = JSON.parse(metaRaw) as { imageId?: number; isNew?: boolean }[];
      let fileIndex = 0;
      subImages = meta.map((item) => {
        if (item.isNew) {
          const file = subImagesFiles[fileIndex];
          fileIndex += 1;
          return { file };
        }
        return { imageId: item.imageId };
      });
    } catch {
      return NextResponse.json(
        { success: false, error: '이미지 정보 형식이 올바르지 않습니다.' },
        { status: 400 }
      );
    }
  }

  try {
    const { productId: updatedId } = await updateSellerProduct(
      {
        sellerId: sellerCtx.sellerId,
        productId: productIdNum,
        name,
        brand,
        origin,
        categoryId: Number(categoryId),
        status,
        price: Number(price),
        stock: Number(stock),
        description,
        shippingTemplateId: shippingTemplateId ? Number(shippingTemplateId) : null,
        returnPolicyTemplateId: returnPolicyTemplateId ? Number(returnPolicyTemplateId) : null,
        discountType,
        discountValue,
      },
      representativeImage,
      subImages
    );

    return NextResponse.json({ success: true, data: { productId: updatedId } });
  } catch (err) {
    const message = err instanceof Error ? err.message : '상품 수정에 실패했습니다.';
    const status =
      message === '상품을 찾을 수 없습니다.'
        ? 404
        : message === '해당 상품을 수정할 권한이 없습니다.'
          ? 403
          : message === '존재하지 않는 카테고리입니다.'
            ? 400
            : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const sellerCtx = await requireSellerContext(req);
  if (sellerCtx instanceof NextResponse) return sellerCtx;

  const { productId } = await params;
  const productIdNum = Number(productId);

  if (!productIdNum || Number.isNaN(productIdNum)) {
    return NextResponse.json({ success: false, error: '잘못된 상품 ID입니다.' }, { status: 400 });
  }

  try {
    await deleteSellerProduct(sellerCtx.sellerId, productIdNum);
    return NextResponse.json({ success: true, data: { productId: productIdNum } });
  } catch (err) {
    const message = err instanceof Error ? err.message : '상품 삭제에 실패했습니다.';
    const status =
      message === '상품을 찾을 수 없습니다.'
        ? 404
        : message === '해당 상품을 삭제할 권한이 없습니다.'
          ? 403
          : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
