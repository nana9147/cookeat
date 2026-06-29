import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/serverAuth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(req: NextRequest) {
  const authed = await requireAuth(req);
  if (authed instanceof NextResponse) return authed;

  const [userRes, historyRes] = await Promise.all([
    supabaseAdmin.from('users').select('point').eq('user_id', authed.userId).single(),
    supabaseAdmin
      .from('point_history')
      .select('id, type, amount, description, created_at')
      .eq('user_id', authed.userId)
      .order('created_at', { ascending: false })
      .limit(50),
  ]);

  if (userRes.error) return NextResponse.json({ error: userRes.error.message }, { status: 500 });

  type HistoryRow = { id: number; type: string; amount: number; description: string; created_at: string };

  const history = ((historyRes.data as unknown as HistoryRow[]) ?? []).map((h) => ({
    pointId: h.id, type: h.type, amount: h.amount,
    description: h.description, createdAt: h.created_at,
  }));

  return NextResponse.json({ balance: userRes.data.point ?? 0, history });
}
