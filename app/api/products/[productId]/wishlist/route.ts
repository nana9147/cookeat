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
    const { error: deleteError } = await supabaseAdmin
      .from('product_wishlists').delete().eq('wishlist_id', existing.wishlist_id);
    if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 500 });
  } else {
    const { error: insertError } = await supabaseAdmin
      .from('product_wishlists').insert({ product_id: id, user_id: authed.userId });
    if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ isActive: !existing });
}
