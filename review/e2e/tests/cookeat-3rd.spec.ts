import { test, expect } from "@playwright/test";

// 3차 리뷰(2026-06-10) — 인가 게이트 실측 + 신규 화면 캡처.
// 확인 포인트:
//  1) /seller 가드: 비로그인으로 /seller/products/new 가 그대로 열리는가(여전히 무방비인가)
//  2) /admin 게이트: 비로그인으로 /admin 진입 시 /admin/login 으로 리다이렉트되는가
//  3) 신규 어드민 페이지(통계분석/회원관리/공지·문의) 렌더
//  4) 판매자 신청 페이지(/mypage/sellerapply)
const SHOT = "../images";

test("[가드] 비로그인 /seller/products/new — 가드 여부", async ({ page }) => {
  await page.goto("/seller/products/new");
  await page.waitForTimeout(1500);
  const url = page.url();
  await page.screenshot({ path: `${SHOT}/3rd-01-seller-new-noauth.png`, fullPage: true });
  console.log("[seller new] final url =", url);
  // 가드가 생겼다면 로그인으로 보내야 한다. 현재 상태를 단순 기록.
});

test("[가드] 비로그인 /admin — 로그인 리다이렉트 여부", async ({ page }) => {
  await page.goto("/admin");
  await page.waitForTimeout(1500);
  const url = page.url();
  await page.screenshot({ path: `${SHOT}/3rd-02-admin-noauth.png`, fullPage: true });
  console.log("[admin root] final url =", url);
});

test("[가드] 비로그인 /admin/analytics — 로그인 리다이렉트 여부", async ({ page }) => {
  await page.goto("/admin/analytics");
  await page.waitForTimeout(1500);
  const url = page.url();
  await page.screenshot({ path: `${SHOT}/3rd-03-admin-analytics-noauth.png`, fullPage: true });
  console.log("[admin analytics] final url =", url);
});

test("[렌더] 판매자 신청 페이지(/mypage/sellerapply)", async ({ page }) => {
  await page.goto("/mypage/sellerapply");
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${SHOT}/3rd-04-sellerapply.png`, fullPage: true });
  console.log("[sellerapply] final url =", page.url());
});

test("[API] 비로그인 POST /api/seller/apply — 401 인가 확인", async ({ request }) => {
  const res = await request.post("/api/seller/apply", {
    data: { storeName: "x", businessNumber: "000-00-00000", bankName: "국민", bankAccount: "123" },
  });
  console.log("[apply POST no-auth] status =", res.status());
  expect([401, 403]).toContain(res.status());
});
