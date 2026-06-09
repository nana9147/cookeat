import { test } from "@playwright/test";

// 2차 리뷰(2026-06-09) — 신규 화면 캡처(셀러 상품 등록폼, 어드민, 장바구니).
const SHOT = "../images";

test("셀러 상품 등록 폼", async ({ page }) => {
  await page.goto("/seller/products/new");
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${SHOT}/2nd-01-seller-product-form.png`, fullPage: true });
});

test("어드민 리뷰 관리", async ({ page }) => {
  await page.goto("/admin/reviews");
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${SHOT}/2nd-02-admin-reviews.png`, fullPage: true });
});

test("장바구니", async ({ page }) => {
  await page.goto("/cart");
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${SHOT}/2nd-03-cart.png`, fullPage: true });
});
