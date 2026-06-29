import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/serverAuth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

type Params = { params: Promise<{ productId: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const authed = await requireAuth(req);
  if (authed instanceof NextResponse) return authed;

  const { productId } = await params;
  const id = Number(productId);
  if (!Number.isInteger(id) || id < 1) return NextResponse.json({ error: 'invalid id' }, { status: 400 });

  const { data } = await supabaseAdmin
    .from('product_wishlists').select('wishlist_id').eq('product_id', id).eq('user_id', authed.userId).maybeSingle();

  return NextResponse.json({ isActive: !!data });
}

export async function POST(req: NextRequest, { params }: Params) {
  const authed = await requireAuth(req);
  if (authed instanceof NextResponse) return authed;

  const { productId } = await params;
  const id = Number(productId);
  if (!Number.isInteger(id) || id < 1) return NextResponse.json({ error: 'invalid id' }, { status: 400 });

  const { data: existing } = await supabaseAdmin
    .from('product_wishlists').select('wishlist_id').eq('product_id', id).eq('user_id', authed.userId).maybeSingle();

  if (existing) {
    await supabaseAdmin.from('product_wishlists').delete().eq('wishlist_id', existing.wishlist_id);
  } else {
    await supabaseAdmin.from('product_wishlists').insert({ product_id: id, user_id: authed.userId });
  }

  return NextResponse.json({ isActive: !existing });
}
