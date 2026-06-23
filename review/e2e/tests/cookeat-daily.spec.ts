import { test } from "@playwright/test";
import fs from "node:fs";

// Cookeat 데일리 E2E (2026-06-23) — 공개 사용자 동선 스모크 + 상품상세 404 회귀 확인
// 원칙: networkidle 금지(Supabase realtime). domcontentloaded + 고정 대기 + 캡처 우선.
const DATE = "2026-06-23";
const IMG = `../images/${DATE}`;

test.beforeAll(() => fs.mkdirSync(IMG, { recursive: true }));

async function snap(page: any, name: string) {
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${IMG}/cookeat-${name}.png`, fullPage: false });
}

test("사용자 동선: 메인→상품목록→상품상세→레시피", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await snap(page, "01-main");

  await page.goto("/shopping", { waitUntil: "domcontentloaded" });
  await snap(page, "02-shopping-list");

  // 상품 상세 — 지난 [필수]였던 전체 404가 고쳐졌는지 회귀
  const resp = await page.goto("/shopping/4", { waitUntil: "domcontentloaded" });
  console.log(`[상품상세 /shopping/4] HTTP ${resp?.status()}`);
  await snap(page, "03-shopping-detail");

  await page.goto("/recipes", { waitUntil: "domcontentloaded" });
  await snap(page, "04-recipes");
});
