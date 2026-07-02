import { test } from "@playwright/test";
import fs from "node:fs";

// Cookeat 데일리 E2E (2026-07-02, 17차) — 쿠폰 계정지급 전환 + 어드민 쿠폰 관리 + 판매자 상품관리 delta 확인
const DATE = "2026-07-02";
const IMG = `../images/${DATE}`;
const EMAIL = "cookeat-review@example.com";
const PASSWORD = "Review!2026";

test.beforeAll(() => fs.mkdirSync(IMG, { recursive: true }));

async function snap(page: any, name: string) {
  await page.waitForTimeout(1600);
  await page.screenshot({ path: `${IMG}/cookeat-${name}.png`, fullPage: false });
}

async function login(page: any) {
  await page.goto("/login", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1000);
  const emailInput = page.locator('input[type="email"], input[name="email"]').first();
  const pwInput = page.locator('input[type="password"]').first();
  if (await emailInput.isVisible().catch(() => false)) {
    await emailInput.fill(EMAIL);
    await pwInput.fill(PASSWORD);
    await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(2500);
  }
}

test("S01 홈", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await snap(page, "s01-home");
  console.log("[홈] title:", await page.title());
});

test("S02 쇼핑 목록", async ({ page }) => {
  await page.goto("/shopping", { waitUntil: "domcontentloaded" });
  await snap(page, "s02-shopping");
});

test("S03 상품 상세", async ({ page }) => {
  await page.goto("/shopping", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1500);
  const card = page.locator('a[href*="/shopping/"]').first();
  if (await card.isVisible().catch(() => false)) {
    await card.click().catch(() => {});
    await page.waitForTimeout(2000);
  }
  await snap(page, "s03-product-detail");
  console.log("[상품상세] url:", page.url());
});

test("S04 장바구니→결제 쿠폰 모달 (쿠폰 적용 정합성)", async ({ page }) => {
  await login(page);
  await page.goto("/shopping", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1500);
  const card = page.locator('a[href*="/shopping/"]').first();
  if (await card.isVisible().catch(() => false)) {
    await card.click().catch(() => {});
    await page.waitForTimeout(2000);
    const addBtn = page.locator('button:has-text("장바구니"), button:has-text("담기")').first();
    if (await addBtn.isVisible().catch(() => false)) {
      await addBtn.click().catch(() => {});
      await page.waitForTimeout(1200);
    }
  }
  await page.goto("/cart", { waitUntil: "domcontentloaded" }).catch(() => {});
  await page.waitForTimeout(1500);
  await snap(page, "s04a-cart");
  const checkoutBtn = page.locator('button:has-text("결제"), a:has-text("주문"), button:has-text("주문")').first();
  if (await checkoutBtn.isVisible().catch(() => false)) {
    await checkoutBtn.click().catch(() => {});
    await page.waitForTimeout(2000);
  }
  await snap(page, "s04b-checkout");
  const couponBtn = page.locator('button:has-text("쿠폰")').first();
  if (await couponBtn.isVisible().catch(() => false)) {
    await couponBtn.click().catch(() => {});
    await page.waitForTimeout(1500);
    await snap(page, "s04c-coupon-modal");
  }
});

test("S05 어드민 쿠폰 관리 (신규 엔드포인트)", async ({ page }) => {
  await login(page);
  const resp = await page.goto("/admin/coupons", { waitUntil: "domcontentloaded" });
  console.log("[admin/coupons] HTTP", resp?.status(), "url:", page.url());
  await snap(page, "s05-admin-coupons");
});

test("S06 어드민 대시보드", async ({ page }) => {
  await login(page);
  await page.goto("/admin", { waitUntil: "domcontentloaded" }).catch(() => {});
  await snap(page, "s06-admin");
  console.log("[admin] url:", page.url());
});

test("S07 판매자 주문 목록/상세 (orders.coupon_id rename 500 확인)", async ({ page }) => {
  await login(page);
  await page.goto("/seller/orders", { waitUntil: "domcontentloaded" }).catch(() => {});
  await page.waitForTimeout(1800);
  await snap(page, "s07a-seller-orders");
  const row = page.locator('a[href*="/seller/orders/"], button:has-text("상세")').first();
  if (await row.isVisible().catch(() => false)) {
    await row.click().catch(() => {});
    await page.waitForTimeout(2000);
  }
  await snap(page, "s07b-seller-order-detail");
  console.log("[seller order detail] url:", page.url());
});

test("S08 판매자 상품관리 (엑셀/정렬/재고알림 신규)", async ({ page }) => {
  await login(page);
  await page.goto("/seller/products", { waitUntil: "domcontentloaded" }).catch(() => {});
  await page.waitForTimeout(1800);
  await snap(page, "s08-seller-products");
  console.log("[seller products] url:", page.url());
});
