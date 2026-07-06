import { NextRequest, NextResponse } from 'next/server';
import { requireSellerContext } from '@/lib/sellerContext';
import { getSellerProducts, createSellerProduct } from './db';
import { resolveDiscountValue } from '@/lib/productPricing';
import { validateProductFields, validateImageFile } from '@/lib/validators';

export async function GET(req: NextRequest) {
  const sellerCtx = await requireSellerContext(req);
  if (sellerCtx instanceof NextResponse) return sellerCtx;

  const { searchParams } = req.nextUrl;
  const page = Number(searchParams.get('page') ?? '1');
  const limit = Number(searchParams.get('limit') ?? '10');
  const keyword = searchParams.get('keyword') ?? undefined;
  const status = searchParams.get('status') ?? undefined;
  const categoryId = searchParams.get('categoryId');
  const parentId = searchParams.get('parentId');
  const sortBy = searchParams.get('sortBy') ?? undefined;
  const sortOrder = (searchParams.get('sortOrder') ?? 'desc') as 'asc' | 'desc';

  const { products, total } = await getSellerProducts(sellerCtx.sellerId, {
    page,
    limit,
    keyword,
    status,
    categoryId: categoryId ? Number(categoryId) : undefined,
    parentId: parentId ? Number(parentId) : undefined,
    sortBy: sortBy === 'price' || sortBy === 'stock' ? sortBy : undefined,
    sortOrder,
  });

  return NextResponse.json({
    success: true,
    data: { products, pagination: { page, limit, total, hasNext: page * limit < total } },
  });
}

export async function POST(req: NextRequest) {
  const sellerCtx = await requireSellerContext(req);
  if (sellerCtx instanceof NextResponse) return sellerCtx;

  const formData = await req.formData();

  const name = formData.get('name') as string;
  const brand = (formData.get('brand') as string | null) ?? '';
  const origin = formData.get('origin') as string;
  const categoryId = formData.get('categoryId') as string;
  const status = formData.get('status') as string;
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

  const representativeImage = formData.get('image');
  const subImages = formData.getAll('subImages').filter((f): f is File => f instanceof File);

  const requiredFields: { key: string; value: string | null; label: string }[] = [
    { key: 'name', value: name, label: '상품명' },
    { key: 'origin', value: origin, label: '원산지' },
    { key: 'categoryId', value: categoryId, label: '카테고리' },
    { key: 'status', value: status, label: '판매 상태' },
    { key: 'price', value: price, label: '가격' },
    { key: 'stock', value: stock, label: '재고 수량' },
    { key: 'shippingTemplateId', value: shippingTemplateId, label: '배송 템플릿' },
    { key: 'returnPolicyTemplateId', value: returnPolicyTemplateId, label: '반품정책' },
  ];

  const missingLabels = requiredFields
    .filter(
      (field) => !field.value || (typeof field.value === 'string' && field.value.trim() === '')
    )
    .map((field) => field.label);

  if (missingLabels.length > 0) {
    return NextResponse.json(
      {
        success: false,
        error: `다음 필수 항목이 누락되었습니다: ${missingLabels.join(', ')}`,
      },
      { status: 400 }
    );
  }

  if (!(representativeImage instanceof File) || representativeImage.size === 0) {
    return NextResponse.json(
      { success: false, error: '대표 이미지가 필요합니다.' },
      { status: 400 }
    );
  }

  const fieldError = validateProductFields({
    status,
    price: Number(price),
    stock: Number(stock),
    discountType,
    discountValue,
  });
  if (fieldError) {
    return NextResponse.json({ success: false, error: fieldError }, { status: 400 });
  }

  const repImageError = validateImageFile(representativeImage);
  if (repImageError) {
    return NextResponse.json({ success: false, error: repImageError }, { status: 400 });
  }
  for (const file of subImages) {
    const subImageError = validateImageFile(file);
    if (subImageError) {
      return NextResponse.json({ success: false, error: subImageError }, { status: 400 });
    }
  }

  try {
    const { productId } = await createSellerProduct(
      {
        sellerId: sellerCtx.sellerId,
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

    return NextResponse.json({ success: true, data: { productId } }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : '상품 등록에 실패했습니다.';
    const isClientError = message === '존재하지 않는 카테고리입니다.';
    return NextResponse.json(
      { success: false, error: message },
      { status: isClientError ? 400 : 500 }
    );
  }
}
