import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/serverAuth';
import { uploadInquiryImage } from '@/lib/inquiryImage';
import { validateImageFile } from '@/lib/validators';

const MAX_FILES = 5;

export async function POST(req: NextRequest) {
  const authed = await requireAuth(req);
  if (authed instanceof NextResponse) return authed;

  const formData = await req.formData();
  const files = formData.getAll('images').filter((f): f is File => f instanceof File);

  if (files.length === 0) {
    return NextResponse.json({ error: '첨부할 이미지가 없습니다.' }, { status: 400 });
  }
  if (files.length > MAX_FILES) {
    return NextResponse.json({ error: `이미지는 최대 ${MAX_FILES}개까지 첨부할 수 있습니다.` }, { status: 400 });
  }
  for (const file of files) {
    const err = validateImageFile(file);
    if (err) return NextResponse.json({ error: err }, { status: 400 });
  }

  try {
    const urls = await Promise.all(files.map((file) => uploadInquiryImage(authed.userId, file)));
    return NextResponse.json({ urls });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : '이미지 업로드에 실패했습니다.' },
      { status: 500 }
    );
  }
}
