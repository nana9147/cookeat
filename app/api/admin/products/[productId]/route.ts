import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { requireAdmin } from '@/lib/serverAuth';

const VALID_STATUSES = ['판매중', '품절', '숨김'] as const;
type ProductStatus = (typeof VALID_STATUSES)[number];

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ productId: string }> },
) {
  try {
    const authed = await requireAdmin(req);
    if (authed instanceof NextResponse) return authed;

    const { productId } = await params;
    const productIdNum = parseInt(productId);
    if (isNaN(productIdNum)) {
      return NextResponse.json({ error: 'invalid productId' }, { status: 400 });
    }

    const body = await req.json();
    const { status, name, price, stock } = body as {
      status?: string;
      name?: string;
      price?: number;
      stock?: number;
    };

    if (status !== undefined && !VALID_STATUSES.includes(status as ProductStatus)) {
      return NextResponse.json({ error: 'invalid status' }, { status: 400 });
    }
    if (name !== undefined && (typeof name !== 'string' || name.trim().length === 0)) {
      return NextResponse.json({ error: 'invalid name' }, { status: 400 });
    }
    if (price !== undefined && (typeof price !== 'number' || price < 0)) {
      return NextResponse.json({ error: 'invalid price' }, { status: 400 });
    }
    if (stock !== undefined && (typeof stock !== 'number' || stock < 0)) {
      return NextResponse.json({ error: 'invalid stock' }, { status: 400 });
    }

    const updateFields: Record<string, string | number> = {
      updated_at: new Date().toISOString(),
    };
    if (status !== undefined) updateFields.status = status;
    if (name !== undefined) updateFields.name = name.trim();
    if (price !== undefined) updateFields.price = price;
    if (stock !== undefined) updateFields.stock = stock;

    const { error } = await supabaseAdmin
      .from('products')
      .update(updateFields)
      .eq('product_id', productIdNum);

    if (error) {
      console.error('[PATCH /admin/products/:productId] supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[PATCH /admin/products/:productId] unexpected error:', e);
    return NextResponse.json({ error: 'internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ productId: string }> },
) {
  try {
    const authed = await requireAdmin(req);
    if (authed instanceof NextResponse) return authed;

    const { productId } = await params;
    const productIdNum = parseInt(productId);
    if (isNaN(productIdNum)) {
      return NextResponse.json({ error: 'invalid productId' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('products')
      .delete()
      .eq('product_id', productIdNum);

    if (error) {
      console.error('[DELETE /admin/products/:productId] supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[DELETE /admin/products/:productId] unexpected error:', e);
    return NextResponse.json({ error: 'internal server error' }, { status: 500 });
  }
}
