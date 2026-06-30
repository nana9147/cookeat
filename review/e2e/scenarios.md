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

## 역할 모델 (2026-06-25 확인)

- 역할 3종: `user` / `seller` / `admin` — `users.role`(enum, 기본 `user`). API 가드 `lib/serverAuth.ts`의 `requireAuth`/`requireSeller`(seller·admin 통과)/`requireAdmin`.
- 라우트 보호는 **클라이언트 가드**(`SellerAuthGuard`·`AdminAuthGuard`)뿐 — 화면 진입만 막고 데이터는 API의 `requireSeller/requireAdmin`이 지킨다. (`/seller`는 클라 가드도 빠져 무방비 — C6-seller)
- **[필수·핵심] 승격 경로 끊김**: 판매자 신청(`POST /api/seller/apply` → `sellers.approve_status=pending`)·관리자 승인(`PATCH /api/admin/sellers/[id]/approve`)이 `sellers.approve_status`·`users.status`만 바꾸고 **`users.role`은 절대 바꾸지 않는다**(코드 전역에서 `users.role` write 0건). 즉 **승인돼도 role은 `user`로 남아 `requireSeller`가 403** → 판매자 API 전부 막힐 가능성. E2E S0에서 실측 필수.
- 역할 계정 시드: service-role로 user/seller/admin 3계정 생성 후, **seller·admin은 DB에서 `users.role`을 직접 `'seller'`/`'admin'`으로 PATCH**해야 시나리오가 가드/403을 안 만난다.

## 역할별 시나리오 (2026-06-25 재구성 — "쓰는 순서대로")

### [일반회원]
| ID | 시나리오 | 단계 → 기대 |
| -- | -------- | ----------- |
| CU1 | 비로그인 둘러보기 | `/` → `/recipes`·`/recipes/[id]` → `/shopping`·`/shopping/[id]` 열람 |
| CU2 | 회원가입 | `/register`(닉네임 중복확인 `/api/auth/check-nickname`) → `/register/complete`, role=user |
| CU3 | 로그인 | `/login` → 세션·헤더 로그인 상태 |
| CU4 | 장바구니→주문→결제 | `/shopping/[id]` 담기 → `/cart` → `/cart/checkout` → Toss/Kakao → `/cart/complete` |
| CU5 | 마이페이지 주문확인 | `/mypage/orders` → `/mypage/orders/[orderId]` 에 CU4 주문 노출 |
| CU6 | 판매자 신청 | `/mypage/sellerapply` 제출(`POST /api/seller/apply`) → "심사 중", 재신청 시 409 |

### [판매자]  (사전: CU6 신청 → CA5 승인 → **DB role='seller' 세팅**)
| ID | 시나리오 | 단계 → 기대 |
| -- | -------- | ----------- |
| CS0 | 승격 검증(핵심) | role 세팅 후 `/seller` 진입(SellerAuthGuard 통과). **role 미세팅 시 막히는지** 함께 기록 — 승격 끊김 실증 |
| CS1 | 대시보드 | `/seller`(`/api/seller/me`) 매출/주문 요약 |
| CS2 | 상품 등록 | `/seller/products/new` 입력·이미지·배송템플릿 → `POST /api/seller/products` → `/seller/products` 노출 → `/shopping`에도 |
| CS3 | 상품 수정 | `/seller/products/[id]/edit` 가격·재고 변경 |
| CS4 | 주문·배송 (회원→판매자 연결) | `/seller/shipping` 운송장·상태 변경 → `/seller/orders/[id]` → 회원 마이페이지 반영 |
| CS5 | 정산 | `/seller/settlement` → `/seller/settlement/[id]` 수수료 반영 정산액 |

### [관리자]  (사전: **DB role='admin' 세팅**)
| ID | 시나리오 | 단계 → 기대 |
| -- | -------- | ----------- |
| CA1 | 관리자 로그인 | `/admin/login` → `/admin`(AdminAuthGuard). 일반회원은 `/`로 튕김 |
| CA2 | 대시보드 | `/admin`(`/api/admin/dashboard`) 지표 |
| CA3 | 회원관리 | `/admin/members` 정지/해제(`PATCH /api/admin/users/[id]/status`) |
| CA4 | 상품관리 | `/admin/products` 노출/삭제 → `/shopping` 반영 |
| CA5 | 판매자 승인 (회원→관리자 연결) | `/admin/sellers` pending(CU6) 승인 → `approve_status=approved`. **role 안 바뀌므로 CS0과 연결 확인** |
| CA6 | 주문·정산 | `/admin/orders` 상태변경 → `/admin/settlements` 정산 → 판매자 `/seller/settlement` 반영 |
| CA7 | 레시피·리뷰·문의 | `/admin/recipes`·`/admin/reviews`·`/admin/support/inquiry` 관리 행동 |

