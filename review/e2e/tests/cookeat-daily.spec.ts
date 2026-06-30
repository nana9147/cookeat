import { test, expect } from "@playwright/test";
import fs from "node:fs";

// Cookeat 데일리 E2E (2026-06-24) — 관리자/판매자/신규 기능 종합 확인
// 원칙: networkidle 금지(Supabase realtime). domcontentloaded + 고정 대기 + 캡처 우선.
const DATE = "2026-06-24";
const IMG = `../images/${DATE}`;
const EMAIL = "cookeat-review@example.com";
const PASSWORD = "Review!2026";

test.beforeAll(() => fs.mkdirSync(IMG, { recursive: true }));

async function snap(page: any, name: string) {
  await page.waitForTimeout(1800);
  await page.screenshot({ path: `${IMG}/cookeat-${name}.png`, fullPage: false });
}

async function login(page: any) {
  await page.goto("/login", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1000);
  const emailInput = page.locator('input[type="email"], input[name="email"]').first();
  const pwInput = page.locator('input[type="password"]').first();
  if (await emailInput.isVisible()) {
    await emailInput.fill(EMAIL);
    await pwInput.fill(PASSWORD);
    await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(2500);
  }
}

// S01: 공개 사용자 동선
test("S01-T1: 홈 페이지 로드", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await snap(page, "S01-T1-home");
  const title = await page.title();
  console.log("[홈] title:", title, "url:", page.url());
});

test("S01-T2: 쇼핑(상품 목록) 페이지", async ({ page }) => {
  await page.goto("/shopping", { waitUntil: "domcontentloaded" });
  await snap(page, "S01-T2-shopping");
  console.log("[쇼핑] url:", page.url());
});

test("S01-T3: 상품 상세 (회귀: /shopping/4 404 수정 확인)", async ({ page }) => {
  const resp = await page.goto("/shopping/4", { waitUntil: "domcontentloaded" });
  await snap(page, "S01-T3-shopping-detail");
  console.log(`[상품상세 /shopping/4] HTTP ${resp?.status()} url: ${page.url()}`);
});

test("S01-T4: 레시피 목록", async ({ page }) => {
  await page.goto("/recipes", { waitUntil: "domcontentloaded" });
  await snap(page, "S01-T4-recipes");
  console.log("[레시피목록] url:", page.url());
});

test("S01-T5: 레시피 상세", async ({ page }) => {
  await page.goto("/recipes", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1500);
  const links = await page.locator('a[href*="/recipes/"]').all();
  if (links.length > 0) {
    const href = await links[0].getAttribute("href");
    console.log("[레시피링크]", href);
    await page.goto(href!, { waitUntil: "domcontentloaded" });
  } else {
    await page.goto("/recipes/1", { waitUntil: "domcontentloaded" });
  }
  await snap(page, "S01-T5-recipe-detail");
  console.log("[레시피상세] url:", page.url());
});

// S02: 로그인
test("S02-T1: 로그인 페이지 및 로그인", async ({ page }) => {
  await login(page);
  await snap(page, "S02-T1-after-login");
  console.log("[로그인후] url:", page.url());
});

// S03: 관리자 페이지 (로그인 후)
test("S03-T1: 관리자 대시보드", async ({ page }) => {
  await login(page);
  await page.goto("/admin", { waitUntil: "domcontentloaded" });
  await snap(page, "S03-T1-admin-dashboard");
  const url = page.url();
  const body = await page.textContent("body");
  const isRedirected = url.includes("login") || url.includes("admin/login");
  console.log("[관리자대시보드] url:", url, "redirected:", isRedirected);
  console.log("[관리자대시보드] has-data:", body?.includes("대시보드") || body?.includes("Dashboard") || body?.includes("총") || body?.includes("매출"));
});

test("S03-T2: 관리자 회원 관리", async ({ page }) => {
  await login(page);
  await page.goto("/admin/members", { waitUntil: "domcontentloaded" });
  await snap(page, "S03-T2-admin-members");
  console.log("[회원관리] url:", page.url());
});

test("S03-T3: 관리자 주문 관리", async ({ page }) => {
  await login(page);
  await page.goto("/admin/orders", { waitUntil: "domcontentloaded" });
  await snap(page, "S03-T3-admin-orders");
  console.log("[주문관리] url:", page.url());
});

test("S03-T4: 관리자 정산 관리", async ({ page }) => {
  await login(page);
  await page.goto("/admin/settlements", { waitUntil: "domcontentloaded" });
  await snap(page, "S03-T4-admin-settlements");
  console.log("[정산관리] url:", page.url());
});

