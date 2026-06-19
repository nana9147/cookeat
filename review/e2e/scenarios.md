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

## 7차 추가 (2026-06-17)
- C6f/g 비로그인 가드: /seller/settlement, /seller/reviews → /login?next= 리다이렉트 (3라운드 끌던 셀러가드 해결 확인). /seller/products/new, /admin도 동일.
- C7a /shopping/[id]: 상품 클릭 → /shopping/1 정상 렌더(서버컴포넌트). C7b /shopping/99999999 → 404(notFound).
- C7c/d /seller/settlement/[id]: 비로그인 가드로 /login 리다이렉트(셀러권한 없어 화면 미확인). settlement/[id]가 params.id 안 읽고 항상 SET-001 — 코드로 확인(settlement/[id]/page.tsx:12-66).
- 메인 로그인후 전체 serial 흐름은 120/180s 타임아웃(하네스 이슈). C1/C2/신규라우트는 별도 테스트로 확보. tsc 0.

## 8차 추가 (2026-06-18) — 사용자→판매자 순서, 테스트계정 임시 seller 승격

| ID | 시나리오 | 대상 | 기대 | 결과 |
|----|----------|------|------|------|
| C7a | 상품 상세(실DB) | `/shopping/8` | 200 실데이터 | pass |
| C7b | 없는 상품 | `/shopping/99999999` | 404 | pass |
| 가드 | 비로그인 /seller·/admin | `/seller/*`,`/admin` | login 리다이렉트 | pass(?next= 보존) |
| C8a | 판매자 정보(신규) | `/seller/info` | 실DB값 표시 | pass(seller 승격 확인) |
| C8c/d | 정산 상세 params | `/seller/settlement/SET-001` vs `/SET-999` | 다른 화면 | **fail — 둘 다 동일(MOCK SET-001, useParams 미사용)** |

발견(8차):
- **[필수·이월] 정산 상세 params 미연결**: settlement/[id]/page.tsx가 MOCK_SETTLEMENT_DETAIL 하드코딩, useParams 안 씀 → 어떤 id든 SET-001. (7차 [필수] 미해결)
- **[해결] proxy.ts:74 주석 정정**(df1f1f2). 셀러 가드 유지(로그인 리다이렉트).
- **[신규] /seller/info + api/seller/me(추유나)**: requireSeller 가드+필드검증, 실DB값 정상(C8a). [제안] PATCH error.message 원문노출.
- **[해결] 쇼핑 mock→실DB(엄인호)**. 토큰갱신 pending Promise 버그 수정(b38d432, 칭찬).
- **[제안·이월] admin keyword .or() 필터 인젝션**(products/route.ts:61).
- **[제안] RLS 무한재귀(42P17)**: anon users/sellers/orders 읽기 시 — 데이터유출X, 7차 [] 차단에서 퇴보. service role로 가려짐.
- tsc 0. (참고) 긴 serial 첫 테스트 하네스 타임아웃 → 신규는 독립 테스트로 확보.
- 환경: 홈 500은 강사 로컬 node_modules에 sonner/next-themes 없어서(학생버그 아님). npm install 복구, npm ci 통과(lock 정상).

## 9차 (2026-06-19) — 사용자→판매자→관리자 여정, 임시 seller/admin 승격, 포트 3301

스펙을 사용자/판매자/관리자/가드 4개 테스트로 재구성. 로그인 settle 4.5s(쿠키·리다이렉트 안정화).

| ID | 시나리오 | 대상 | 기대 | 결과 (2026-06-19) |
|----|----------|------|------|--------------------|
| C1 | 메인(desktop+mobile) | `/` | 렌더 | pass(200) |
| C2 | 마켓 목록(desktop+mobile) | `/shopping` | 그리드/필터 | pass(200) |
| C2c | **상품 상세** | `/shopping/4`(판매중 실상품) | 상세 렌더 | **fail — 404. getProductDetail이 없는 `ingredients` 조인(PGRST200)으로 항상 null** |
| C2d | 없는 상품 | `/shopping/999999` | 404 | pass(404) |
| C4 | 로그인→마이페이지/주문내역 | `/mypage`,`/mypage/orders` | 200 | pass |
| C5 | 장바구니→체크아웃 | `/cart`,`/cart/checkout` | 200 | pass |
| S1~S3 | 판매자 정보/상품/정산목록 | `/seller/*` | 200(seller 승격) | pass |
| S4a/b | **정산 상세 params** | `/seller/settlement/SET-001` vs `/SET-999` | 다른 화면 | **fail — 두 PNG md5 동일(MOCK SET-001). 8차 [필수] 미해결** |
| A1~A6 | 어드민 대시보드/회원/상품/판매자/주문/정산 | `/admin/*` | 200(admin 승격) | pass · 정산 실DB(완료 375만원·수수료 75만원) |
| 가드 | 비로그인 /seller·/admin | `/seller/*`,`/admin/*` | login 리다이렉트 | pass(`?next=` 보존, admin→`/admin/login`) |

발견(9차):
- **[필수·신규] `/shopping/[id]` 상품 상세 전부 404.** `lib/products.ts:13-20`의 select가 존재하지 않는 `ingredients(...)` 관계를 조인 → PGRST200 에러 → `if (error||!product) return null` → 모든 상세 404. 실제 FK는 `category_id`(categories). 사용자 구매 동선이 상세에서 끊김. (d9e917b에서 유입)
- **[필수·이월] 정산 상세 params 미연결.** seller/settlement/[id]/page.tsx 여전히 MOCK_SETTLEMENT_DETAIL 하드코딩, useParams 미사용 → SET-001/SET-999 화면 동일(md5 일치). (7차부터 3회째)
- **[필수·신규/보안] sellers 테이블 anon 노출.** anon 키로 `/rest/v1/sellers` 직접 GET 시 business_number·bank_account·representative_name·cs_phone 2행 유출. users/orders/settlements는 정상 차단([]). 8차 42P17(재귀)에서 정책이 바뀌며 sellers가 열림.
- **[칭찬] 신규 주문/결제 흐름 견고.** `/api/order`가 서버에서 가격 재계산(클라 amount 불신뢰)+CAS 재고 차감/원복+order_items 실패 시 롤백. 어드민 주문/정산 라우트 requireAdmin+상태 화이트리스트+정산 완료 멱등성.
- **[제안·이월] admin keyword .or() 필터 인젝션** — products/route.ts:61 + orders/route.ts:38(이번에 1곳 추가). anon으로 `or=(name.ilike.*,status.eq.숨김)` 직접 호출 시 필터 탈출 실증. admin 게이트라 실해는 낮음.
- tsc 0 · build 통과(둘 다 green). 임시 seller(seller_id=18)·role 승격은 리뷰 후 원복/삭제 완료.
