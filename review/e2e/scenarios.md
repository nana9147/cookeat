# Cookeat E2E 시나리오 (살아있는 표)

데일리 리뷰 E2E의 시나리오 모음. 실제 사용자처럼 둘러보며 회귀를 잡는다.
스펙: `tests/cookeat-daily.spec.ts` · 캡처: `../images/<날짜>/cookeat-<ID>.png`

> 실행: `cd review/e2e && REVIEW_TEST_PASSWORD='...' npx playwright test tests/cookeat-daily.spec.ts --reporter=line`

| ID | 시나리오 | 단계 → 기대 | 최근결과 (2026-06-16) |
|----|----------|-------------|------------------------|
| C1 | 메인 (desktop+mobile) | `/` 접속 → 메인 페이지 렌더 | pass(200) · 단, 메인은 Header+Footer뿐, 본문(랜딩) 콘텐츠 없음 |
| C2 | 재료 쇼핑(마켓) 목록 | `/shopping` → 상품 그리드/필터/정렬/페이지네이션 | pass(200) · 34개 상품, 배지/평점/판매자 노출. 단 상품 이미지 전부 placeholder(mock) |
| C2b | 카테고리 필터 | 카테고리 버튼 클릭 → 목록 갱신 | pass · URL 그대로(클라이언트 상태 필터) |
| C3 | 장바구니 | `/cart` → 담긴 상품/수량/합계/주문하기 | pass(200) · 비로그인인데도 mock 담긴 상품 표시(정적 데이터) |
| C4 | 로그인(이메일) | `/login` 입력→제출 → 세션 생성 후 이동 | pass · `/login` → `/` 리다이렉트, 실제 Supabase 세션 생성됨 |
| C5 | 로그인 후 마이페이지 | `/mypage`, `/mypage/profile` | pass(200) · 계정정보(cookeat-review, 2,000P) 정상, 주문내역 비어있음 |
| C6 | 인가 가드 (/seller, /admin) | 비로그인/일반회원 접근 차단 기대 | **부분실패** — 아래 상세 |
| C6-admin | `/admin` 가드 | 비로그인→`/admin/login`, 일반회원→`/` | pass · 비로그인·일반회원 모두 진입 차단됨 |
| C6-seller | `/seller/*` 가드 | 비로그인/일반회원 접근 차단 기대 | **fail** — 비로그인으로도 `/seller/products/new` 전체 폼이 열림(가드 없음) |

## 발견 (2026-06-16)

- **[필수] `/seller/*` 인가 가드 부재 (3차 리뷰부터 미해결).**
  비로그인 상태로 `/seller/products/new` 접속 시 상품 등록 폼 전체가 그대로 렌더된다.
  화면 좌하단에 `당근나라 / carrot@naver.com` 이라는 고정/목 판매자 세션이 표시됨.
  `/admin`은 비로그인→`/admin/login`, 일반회원→`/`로 막히는데 `/seller`만 무방비.
  → admin과 동일하게 layout/middleware 레벨 가드 필요.
- **[제안] 메인 페이지(`/`) 본문 비어있음.** `app/(main)/page.tsx`가 `<main className="flex-1" />`만 반환.
  Header/Footer 외 랜딩 콘텐츠가 없어 첫 화면이 허전하다.
- **[제안] 마켓/장바구니가 아직 mock 데이터.** `/shopping`은 `mockProducts`, `/cart`는 정적 담긴 목록.
  Supabase 상품/장바구니 연동 전 단계로 보임. 상품 이미지도 전부 placeholder.
- **[사소] 콘솔 경고.** `/seller` 진입 시 tiptap `Duplicate extension names found: ['underline']` 경고.
  (starter-kit과 별도 underline 확장 중복 등록 추정)
- **잘 됨:** 이메일 로그인→실제 Supabase 세션, 마이페이지 계정정보, 쇼핑 필터/정렬/페이지네이션, 장바구니 합계 계산, /admin 가드.
