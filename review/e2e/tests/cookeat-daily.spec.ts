import { test, expect, type Page } from "@playwright/test";
import fs from "node:fs";

// Cookeat 데일리 E2E (2026-07-06, 19차) — 레시피 작성/수정 신규 페이지 + 판매 통계 신규 + 취소/환불 분리
const DATE = "2026-07-06";
const IMG = `../images/${DATE}`;
const EMAIL = "cookeat-review@example.com";
const PASSWORD = "Review!2026";

test.beforeAll(() => fs.mkdirSync(IMG, { recursive: true }));

async function snap(page: Page, name: string) {
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${IMG}/cookeat-${name}.png`, fullPage: false });
}

async function login(page: Page) {
  await page.goto("/login", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1000);
  const emailInput = page.locator('input[type="email"], input[name="email"]').first();
  const pwInput = page.locator('input[type="password"]').first();
  if (await emailInput.isVisible().catch(() => false)) {
    await emailInput.fill(EMAIL);
    await pwInput.fill(PASSWORD);
    await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(3000);
  }
}

test("S01 홈", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await snap(page, "s01-home");
  console.log("[홈] title:", await page.title());
});

test("S02 레시피 목록", async ({ page }) => {
  await page.goto("/recipes", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1800);
  await snap(page, "s02-recipes");
  const cards = page.locator('a[href*="/recipes/"]');
  console.log("[레시피목록] 링크 수:", await cards.count());
});

test("S03 레시피 상세", async ({ page }) => {
  await page.goto("/recipes", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1800);
  const card = page.locator('a[href*="/recipes/"]').first();
  if (await card.isVisible().catch(() => false)) {
    await card.click().catch(() => {});
    await page.waitForTimeout(2000);
  }
  await snap(page, "s03-recipe-detail");
  console.log("[레시피상세] url:", page.url());
});

test("S04 레시피 작성 페이지 (신규) — 비로그인 가드", async ({ page }) => {
  const resp = await page.goto("/recipes/write", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2500);
  await snap(page, "s04-write-guard");
  console.log("[레시피작성 비로그인] HTTP", resp?.status(), "url:", page.url());
});

test("S05 레시피 작성 페이지 (신규) — 로그인 후 폼 렌더", async ({ page }) => {
  await login(page);
  await page.goto("/recipes/write", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2500);
  await snap(page, "s05-write-form");
  const titleInput = page.locator('input, textarea').first();
  console.log("[레시피작성 로그인] url:", page.url(), "입력필드 존재:", await titleInput.count());
});

test("S06 레시피 수정 페이지 (신규) — 타인 레시피 접근 차단", async ({ page }) => {
  await login(page);
  // 목록 첫 레시피의 id를 얻어 수정 페이지 진입 (리뷰 계정은 대체로 작성자가 아님 → 차단 기대)
  await page.goto("/recipes", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1800);
  const href = await page.locator('a[href*="/recipes/"]').first().getAttribute("href").catch(() => null);
  const m = href?.match(/\/recipes\/(\d+)/);
  const id = m ? m[1] : "1";
  page.on("dialog", (d) => d.accept().catch(() => {}));
  await page.goto(`/recipes/${id}/edit`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2500);
  await snap(page, "s06-edit-guard");
  console.log(`[레시피수정 id=${id}] 최종 url:`, page.url());
});

test("S07 판매 통계 페이지 (신규) — 비-판매자 가드", async ({ page }) => {
  await login(page);
  await page.goto("/seller/statistics", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2500);
  await snap(page, "s07-statistics-guard");
  console.log("[판매통계 user롤] 최종 url:", page.url());
});

test("S08 마이페이지 주문내역 — 취소/환불 분리 노출", async ({ page }) => {
  await login(page);
  await page.goto("/mypage/orders", { waitUntil: "domcontentloaded" }).catch(() => {});
  await page.waitForTimeout(2000);
  await snap(page, "s08-mypage-orders");
  console.log("[마이페이지 주문] url:", page.url());
});
