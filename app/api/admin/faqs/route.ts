import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { requireAdmin } from '@/lib/serverAuth';

export async function GET(req: NextRequest) {
  const authed = await requireAdmin(req);
  if (authed instanceof NextResponse) return authed;

  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category') ?? '';
  const keyword = searchParams.get('keyword') ?? '';

  let query = supabaseAdmin
    .from('faqs')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (category) query = query.eq('category', category);
  if (keyword) query = query.ilike('title', `%${keyword}%`);

  const { data, error, count } = await query;
  if (error) {
    console.error('[GET /api/admin/faqs]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ faqs: data ?? [], total: count ?? 0 });
}

export async function POST(req: NextRequest) {
  const authed = await requireAdmin(req);
  if (authed instanceof NextResponse) return authed;

  const body = await req.json();
  const { category, title, content, is_public } = body;

  if (!category || !title || !content) {
    return NextResponse.json({ error: '필수 항목이 누락되었습니다.' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('faqs')
    .insert({ category, title, content, is_public: is_public ?? true })
    .select()
    .single();

  if (error) {
    console.error('[POST /api/admin/faqs]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ faq: data }, { status: 201 });
}
