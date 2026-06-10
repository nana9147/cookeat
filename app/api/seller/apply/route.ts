import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/serverAuth'
import { getSellerByUserId, reapplySeller, insertSeller } from './db'
import { validateApplyBody } from './validate'

export async function GET(req: NextRequest) {
  const authed = await requireAuth(req)
  if (authed instanceof NextResponse) return authed

  const seller = await getSellerByUserId(authed.userId)
  return NextResponse.json({ data: seller })
}

export async function POST(req: NextRequest) {
  const authed = await requireAuth(req)
  if (authed instanceof NextResponse) return authed

  const body = await req.json()
  const fieldErrors = validateApplyBody(body)
  if (Object.keys(fieldErrors).length > 0) {
    return NextResponse.json({ errors: fieldErrors }, { status: 400 })
  }

  const { isCoRepresentative, representativeName, csPhone, storeName, businessNumber, businessAddress, bankName, bankAccount } = body
  const fields = { isCoRepresentative: !!isCoRepresentative, representativeName, csPhone, storeName, businessNumber, businessAddress, bankName, bankAccount }

  const existing = await getSellerByUserId(authed.userId)

  if (existing) {
    if (existing.approve_status === 'pending') {
      return NextResponse.json({ error: '이미 심사 중인 신청이 있습니다.' }, { status: 409 })
    }
    if (existing.approve_status === 'approved') {
      return NextResponse.json({ error: '이미 판매자로 승인되었습니다.' }, { status: 409 })
    }

    const { error } = await reapplySeller(existing.seller_id, fields)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, data: { sellerId: existing.seller_id, approveStatus: 'pending' } })
  }

  const { data, error } = await insertSeller(authed.userId, fields)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(
    { success: true, data: { sellerId: data.seller_id, approveStatus: 'pending' } },
    { status: 201 },
  )
}
