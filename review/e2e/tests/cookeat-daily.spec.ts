import { test, expect, type Page } from "@playwright/test";
import fs from "node:fs";

// Cookeat 데일리 E2E (2026-07-07, 20차) — 신규 판매자 엔드포인트(대시보드 판매금액/통계/문의관리) + 사용자 여정
const DATE = "2026-07-07";
const IMG = `../images/${DATE}`;
const EMAIL = "cookeat-review@example.com";
const PASSWORD = "Review!2026";

test.beforeAll(() => fs.mkdirSync(IMG, { recursive: true }));

async function snap(page: Page, name: string) {
  await page.waitForTimeout(1200);
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
    await page.waitForTimeout(4000); // 쿠키+세션 정착 (seller 라우트 바운스 방지)
  }
}

// ---------- 사용자 여정 ----------
test("U01 홈", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await snap(page, "u01-home");
  console.log("[홈] title:", await page.title());
});

test("U02 레시피 목록 → 상세", async ({ page }) => {
  await page.goto("/recipes", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1800);
  await snap(page, "u02-recipes");
  const card = page.locator('a[href*="/recipes/"]').first();
  if (await card.isVisible().catch(() => false)) {
    await card.click().catch(() => {});
    await page.waitForTimeout(2000);
  }
  await snap(page, "u03-recipe-detail");
  console.log("[레시피상세] url:", page.url());
});

test("U04 상품 목록 → 상세", async ({ page }) => {
  await page.goto("/shopping", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1800);
  await snap(page, "u04-shopping");
  const card = page.locator('a[href*="/shopping/"]').first();
  if (await card.isVisible().catch(() => false)) {
    await card.click().catch(() => {});
    await page.waitForTimeout(2200);
  }
  await snap(page, "u05-product-detail");
  console.log("[상품상세] url:", page.url());
});

// ---------- 판매자 여정 (신규 엔드포인트) ----------
test("S01 판매자 대시보드 — 비로그인 가드", async ({ page }) => {
  const resp = await page.goto("/seller", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1500);
  await snap(page, "s01-dashboard-guard");
  console.log("[대시보드 비로그인] HTTP", resp?.status(), "url:", page.url());
  expect(page.url()).toContain("/login");
});

test("S02 판매자 대시보드 — 로그인 후 (판매금액 그래프)", async ({ page }) => {
  await login(page);
  await page.goto("/seller", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3000);
  await snap(page, "s02-dashboard");
  console.log("[대시보드 로그인] url:", page.url());
});

test("S03 판매 통계 (신규)", async ({ page }) => {
  await login(page);
  await page.goto("/seller/statistics", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3000);
  await snap(page, "s03-statistics");
  console.log("[통계] url:", page.url());
});

test("S04 셀러 문의관리 (신규)", async ({ page }) => {
  await login(page);
  await page.goto("/seller/inquiries", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3000);
  await snap(page, "s04-inquiries");
  console.log("[문의관리] url:", page.url());
});
