import { NextRequest, NextResponse } from 'next/server'
import { getUserId, getSellerByUserId, reapplySeller, insertSeller } from './db'
import { validateApplyBody } from './validate'

export async function GET(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const userId = await getUserId(token)
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const seller = await getSellerByUserId(userId)
  return NextResponse.json({ data: seller })
}

export async function POST(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const userId = await getUserId(token)
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const body = await req.json()
  const fieldErrors = validateApplyBody(body)
  if (Object.keys(fieldErrors).length > 0) {
    return NextResponse.json({ errors: fieldErrors }, { status: 400 })
  }

  const { storeName, businessNumber, businessAddress, bankName, bankAccount } = body
  const fields = { storeName, businessNumber, businessAddress, bankName, bankAccount }

  const existing = await getSellerByUserId(userId)

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

  const { data, error } = await insertSeller(userId, fields)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(
    { success: true, data: { sellerId: data.seller_id, approveStatus: 'pending' } },
    { status: 201 },
  )
}
