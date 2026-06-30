import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/serverAuth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { validatePhone } from '@/lib/validators';
import type { UserShippingAddress } from '@/types/user/address';

function toDto(row: Record<string, unknown>): UserShippingAddress {
  return {
    addressId: row.address_id as number,
    label: row.label as string,
    recipient: row.recipient as string,
    phone: row.phone as string,
    zipCode: row.zip_code as string,
    baseAddress: row.base_address as string,
    addressDetail: (row.address_detail as string | null) ?? null,
    isDefault: row.is_default as boolean,
  };
}

export async function GET(req: NextRequest) {
  const authed = await requireAuth(req);
  if (authed instanceof NextResponse) return authed;

  const { data, error } = await supabaseAdmin
    .from('user_shipping_addresses')
    .select('*')
    .eq('user_id', authed.userId)
    .order('created_at', { ascending: true });

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data: (data ?? []).map(toDto) });
}

export async function POST(req: NextRequest) {
  const authed = await requireAuth(req);
  if (authed instanceof NextResponse) return authed;

  const body = await req.json();
  const { label, recipient, phone, zipCode, baseAddress, addressDetail, isDefault } = body;

  if (!label || !recipient || !phone || !zipCode || !baseAddress) {
    return NextResponse.json(
      { success: false, error: '필수 항목이 누락되었습니다.' },
      { status: 400 }
    );
  }

  if (!validatePhone(phone.trim())) {
    return NextResponse.json(
      { success: false, error: '전화번호 형식(010-0000-0000)이 올바르지 않습니다.' },
      { status: 400 }
    );
  }

  const { count, error: countError } = await supabaseAdmin
    .from('user_shipping_addresses')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', authed.userId);

  if (countError) {
    return NextResponse.json({ success: false, error: countError.message }, { status: 500 });
  }

  const shouldBeDefault = Boolean(isDefault) || count === 0;

  if (shouldBeDefault) {
    await supabaseAdmin
      .from('user_shipping_addresses')
      .update({ is_default: false })
      .eq('user_id', authed.userId)
      .eq('is_default', true);
  }

  const { data, error } = await supabaseAdmin
    .from('user_shipping_addresses')
    .insert({
      user_id: authed.userId,
      label: label.trim(),
      recipient: recipient.trim(),
      phone: phone.trim(),
      zip_code: zipCode.trim(),
      base_address: baseAddress.trim(),
      address_detail: addressDetail?.trim() ?? null,
      is_default: shouldBeDefault,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data: toDto(data) }, { status: 201 });
}