### 역할 연결(한 흐름)
`CU6(신청) → CA5(승인) → [role 세팅] → CS2(상품등록) → CU4(다른 회원 주문) → CS4(배송) → CA6(주문·정산 확인)`.

## 발견 (2026-06-25) — 역할별 라이브 E2E (user / seller / admin)

리뷰계정(user_id=42)의 `users.role`을 service_role로 user→seller→admin 으로 바꿔가며 3회 실측 후 user 원복. dev 3200. `tests/cookeat-role.spec.ts`(신규). 캡처 `review/images/2026-06-25/cookeat-{role}-*`.

- **[필수][확정] 판매자 접근은 `users.role='seller'`만으론 안 열린다 — `sellers` 행/승인 필요(정적 분석 예측 실측 확정).**
  role=seller로 세팅하고 로그인해도 `/seller` → `/`로 차단. 반면 role=admin 계정은 `/seller`(판매자센터: 판매현황·정산 카드까지) **완전 진입**. 즉 SellerAuthGuard가 admin은 통과시키지만 seller는 추가 조건(`sellers` 테이블 행 = 승인된 판매자)을 요구. 그런데 **승인 라우트(`PATCH /api/admin/sellers/[id]/approve`)는 `users.role`을 안 바꾸므로**, 신청→승인만으로 판매자 권한이 열리는지 끝까지 한 번 실증해야 함(현재 코드 경로상 role 승격이 비어 있음).
- **[필수][신규] role=admin 인데 `/admin` 진입 실패(홈으로 튕김).**
  같은 로그인 세션으로 role=admin이 `/seller`(판매자센터)는 들어가는데, `/admin`·`/admin/members`는 `/`로 리다이렉트. 즉 authStore의 role=admin을 SellerAuthGuard는 인정하는데 AdminAuthGuard는 인정하지 않음(가드 간 불일치). **확인 필요**: 관리자 화면이 `/admin/login` 전용 로그인 경로를 따로 요구하는지, 아니면 AdminAuthGuard 조건 버그인지. 관리자 시연 직결이므로 우선 점검 권장.
- **[칭찬] 일반회원 가드 정상.** role=user 로그인 상태에서 `/seller`·`/admin` 모두 `/`로 차단.
- (참고) 클라이언트 가드(`SellerAuthGuard`/`AdminAuthGuard`)라 `/seller`·`/admin`은 HTTP 200 셸 후 JS 리다이렉트. 데이터는 API의 `requireSeller/requireAdmin`이 별도로 지킴(보안 자체는 API단). 단 06-16 기록한 "비로그인 `/seller/products/new` 폼 노출"은 별도 확인 대상(클라 가드 누락 라우트).
- service_role REST 접근은 정상(kanto·tiki와 달리 grant 살아 있음) → 시드는 가능했음.

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

## 10차 (2026-06-24) — 사용자·관리자·판매자 종합, 신규 배송/FAQ/레시피 기능 확인

스펙 `tests/cookeat-daily.spec.ts` 전면 갱신. 24개 테스트 전부 pass.

