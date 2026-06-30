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

async function getOwned(userId: number, addressId: number) {
  const { data, error } = await supabaseAdmin
    .from('user_shipping_addresses')
    .select('*')
    .eq('address_id', addressId)
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ addressId: string }> }
) {
  const authed = await requireAuth(req);
  if (authed instanceof NextResponse) return authed;

  const { addressId: rawId } = await params;
  const addressId = Number(rawId);
  if (!Number.isInteger(addressId) || addressId <= 0) {
    return NextResponse.json(
      { success: false, error: '잘못된 주소 ID입니다.' },
      { status: 400 }
    );
  }

  const target = await getOwned(authed.userId, addressId).catch(() => null);
  if (!target) {
    return NextResponse.json(
      { success: false, error: '주소를 찾을 수 없습니다.' },
      { status: 404 }
    );
  }

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

  const shouldBeDefault = Boolean(isDefault);

  if (shouldBeDefault && !target.is_default) {
    await supabaseAdmin
      .from('user_shipping_addresses')
      .update({ is_default: false })
      .eq('user_id', authed.userId)
      .eq('is_default', true);
  }

  if (!shouldBeDefault && target.is_default) {
    const { count } = await supabaseAdmin
      .from('user_shipping_addresses')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', authed.userId)
      .neq('address_id', addressId);
    if ((count ?? 0) === 0) {
      return NextResponse.json(
        { success: false, error: '기본 배송지는 최소 1개 이상이어야 합니다.' },
        { status: 400 }
      );
    }
  }

  const { data, error } = await supabaseAdmin
    .from('user_shipping_addresses')
    .update({
      label: label.trim(),
      recipient: recipient.trim(),
      phone: phone.trim(),
      zip_code: zipCode.trim(),
      base_address: baseAddress.trim(),
      address_detail: addressDetail?.trim() ?? null,
      is_default: shouldBeDefault,
      updated_at: new Date().toISOString(),
    })
    .eq('address_id', addressId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data: toDto(data) });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ addressId: string }> }
) {
  const authed = await requireAuth(req);
  if (authed instanceof NextResponse) return authed;

  const { addressId: rawId } = await params;
  const addressId = Number(rawId);
  if (!Number.isInteger(addressId) || addressId <= 0) {
    return NextResponse.json(
      { success: false, error: '잘못된 주소 ID입니다.' },
      { status: 400 }
    );
  }

  const target = await getOwned(authed.userId, addressId).catch(() => null);
  if (!target) {
    return NextResponse.json(
      { success: false, error: '주소를 찾을 수 없습니다.' },
      { status: 404 }
    );
  }

  const { error: deleteError } = await supabaseAdmin
    .from('user_shipping_addresses')
    .delete()
    .eq('address_id', addressId);

  if (deleteError) {
    return NextResponse.json({ success: false, error: deleteError.message }, { status: 500 });
  }

  // 삭제한 주소가 기본이었으면 가장 오래된 주소를 새 기본으로 승격
  if (target.is_default) {
    const { data: next } = await supabaseAdmin
      .from('user_shipping_addresses')
      .select('address_id')
      .eq('user_id', authed.userId)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (next) {
      await supabaseAdmin
        .from('user_shipping_addresses')
        .update({ is_default: true })
        .eq('address_id', next.address_id);
    }
  }

  return NextResponse.json({ success: true });
}