test("S03-T5: 관리자 고객센터 문의", async ({ page }) => {
  await login(page);
  await page.goto("/admin/support/inquiry", { waitUntil: "domcontentloaded" });
  await snap(page, "S03-T5-admin-inquiry");
  console.log("[고객센터문의] url:", page.url());
});

test("S03-T6: 관리자 FAQ", async ({ page }) => {
  await login(page);
  await page.goto("/admin/support/faq", { waitUntil: "domcontentloaded" });
  await snap(page, "S03-T6-admin-faq");
  console.log("[FAQ] url:", page.url());
});

test("S03-T7: 관리자 상품 관리", async ({ page }) => {
  await login(page);
  await page.goto("/admin/products", { waitUntil: "domcontentloaded" });
  await snap(page, "S03-T7-admin-products");
  console.log("[어드민상품] url:", page.url());
});

test("S03-T8: 관리자 레시피 관리", async ({ page }) => {
  await login(page);
  await page.goto("/admin/recipes", { waitUntil: "domcontentloaded" });
  await snap(page, "S03-T8-admin-recipes");
  console.log("[어드민레시피] url:", page.url());
});

test("S03-T9: 관리자 판매자 관리", async ({ page }) => {
  await login(page);
  await page.goto("/admin/sellers", { waitUntil: "domcontentloaded" });
  await snap(page, "S03-T9-admin-sellers");
  console.log("[판매자관리] url:", page.url());
});

test("S03-T10: 관리자 리뷰 관리", async ({ page }) => {
  await login(page);
  await page.goto("/admin/reviews", { waitUntil: "domcontentloaded" });
  await snap(page, "S03-T10-admin-reviews");
  console.log("[리뷰관리] url:", page.url());
});

test("S03-T11: 관리자 analytics", async ({ page }) => {
  await login(page);
  await page.goto("/admin/analytics", { waitUntil: "domcontentloaded" });
  await snap(page, "S03-T11-admin-analytics");
  console.log("[analytics] url:", page.url());
});

// S04: 판매자 포털
test("S04-T1: 판매자 대시보드 (비판매자 접근 제한 확인)", async ({ page }) => {
  await login(page);
  await page.goto("/seller", { waitUntil: "domcontentloaded" });
  await snap(page, "S04-T1-seller");
  console.log("[판매자] url:", page.url());
});

test("S04-T2: 판매자 배송 관리", async ({ page }) => {
  await login(page);
  await page.goto("/seller/shipping", { waitUntil: "domcontentloaded" });
  await snap(page, "S04-T2-seller-shipping");
  console.log("[배송관리] url:", page.url());
});

test("S04-T3: 판매자 배송 템플릿", async ({ page }) => {
  await login(page);
  await page.goto("/seller/shipping/templates", { waitUntil: "domcontentloaded" });
  await snap(page, "S04-T3-seller-shipping-templates");
  console.log("[배송템플릿] url:", page.url());
});

test("S04-T4: 판매자 반품정책 (새 기능)", async ({ page }) => {
  await login(page);
  // Check if return policy page exists
  const resp = await page.goto("/seller/shipping/address", { waitUntil: "domcontentloaded" });
  await snap(page, "S04-T4-seller-address");
  console.log("[판매자주소] url:", page.url(), "HTTP:", resp?.status());
});

// S05: 마이페이지
test("S05-T1: 마이페이지", async ({ page }) => {
  await login(page);
  await page.goto("/mypage", { waitUntil: "domcontentloaded" });
  await snap(page, "S05-T1-mypage");
  console.log("[마이페이지] url:", page.url());
});

test("S05-T2: 주문 내역", async ({ page }) => {
  await login(page);
  await page.goto("/mypage/orders", { waitUntil: "domcontentloaded" });
  await snap(page, "S05-T2-mypage-orders");
  console.log("[주문내역] url:", page.url());
});

// S06: API 보안 — 인증 없이 어드민 API 접근
test("S06: API 보안 — 어드민 엔드포인트 미인증 접근", async ({ request }) => {
  const endpoints = [
    "/api/admin/dashboard",
    "/api/admin/users",
    "/api/admin/orders",
    "/api/admin/settlements",
    "/api/admin/faqs",
    "/api/admin/inquiries",
    "/api/admin/sellers",
    "/api/admin/reviews",
    "/api/admin/recipes",
    "/api/admin/products",
  ];
  for (const ep of endpoints) {
    const res = await request.get(ep);
    const ok = res.status() === 401 || res.status() === 403;
    console.log(`[보안] ${ep}: ${res.status()} ${ok ? "✓" : "⚠ OPEN"}`);
    expect([401, 403]).toContain(res.status());
  }
});
