import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { validateSignup } from '@/lib/validators';

export async function POST(req: NextRequest) {
  const { email, password, nickname, phone } = await req.json();

  const invalid = validateSignup({ email, password, nickname, phone });
  if (invalid) return NextResponse.json({ error: invalid }, { status: 400 });

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { nickname, phone } },
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ user: data.user, session: data.session }, { status: 201 });
}
