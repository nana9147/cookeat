import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/serverAuth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(req: NextRequest) {
  const authed = await requireAuth(req);
  if (authed instanceof NextResponse) return authed;

  const [bookmarksRes, wishlistsRes] = await Promise.all([
    supabaseAdmin
      .from('bookmarks')
      .select('bookmark_id', { count: 'exact', head: true })
      .eq('user_id', authed.userId),
    supabaseAdmin
      .from('product_wishlists')
      .select('wishlist_id', { count: 'exact', head: true })
      .eq('user_id', authed.userId),
  ]);

  return NextResponse.json({
    bookmarkCount: bookmarksRes.count ?? 0,
    wishlistCount: wishlistsRes.count ?? 0,
  });
}
