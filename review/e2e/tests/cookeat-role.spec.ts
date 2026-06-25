import { test, Page } from "@playwright/test";
import fs from "node:fs";

// 리뷰 전용 역할별 E2E (2026-06-25) — user / seller / admin
// DB의 users.role 을 외부(service_role)에서 바꿔가며 같은 스펙을 3번 실행한다.
// ROLE 환경변수로 캡처 파일 접미사를 구분(user/seller/admin). 로그인 토큰에 role 이 실리므로 매번 재로그인.

const DATE = "2026-06-25";
const IMG = `../images/${DATE}`;
const ROLE = process.env.ROLE ?? "user";
const EMAIL = "cookeat-review@example.com";
const PASSWORD = "Review!2026";

test.beforeAll(() => fs.mkdirSync(IMG, { recursive: true }));

async function login(page: Page) {
  await page.goto("/login", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1200);
  try {
    await page.locator('input[type="email"]').first().fill(EMAIL);
    await page.locator('input[type="password"]').first().fill(PASSWORD);
    await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(2500);
  } catch (e) {
    console.log("[login] 폼 입력 실패:", String(e).slice(0, 80));
  }
}

test(`[${process.env.ROLE}] 로그인 + 역할별 접근`, async ({ page }) => {
  await login(page);
  console.log(`[${ROLE}] 로그인 후 URL:`, page.url());
  await page.screenshot({ path: `${IMG}/cookeat-${ROLE}-after-login.png` });

  // 사용자 동선
  await page.goto("/shopping", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${IMG}/cookeat-${ROLE}-shopping.png` });

  // 판매자 영역 접근
  await page.goto("/seller", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2000);
  console.log(`[${ROLE}] /seller → 최종 URL:`, page.url());
  await page.screenshot({ path: `${IMG}/cookeat-${ROLE}-seller.png` });

  // 관리자 영역 접근
  await page.goto("/admin", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2000);
  console.log(`[${ROLE}] /admin → 최종 URL:`, page.url());
  await page.screenshot({ path: `${IMG}/cookeat-${ROLE}-admin.png` });

  // admin 일 때 회원관리도 캡처
  if (ROLE === "admin") {
    await page.goto("/admin/members", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(2000);
    console.log(`[admin] /admin/members → URL:`, page.url());
    await page.screenshot({ path: `${IMG}/cookeat-admin-members.png` });
  }
});
