import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { requireAdmin } from '@/lib/serverAuth';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const authed = await requireAdmin(req);
    if (authed instanceof NextResponse) return authed;

    const { userId } = await params;
    const userIdNum = parseInt(userId);
    if (isNaN(userIdNum)) {
      return NextResponse.json({ error: 'invalid userId' }, { status: 400 });
    }

    const body = await req.json();
    const { status } = body;

    if (!['active', 'suspended'].includes(status)) {
      return NextResponse.json({ error: 'invalid status' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('users')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('user_id', userIdNum);

    if (error) {
      console.error('[PATCH /admin/users/:userId/status] supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[PATCH /admin/users/:userId/status] unexpected error:', e);
    return NextResponse.json({ error: 'internal server error' }, { status: 500 });
  }
}