| ID | 시나리오 | 대상 | 기대 | 결과 (2026-06-24) |
|----|----------|------|------|--------------------|
| S01-T1 | 홈 페이지 | `/` | 200 렌더 | pass |
| S01-T2 | 쇼핑 목록 | `/shopping` | 200 | pass |
| S01-T3 | 상품 상세 회귀 | `/shopping/4` | 200(9차 [필수] 해결 확인) | **pass — HTTP 200 정상** |
| S01-T4 | 레시피 목록 | `/recipes` | 200 실DB 연동 | pass |
| S01-T5 | 레시피 상세 | `/recipes/new`(링크클릭) | pass — 단, 목록 첫 링크가 /recipes/new로 잡힘(신규작성 경로) |
| S02-T1 | 로그인 | `/login` → 이메일+비번 → `/` | pass |
| S03-T1 | 관리자 대시보드 | `/admin` | 200 + has-data true | pass(admin 승격 상태) |
| S03-T2 | 관리자 회원 | `/admin/members` | 200 | pass |
| S03-T3 | 관리자 주문 | `/admin/orders` | 200 | pass |
| S03-T4 | 관리자 정산 | `/admin/settlements` | 200 | pass |
| S03-T5 | 고객센터 문의 | `/admin/support/inquiry` | 200 실DB 연동 | pass |
| S03-T6 | FAQ 관리 | `/admin/support/faq` | 200 실DB 연동 | pass |
| S03-T7 | 관리자 상품 | `/admin/products` | 200 | pass |
| S03-T8 | 관리자 레시피 | `/admin/recipes` | 200 | pass |
| S03-T9 | 관리자 판매자 | `/admin/sellers` | 200 | pass |
| S03-T10 | 관리자 리뷰 | `/admin/reviews` | 200 | pass |
| S03-T11 | analytics | `/admin/analytics` | 200 | pass |
| S04-T1 | 판매자 대시보드 | `/seller` | 200(admin→seller겸용) | pass |
| S04-T2 | 배송 관리(신규) | `/seller/shipping` | 200 API 연동 | pass |
| S04-T3 | 배송 템플릿(신규) | `/seller/shipping/templates` | 200 | pass |
| S04-T4 | 주소 관리(신규) | `/seller/shipping/address` | 200 | pass |
| S05-T1 | 마이페이지 | `/mypage` | 200 | pass |
| S05-T2 | 주문 내역 | `/mypage/orders` | 200 | pass |
| S06 | 어드민 API 보안 | 10개 엔드포인트 미인증 | 401 all | **pass — 10/10 모두 401** |

발견(10차):
- **[필수·이월] 정산 통계가 여전히 JS 합산**: `admin/settlements/route.ts:48-65`에서 pendingData·completedData·allFeeData를 전체 행 받아 reduce. `aa444ad`(jjong0, 2026-06-19)에서 병렬화만 했고 DB SUM 집계는 미적용. 9차 [필수] 미해결.
- **[필수·이월] 주문 생성 비트랜잭션**: `app/api/order/route.ts`에 restoreStock 보상 코드 여전히 존재(`:26,117,174,192`). RPC 트랜잭션 미적용. 9차 [필수] 미해결.
- **[신규·제안] `admin/inquiries` answered 필터가 DB 페이지네이션 무효화**: `?answered=true/false` 파라미터 시 전체 행 가져와 JS `.filter().slice()`로 페이지 잘라냄(`:34-51`). 문의가 많아지면 페이지 1 이후 데이터 신뢰 불가.
- **[이월·제안] admin keyword `.or()` 미이스케이프**: `admin/products/route.ts:61`, `admin/orders/route.ts:38` 그대로.
- **[해결] 상품 상세 전체 404**: 9차 [필수] — `/shopping/4` HTTP 200 확인.
- **[해결] sellers anon RLS 노출**: 9차 [필수] — `sellers/users/orders/settlements/order_items` 모두 0행(차단).
- **[신규·칭찬] likes/bookmarks 에러 묵살 수정(djsy01 4c96fd8)**: serverRecipes.ts에 likeError·bookmarkError throw 추가.
- **[신규·칭찬] ratingSum 범위 검증(djsy01 90fba12)**: 1-5 범위 외 rating 무시 가드 추가.
- **[신규·칭찬] 멀티셀러 운송장 충돌 수정(nana9147 2d84111)**: shippings UNIQUE(order_id)→UNIQUE(order_id,seller_id) + seller_id 필터.
- **[신규·칭찬] FAQ 실데이터 연동(jjong0 fd8bc28, 1a44af1)**: 에러 핸들링(f0c92a3)도 추가.
- **[신규·칭찬] 레시피 실DB 연동(djsy01 80138ec)**: 목록·상세 Supabase 연동.
- **[신규·칭찬] 배송 처리 API 연동(nana9147 a6c2d35, d2a9b85)**: 상태별 카드 카운트 포함.
- tsc 1건 오류(`.next/types` 자동생성 파일, validator.ts:359 — 학생 코드 아님). build 성공(정적 생성 79개 경로).
- 테스트계정 admin 승격 후 원복(user) 완료.
