import { test } from "@playwright/test";
import fs from "node:fs";

// Cookeat 16차 delta E2E (2026-07-01) — 신규/변경 화면 스모크 캡처
// 원칙: networkidle 금지(Supabase realtime). domcontentloaded + 고정 대기 + 캡처 우선.
const DATE = "2026-07-01";
const IMG = `../images/${DATE}`;
const EMAIL = "cookeat-review@example.com";
const PASSWORD = "Review!2026";

test.beforeAll(() => fs.mkdirSync(IMG, { recursive: true }));

async function snap(page: any, name: string) {
  await page.waitForTimeout(1800);
  await page.screenshot({ path: `${IMG}/Cookeat-${name}.png`, fullPage: false });
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
    await page.waitForTimeout(2800);
  }
}

test("D1: 로그인 후 홈", async ({ page }) => {
  await login(page);
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await snap(page, "D1-home");
  console.log("[home] url:", page.url());
});

test("D2: 결제 화면(포인트·쿠폰 할인 섹션)", async ({ page }) => {
  await login(page);
  await page.goto("/cart/checkout", { waitUntil: "domcontentloaded" });
  await snap(page, "D2-checkout-discount");
  console.log("[checkout] url:", page.url());
});

test("D3: 판매자 대시보드", async ({ page }) => {
  await login(page);
  const r = await page.goto("/seller", { waitUntil: "domcontentloaded" });
  await snap(page, "D3-seller-dashboard");
  console.log("[seller dashboard] HTTP", r?.status(), "url:", page.url());
});

test("D4: 판매자 정산", async ({ page }) => {
  await login(page);
  const r = await page.goto("/seller/settlements", { waitUntil: "domcontentloaded" });
  await snap(page, "D4-seller-settlements");
  console.log("[settlements] HTTP", r?.status(), "url:", page.url());
});

test("D5: 판매자 리뷰관리", async ({ page }) => {
  await login(page);
  const r = await page.goto("/seller/reviews", { waitUntil: "domcontentloaded" });
  await snap(page, "D5-seller-reviews");
  console.log("[seller reviews] HTTP", r?.status(), "url:", page.url());
});
