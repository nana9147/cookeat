import { NextResponse } from 'next/server';
import { getCategories } from './db';

export async function GET() {
  const categories = await getCategories();
  return NextResponse.json({ success: true, data: categories });
}
