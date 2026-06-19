import { test, expect, Page } from "@playwright/test";

// Cookeat 데일리 E2E (2026-06-19, 9차) — 실제 사용자/판매자/관리자 흐름 회귀 스위트.
// 원칙:
//  - networkidle 금지(Supabase realtime 때문에 멈춤). domcontentloaded + 고정 대기 사용.
//  - 각 시나리오 끝에 풀페이지 스크린샷. 500이 떠도 캡처부터 하고 console.log로 status 기록.
//  - 판매자/관리자 흐름은 계정 role을 임시 승격한 상태에서만 의미가 있음(리뷰 셋업에서 승격→원복).
const DAY = "2026-06-19";
const SHOT = `../images/${DAY}`;
const EMAIL = process.env.REVIEW_TEST_EMAIL ?? "cookeat-review@example.com";
const PASSWORD = process.env.REVIEW_TEST_PASSWORD ?? "Review!2026";

async function settle(page: Page, ms = 2000) {
  await page.waitForLoadState("domcontentloaded").catch(() => {});
  await page.waitForTimeout(ms);
}

async function gotoAndShoot(page: Page, path: string, id: string, ms = 2000) {
  let status = 0;
  const resp = await page.goto(path, { waitUntil: "commit" }).catch(() => null);
  if (resp) status = resp.status();
  await settle(page, ms);
  await page.screenshot({ path: `${SHOT}/${id}.png`, fullPage: true }).catch(() => {});
  console.log(`[${id}] path=${path} finalUrl=${page.url()} status=${status}`);
  return { status, url: page.url() };
}

async function login(page: Page) {
  await page.goto("/login", { waitUntil: "commit" }).catch(() => {});
  await settle(page, 1500);
  await page.fill('input[type="email"]', EMAIL).catch(() => {});
  await page.fill('input[type="password"]', PASSWORD).catch(() => {});
  await page.getByRole("button", { name: /^로그인$|처리 중/ }).click().catch(() => {});
  await settle(page, 4500);
  console.log(`[login] url=${page.url()}`);
}

test.describe.configure({ mode: "serial" });

// 1) 사용자 여정 (비로그인 → 로그인 → 마켓)
test("Cookeat 9차 — 사용자 여정", async ({ page }) => {
  test.setTimeout(120_000);

  await page.setViewportSize({ width: 1280, height: 900 });
  await gotoAndShoot(page, "/", "cookeat-C1-main-desktop");
  await page.setViewportSize({ width: 390, height: 844 });
  await gotoAndShoot(page, "/", "cookeat-C1-main-mobile");
  await page.setViewportSize({ width: 1280, height: 900 });

  await gotoAndShoot(page, "/shopping", "cookeat-C2-shopping-list");
  await page.setViewportSize({ width: 390, height: 844 });
  await gotoAndShoot(page, "/shopping", "cookeat-C2-shopping-list-mobile");
  await page.setViewportSize({ width: 1280, height: 900 });

  await gotoAndShoot(page, "/shopping/4", "cookeat-C2c-shopping-detail");
  await gotoAndShoot(page, "/shopping/999999", "cookeat-C2d-shopping-detail-404");

  await gotoAndShoot(page, "/cart", "cookeat-C3-cart-guest");

  await login(page);
  await gotoAndShoot(page, "/mypage", "cookeat-C4-mypage");
  await gotoAndShoot(page, "/mypage/orders", "cookeat-C4b-mypage-orders");
  await gotoAndShoot(page, "/cart", "cookeat-C5-cart-loggedin");
  await gotoAndShoot(page, "/cart/checkout", "cookeat-C5b-checkout");
});

// 2) 판매자 여정 + 8차 [필수] 정산상세 버그 실증
test("Cookeat 9차 — 판매자 여정 + 정산상세 버그", async ({ page }) => {
  test.setTimeout(120_000);
  await page.setViewportSize({ width: 1280, height: 900 });

  await login(page);
  await gotoAndShoot(page, "/seller", "cookeat-S0-seller-home");
  await gotoAndShoot(page, "/seller/info", "cookeat-S1-seller-info");
  await gotoAndShoot(page, "/seller/products", "cookeat-S2-seller-products");
  await gotoAndShoot(page, "/seller/settlement", "cookeat-S3-seller-settlement-list");

  // 8차 [필수] — 정산 상세가 id를 안 읽어 SET-001/SET-999가 같은 화면인지
  await gotoAndShoot(page, "/seller/settlement/SET-001", "cookeat-S4a-settlement-SET-001");
  await gotoAndShoot(page, "/seller/settlement/SET-999", "cookeat-S4b-settlement-SET-999");
});

// 3) 관리자 여정
test("Cookeat 9차 — 관리자 여정", async ({ page }) => {
  test.setTimeout(150_000);
  await page.setViewportSize({ width: 1280, height: 900 });

  await login(page);
  await gotoAndShoot(page, "/admin", "cookeat-A1-admin-dashboard");
  await gotoAndShoot(page, "/admin/members", "cookeat-A2-admin-members");
  await gotoAndShoot(page, "/admin/products", "cookeat-A3-admin-products");

  const search = page.locator('input[type="search"], input[type="text"]').first();
  if (await search.count()) {
    await search.fill("고추").catch(() => {});
    await search.press("Enter").catch(() => {});
    await settle(page, 1800);
  }
  await page.screenshot({ path: `${SHOT}/cookeat-A3b-admin-products-search.png`, fullPage: true }).catch(() => {});
  console.log(`[cookeat-A3b] search url=${page.url()}`);

  await gotoAndShoot(page, "/admin/sellers", "cookeat-A4-admin-sellers");
  await gotoAndShoot(page, "/admin/orders", "cookeat-A5-admin-orders");
  await gotoAndShoot(page, "/admin/settlements", "cookeat-A6-admin-settlements");
});

// 4) 비로그인 가드 회귀
test("Cookeat 9차 — 비로그인 가드 회귀", async ({ browser }) => {
  test.setTimeout(90_000);
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.setViewportSize({ width: 1280, height: 900 });

  const guarded: [string, string][] = [
    ["/seller/products/new", "cookeat-G1-seller-new"],
    ["/seller/settlement/SET-001", "cookeat-G2-seller-settlement"],
    ["/admin", "cookeat-G3-admin"],
    ["/admin/orders", "cookeat-G4-admin-orders"],
  ];
  for (const [path, id] of guarded) {
    const r = await gotoAndShoot(page, path, id);
    console.log(`[guard] ${path} -> ${r.url} (redirected=${!r.url.includes(path)})`);
  }
  await ctx.close();
});
