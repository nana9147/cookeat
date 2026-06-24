# Seller 페이지 코드 리뷰 TODO

> 분석 기준: `app/seller/**` + 연관 API 라우트, lib, store

---

## P1 — 즉시 수정 (Critical / High)

### 보안

- [ ] **Admin sellerId 접근 제한** — `lib/sellerContext.ts`
  - 문제: admin이 `?sellerId=` 쿼리 파라미터만으로 다른 셀러의 모든 데이터(상품·주소·템플릿)에 접근 가능
  - 수정: admin 대리 조회용 API를 `/admin/sellers/[sellerId]/...` 로 분리하거나, 일반 seller는 sellerId 파라미터를 무시하도록 `requireSellerContext` 내부 강제

- [ ] **숫자 입력 범위 검증 추가** — `app/api/seller/products/route.ts`, `app/api/seller/shipping/templates/route.ts`
  - 문제: `price`, `stock` 에 음수·비정상값 검증 없음
  - 수정: `if (isNaN(price) || price < 0 || price > 999_999_999)` 범위 체크 추가

### 코딩 통일성

- [ ] **API 응답 형식 표준화** — `app/api/seller/**`
  - 문제: `{ success: true, data: {...} }` / `{ success: true }` / `{ error: '...' }` 세 가지 형식 혼재
  - `app/api/seller/me/route.ts` 에러 응답에 `success` 필드 누락
  - 수정: 모든 라우트에서 `{ success: boolean, data?: T, error?: string }` 형식 통일

---

## P2 — 이번 주 내 (High / Medium)

### 에러 처리 통일

- [ ] **에러 핸들링 방식 통일** — `app/seller/**` 전체 클라이언트 컴포넌트
  - 현재 혼재하는 3가지 패턴:
    1. `catch (e) { console.error(e); }` — 사용자 피드백 없음 (`app/seller/products/page.tsx:39`)
    2. `.then().catch(e => toast.error(...))` — (`app/seller/components/Template/TemplateList.tsx:55`)
    3. `try/catch + toast.error(e instanceof Error ? e.message : '...')` ← 올바른 패턴
  - 수정: 3번 패턴으로 전체 통일

- [ ] **에러 응답 상태 코드 결정 로직 공통화** — `app/api/seller/products/[productId]/route.ts:25-31`
  - 문제: 에러 메시지 문자열 비교로 상태 코드를 결정하는 코드가 여러 라우트에 반복
  - 수정: `lib/errors/apiError.ts` 에 `ApiError`, `NotFoundError`, `ForbiddenError` 클래스 도입
    ```ts
    class NotFoundError extends ApiError {
      constructor(resource: string) { super(`${resource}을 찾을 수 없습니다.`, 404); }
    }
    // catch: status = err instanceof ApiError ? err.statusCode : 500
    ```

### 리팩토링

- [ ] **`useApi` 커스텀 훅 추출** — `hooks/useApi.ts` (신규 생성)
  - 문제: `cancelled` 플래그 + try/catch + setLoading 패턴이 20+ 곳 중복
    - `app/seller/products/page.tsx`, `app/seller/info/page.tsx`, `app/seller/shipping/page.tsx` 등
  - 수정: `hooks/useApi.ts` 로 추상화

- [ ] **API 응답 타입 정의 집중화** — `types/api/seller/` (신규)
  - 문제: 응답 타입이 각 페이지에 중복 정의되거나 미정의, `as unknown as { name: string }` 캐스팅 산재
    - `app/api/seller/shipping/orders/db.ts:67,71`
  - 수정: `types/api/seller/products.ts`, `orders.ts` 등으로 집중 관리 후 `api.get<ProductsResponse>(...)` 형태 사용

- [ ] **오타 수정** — `app/seller/products/page.tsx:27`
  - `isLodding` → `isLoading`

---

## P3 — 다음 주 (Medium / Low)

### 상수 정리

- [ ] **주문 상태 상수 파일** — `lib/constants/orderStatus.ts` (신규)
  - 문제: `'주문확인'`, `'배송준비'`, `'배송중'` 등 문자열이 `app/seller/orders/page.tsx`, `app/seller/shipping/page.tsx` 양쪽에 반복
  - 수정: 단일 소스 파일에서 import

- [ ] **라우트 / API 경로 상수화** — `lib/routes/sellerRoutes.ts` (신규)
  - 문제: `'/seller/products'`, `'/seller/orders'` 등 경로 문자열이 컴포넌트 전반에 하드코딩
  - 수정: `SELLER_ROUTES`, `SELLER_API` 상수 객체로 관리

### 컴포넌트 분리

- [ ] **TemplateList 분리** — `app/seller/components/Template/TemplateList.tsx`
  - 문제: 배송 템플릿 + 반품정책 로직 혼재 (150+ 줄)
  - 수정: `ShippingTemplateList.tsx` / `ReturnPolicyList.tsx` 로 분리

- [ ] **주문 페이지 분리** — `app/seller/orders/page.tsx`
  - 문제: 필터·검색·페이지네이션 로직이 한 파일에 200+ 줄
  - 수정: `hooks/useOrderFiltering.ts` 훅 분리

### 브라우저 API 정리

- [ ] **`window.location.reload()` 제거** — `app/seller/components/ProductTable.tsx:36`
  - 수정: `router.refresh()` 로 교체

- [ ] **`alert()` 제거** — `app/seller/components/Template/ShippingTemplateForm.tsx:112-134`
  - 수정: shadcn `<Dialog>` 컴포넌트로 교체

### Mock 데이터 → 실제 API 연동

- [ ] **대시보드 Mock 데이터 제거** — `app/seller/page.tsx`
  - stateCards, latestOrders, settlementInfo 하드코딩 → Server Component에서 fetch 후 props 전달

- [ ] **리뷰 페이지 Mock 데이터 제거** — `app/seller/reviews/page.tsx`
  - MOCK_SUMMARY, MOCK_REVIEWS → API 연동

### 로딩 상태

- [ ] **로딩 fallback UI 추가** — `app/seller/shipping/page.tsx`
  - 문제: 로딩 중 fallback UI 없음

---

## 잘 되어 있는 부분 (유지)

- `requireSellerContext` / `requireSeller` 가 모든 API 라우트에 적용되어 있음
- `supabaseAdmin` 이 클라이언트 컴포넌트에서 import되지 않음
- `cancelled` 플래그를 이용한 비동기 cleanup — 주요 페이지에서 구현됨
- 컴포넌트 파일 단위 분리 구조 양호
