import { test, expect, Page } from "@playwright/test";

// Cookeat 데일리 E2E (2026-06-16) — 실제 사용자처럼 둘러보는 회귀 스위트.
// 원칙:
//  - networkidle 금지(Supabase realtime 때문에 멈춤). domcontentloaded + 고정 대기 사용.
//  - 로그인은 한 번만, 같은 컨텍스트에서 계속 둘러본다.
//  - 각 시나리오 끝에 풀페이지 스크린샷. 500이 떠도 캡처부터 하고 console.log로 status 기록.
const DAY = "2026-06-17";
const SHOT = `../images/${DAY}`;
const EMAIL = process.env.REVIEW_TEST_EMAIL ?? "cookeat-review@example.com";
const PASSWORD = process.env.REVIEW_TEST_PASSWORD ?? "Review!2026";

// realtime 때문에 networkidle 대신 쓰는 안정 대기 헬퍼
async function settle(page: Page, ms = 2000) {
  await page.waitForLoadState("domcontentloaded").catch(() => {});
  await page.waitForTimeout(ms);
}

async function gotoAndShoot(page: Page, path: string, id: string, ms = 2000) {
  let status = 0;
  page.once("response", (r) => {
    if (r.url().includes(path) || r.request().resourceType() === "document") status = r.status();
  });
  const resp = await page.goto(path, { waitUntil: "commit" }).catch(() => null);
  if (resp) status = resp.status();
  await settle(page, ms);
  await page.screenshot({ path: `${SHOT}/${id}.png`, fullPage: true }).catch(() => {});
  console.log(`[${id}] path=${path} finalUrl=${page.url()} status=${status}`);
  return { status, url: page.url() };
}

test.describe.configure({ mode: "serial" });

test("Cookeat 데일리 — 실사용자 흐름", async ({ page }) => {
  test.setTimeout(120_000);

  // ---- C1: 메인 (desktop) ----
  await page.setViewportSize({ width: 1280, height: 900 });
  await gotoAndShoot(page, "/", "cookeat-C1-main-desktop");

  // ---- C1b: 메인 (mobile 390) ----
  await page.setViewportSize({ width: 390, height: 844 });
  await gotoAndShoot(page, "/", "cookeat-C1-main-mobile");
  await page.setViewportSize({ width: 1280, height: 900 });

  // ---- C2: 재료 쇼핑(마켓) 목록 ----
  await gotoAndShoot(page, "/shopping", "cookeat-C2-shopping-list");

  // ---- C2b: 상품 카테고리 필터 클릭 후 ----
  const catBtn = page.getByRole("button", { name: /채소|과일|육류|수산/ }).first();
  if (await catBtn.count()) {
    await catBtn.click().catch(() => {});
    await settle(page, 1200);
  }
  await page.screenshot({ path: `${SHOT}/cookeat-C2b-shopping-filtered.png`, fullPage: true }).catch(() => {});
  console.log(`[cookeat-C2b] filtered url=${page.url()}`);

  // ---- C3: 장바구니 (비로그인 상태) ----
  await gotoAndShoot(page, "/cart", "cookeat-C3-cart");

  // ---- C4: 로그인 (이메일) ----
  await gotoAndShoot(page, "/login", "cookeat-C4a-login-page");
  await page.fill('input[type="email"]', EMAIL).catch(() => {});
  await page.fill('input[type="password"]', PASSWORD).catch(() => {});
  await page.screenshot({ path: `${SHOT}/cookeat-C4b-login-filled.png`, fullPage: true }).catch(() => {});
  await page.getByRole("button", { name: /^로그인$|처리 중/ }).click().catch(() => {});
  await settle(page, 3500);
  await page.screenshot({ path: `${SHOT}/cookeat-C4c-login-after.png`, fullPage: true }).catch(() => {});
  console.log(`[cookeat-C4] after login url=${page.url()}`);

  // ---- C5: 로그인 후 마이페이지(주문/배송) ----
  await gotoAndShoot(page, "/mypage", "cookeat-C5a-mypage");
  await gotoAndShoot(page, "/mypage/profile", "cookeat-C5b-mypage-profile");

  // ---- C6: 가드 — 로그인 사용자도 일반 권한일 때 /seller, /admin 동작 ----
  await gotoAndShoot(page, "/seller", "cookeat-C6a-seller-loggedin");
  await gotoAndShoot(page, "/seller/products/new", "cookeat-C6b-seller-new-loggedin");
  await gotoAndShoot(page, "/admin", "cookeat-C6c-admin-loggedin");
});

// ---- C6 가드(비로그인): 별도 컨텍스트로 깨끗하게 확인 ----
test("비로그인 가드 — /seller, /admin", async ({ browser }) => {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const g1 = await gotoAndShoot(page, "/seller/products/new", "cookeat-C6d-seller-new-noauth");
  const g2 = await gotoAndShoot(page, "/admin", "cookeat-C6e-admin-noauth");
  // 이번 회차 신규 셀러 라우트도 비로그인 가드 확인
  const g3 = await gotoAndShoot(page, "/seller/settlement", "cookeat-C6f-settlement-noauth");
  const g4 = await gotoAndShoot(page, "/seller/reviews", "cookeat-C6g-seller-reviews-noauth");
  console.log(`[guard] seller/new noauth -> ${g1.url}`);
  console.log(`[guard] admin noauth     -> ${g2.url}`);
  console.log(`[guard] settlement noauth-> ${g3.url}`);
  console.log(`[guard] seller/reviews   -> ${g4.url}`);
  await ctx.close();
});

// ---- C7 신규 라우트: 상품 상세(서버 컴포넌트) + 정산 상세 params 확인 ----
test("신규 라우트 — /shopping/[id], /seller/settlement/[id]", async ({ browser }) => {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.setViewportSize({ width: 1280, height: 900 });

  // 상품 목록에서 첫 상품 클릭 → 상세
  await page.goto("/shopping", { waitUntil: "commit" }).catch(() => {});
  await page.waitForTimeout(2500);
  const card = page.locator('a[href*="/shopping/"]').first();
  if (await card.count()) {
    await card.click().catch(() => {});
    await page.waitForTimeout(2500);
    await page.screenshot({ path: `${SHOT}/cookeat-C7a-shopping-detail.png`, fullPage: true }).catch(() => {});
    console.log(`[C7a] shopping detail url=${page.url()}`);
  }
  // 없는 상품 id → notFound 404 기대
  const nf = await page.goto("/shopping/99999999", { waitUntil: "commit" }).catch(() => null);
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${SHOT}/cookeat-C7b-shopping-notfound.png`, fullPage: true }).catch(() => {});
  console.log(`[C7b] /shopping/99999999 status=${nf?.status()}`);

  // 정산 상세: 서로 다른 두 id가 같은 화면인지(params 미사용 버그 실증) — 비로그인이면 가드로 리다이렉트될 수 있음
  const s1 = await page.goto("/seller/settlement/SET-001", { waitUntil: "commit" }).catch(() => null);
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${SHOT}/cookeat-C7c-settlement-SET-001.png`, fullPage: true }).catch(() => {});
  const s2 = await page.goto("/seller/settlement/SET-999", { waitUntil: "commit" }).catch(() => null);
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${SHOT}/cookeat-C7d-settlement-SET-999.png`, fullPage: true }).catch(() => {});
  console.log(`[C7c/d] settlement SET-001 status=${s1?.status()} url=${page.url()} / SET-999 status=${s2?.status()}`);

  await ctx.close();
});
