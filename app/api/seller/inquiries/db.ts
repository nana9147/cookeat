import { supabaseAdmin } from '@/lib/supabaseAdmin';

export type SellerInquiryType = '상품문의' | '배송문의' | '주문문의';
const ORDER_LINKED_TYPES: SellerInquiryType[] = ['배송문의', '주문문의'];

async function getSellerProductIds(sellerId: number): Promise<number[]> {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('product_id')
    .eq('seller_id', sellerId);
  if (error) throw error;
  return (data ?? []).map((p) => p.product_id);
}

async function getSellerOrderItemIds(sellerId: number): Promise<number[]> {
  const { data, error } = await supabaseAdmin
    .from('order_items')
    .select('item_id')
    .eq('seller_id', sellerId);
  if (error) throw error;
  return (data ?? []).map((i) => i.item_id);
}

type ReplyRow = { reply_id: number; content: string; created_at: string };
type ProductRel = { name: string } | null;
type OrderItemRel = { order_id: string; products: ProductRel } | null;
type ImageRow = { url: string };

type InquiryRow = {
  inquiry_id: number;
  category: string;
  title: string;
  content: string;
  user_id: number;
  product_id: number | null;
  order_item_id: number | null;
  created_at: string;
  inquiry_replies: ReplyRow[] | ReplyRow | null;
  products: ProductRel;
  order_items: OrderItemRel;
  inquiry_images: ImageRow[] | null;
};

function normalizeReply(raw: ReplyRow[] | ReplyRow | null): ReplyRow | null {
  if (raw == null) return null;
  return Array.isArray(raw) ? (raw[0] ?? null) : raw;
}

function getInquiryType(r: InquiryRow): SellerInquiryType {
  return r.product_id != null ? '상품문의' : (r.category as SellerInquiryType);
}

function mapRow(r: InquiryRow) {
  const reply = normalizeReply(r.inquiry_replies);
  const linkedName =
    r.product_id != null
      ? (r.products?.name ?? '(삭제된 상품)')
      : `주문 ${r.order_items?.order_id ?? ''} · ${r.order_items?.products?.name ?? '(삭제된 상품)'}`;

  return {
    inquiryId: r.inquiry_id,
    type: getInquiryType(r),
    title: r.title,
    content: r.content,
    userId: r.user_id,
    linkedName,
    isAnswered: reply != null,
    reply: reply ? { content: reply.content, createdAt: reply.created_at } : null,
    createdAt: r.created_at,
    images: (r.inquiry_images ?? []).map((img) => img.url),
  };
}

async function attachAuthorNames<T extends { userId: number }>(rows: T[]) {
  const userIds = [...new Set(rows.map((r) => r.userId))];
  if (userIds.length === 0) return new Map<number, string>();

  const { data } = await supabaseAdmin
    .from('users')
    .select('user_id, nickname, email')
    .in('user_id', userIds);

  return new Map(
    (data ?? []).map((u) => [u.user_id, u.nickname ?? u.email?.split('@')[0] ?? '(알 수 없음)'])
  );
}

const SELECT = `
  inquiry_id, category, title, content, user_id, product_id, order_item_id, created_at,
  inquiry_replies(reply_id, content, created_at),
  products(name),
  order_items(order_id, products(name)),
  inquiry_images(url)
`;

type InquiryScope =
  | { kind: 'product'; ids: number[] }
  | { kind: 'orderItem'; ids: number[]; category: SellerInquiryType }
  | { kind: 'mixed'; productIds: number[]; itemIds: number[] };

async function resolveInquiryScope(
  sellerId: number,
  type: SellerInquiryType | undefined
): Promise<InquiryScope | null> {
  if (type === '상품문의') {
    const productIds = await getSellerProductIds(sellerId);
    if (productIds.length === 0) return null;
    return { kind: 'product', ids: productIds };
  }

  if (type && ORDER_LINKED_TYPES.includes(type)) {
    const itemIds = await getSellerOrderItemIds(sellerId);
    if (itemIds.length === 0) return null;
    return { kind: 'orderItem', ids: itemIds, category: type };
  }

  const [productIds, itemIds] = await Promise.all([
    getSellerProductIds(sellerId),
    getSellerOrderItemIds(sellerId),
  ]);
  if (productIds.length === 0 && itemIds.length === 0) return null;

  return { kind: 'mixed', productIds, itemIds };
}

function buildQueryFromScope(scope: InquiryScope, extra?: { keyword?: string }) {
  const base = supabaseAdmin.from('inquiries').select(SELECT, { count: 'exact' });

  let scoped;
  if (scope.kind === 'product') {
    scoped = base.in('product_id', scope.ids);
  } else if (scope.kind === 'orderItem') {
    scoped = base.in('order_item_id', scope.ids).eq('category', scope.category);
  } else {
    const orParts: string[] = [];
    if (scope.productIds.length > 0) orParts.push(`product_id.in.(${scope.productIds.join(',')})`);
    if (scope.itemIds.length > 0) {
      orParts.push(
        `and(order_item_id.in.(${scope.itemIds.join(',')}),category.in.(배송문의,주문문의))`
      );
    }
    scoped = base.or(orParts.join(','));
  }

  if (extra?.keyword) scoped = scoped.ilike('title', `%${extra.keyword}%`);
  return scoped.order('created_at', { ascending: false });
}

export async function getSellerInquiries(
  sellerId: number,
  options: {
    type?: SellerInquiryType;
    answered?: 'true' | 'false';
    keyword?: string;
    page: number;
    limit: number;
  }
) {
  const { type, answered, keyword, page, limit } = options;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const scope = await resolveInquiryScope(sellerId, type);
  if (!scope) return { inquiries: [], total: 0 };

  const query = buildQueryFromScope(scope, { keyword });

  if (answered !== undefined) {
    const { data, error } = await query;
    if (error) throw error;

    const rows = ((data ?? []) as unknown as InquiryRow[]).map(mapRow);
    const authorMap = await attachAuthorNames(rows);
    const withAuthor = rows.map((r) => ({
      ...r,
      author: authorMap.get(r.userId) ?? '(알 수 없음)',
    }));

    const filtered =
      answered === 'true'
        ? withAuthor.filter((r) => r.isAnswered)
        : withAuthor.filter((r) => !r.isAnswered);

    return { inquiries: filtered.slice(from, to + 1), total: filtered.length };
  }

  const { data, error, count } = await query.range(from, to);
  if (error) throw error;

  const rows = ((data ?? []) as unknown as InquiryRow[]).map(mapRow);
  const authorMap = await attachAuthorNames(rows);
  const inquiries = rows.map((r) => ({ ...r, author: authorMap.get(r.userId) ?? '(알 수 없음)' }));

  return { inquiries, total: count ?? 0 };
}

export async function getSellerInquiryStats(sellerId: number) {
  const scope = await resolveInquiryScope(sellerId, undefined);
  if (!scope) return { totalCount: 0, waitingCount: 0, answeredCount: 0 };

  const query = buildQueryFromScope(scope);
  const { data, error } = await query;
  if (error) throw error;

  type Row = { inquiry_id: number; inquiry_replies: ReplyRow[] | ReplyRow | null };
  const rows = (data ?? []) as unknown as Row[];

  const answeredCount = rows.filter((r) => normalizeReply(r.inquiry_replies) != null).length;

  return {
    totalCount: rows.length,
    waitingCount: rows.length - answeredCount,
    answeredCount,
  };
}
