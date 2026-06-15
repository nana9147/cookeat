import { test, expect, type Page } from "@playwright/test";
import path from "node:path";

// ── 리뷰 전용 E2E (교육생이 작성한 테스트와 무관) ───────────────────────────
// 백엔드: 조의 실제 Supabase(.env.local). 실제 스키마/데이터에 붙는다.
// 테스트 계정은 service role 로 미리 만들어 둔 확인된 계정을 사용한다.
// (review/e2e/test-account.md 참고) — 실데이터에 쓰기는 최소화한다.

// 비밀번호는 커밋하지 않는다(공개 repo 유출 방지). 실행 시 환경변수로 주입.
// 실제 값은 review/e2e/test-account.md(커밋 제외) 참고.
const TEST_EMAIL = process.env.REVIEW_TEST_EMAIL ?? "cookeat-review@example.com";
const TEST_PASSWORD = process.env.REVIEW_TEST_PASSWORD ?? "";

const IMG = (name: string) => path.join(__dirname, "..", "..", "images", name);

function collectErrors(page: Page, bucket: string[]) {
  page.on("console", (m) => {
    if (m.type() === "error") bucket.push(`[console] ${m.text()}`);
  });
  page.on("pageerror", (e) => bucket.push(`[pageerror] ${e.message}`));
}

test("01 홈 렌더링", async ({ page }) => {
  const errs: string[] = [];
  collectErrors(page, errs);
  await page.goto("/");
  await expect(page.locator("body")).toBeVisible();
  await page.screenshot({ path: IMG("01-home.png"), fullPage: true });
  console.log("01 errors:", errs);
});

test("02 로그인 페이지 렌더링 (소셜 버튼 포함)", async ({ page }) => {
  await page.goto("/login");
  await page.screenshot({ path: IMG("02-login-page.png"), fullPage: true });
});

test("03 이메일 로그인 후 마이페이지", async ({ page }) => {
  const errs: string[] = [];
  collectErrors(page, errs);
  await page.goto("/login");
  await page.getByPlaceholder("이메일을 입력해주세요").fill(TEST_EMAIL);
  await page.getByPlaceholder("비밀번호를 입력해주세요").fill(TEST_PASSWORD);
  await page.getByRole("button", { name: "로그인", exact: true }).click();
  await page.waitForURL("**/", { timeout: 15_000 }).catch(() => {});
  await page.screenshot({ path: IMG("03-after-login.png"), fullPage: true });
  console.log("03 url:", page.url(), "errors:", errs);

  // 같은 탭이라 로그인 상태 유지 → 마이페이지
  await page.goto("/mypage");
  await page.waitForTimeout(1500);
  await page.screenshot({ path: IMG("04-mypage.png"), fullPage: true });
});

test("05 [보안] 로그아웃 상태로 /admin 접근", async ({ page }) => {
  // 새 컨텍스트라 비로그인 상태. 권한 가드가 있으면 로그인으로 튕겨야 정상.
  const res = await page.goto("/admin");
  await page.waitForTimeout(1500);
  await page.screenshot({ path: IMG("05-admin-logged-out.png"), fullPage: true });
  console.log("05 /admin status:", res?.status(), "final url:", page.url());
});

test("06 [보안] 로그아웃 상태로 /seller 접근", async ({ page }) => {
  const res = await page.goto("/seller");
  await page.waitForTimeout(1500);
  await page.screenshot({ path: IMG("06-seller-logged-out.png"), fullPage: true });
  console.log("06 /seller status:", res?.status(), "final url:", page.url());
});
