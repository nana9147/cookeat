# 2026-07-03 포털 간 기능 대응 점검 (사용자 ↔ 판매자 ↔ 관리자)

## 점검 배경

사용자/판매자/관리자 세 포털에 걸친 기능들이 실제로 서로 맞물려 동작하는지 전수 점검. 한쪽 포털에만 기능이 구현되고 반대쪽 진입점이 빠진 케이스를 찾기 위한 점검.

**점검 범위**: `app/(main)/**`(사용자), `app/seller/**`(판매자), `app/admin/**`(관리자), `app/api/**` 전체 라우트를 도메인별로 대조. `docs/api/*.md` 명세도 실제 구현과 비교용으로 참고.

---

## 요약 (Gap 우선순위)

| 우선순위 | 도메인                       | 문제                                                                                                                                                            | 상태                                         |
| -------- | ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| 🔴 P1    | 주문 취소/환불               | **배송완료 후 환불 신청 진입점이 사용자 쪽에 없음** — 판매자는 "환불요청" 탭·승인·거부 로직을 다 갖췄는데 그 상태를 만들 수 있는 사용자 액션이 없어 항상 빈 탭  | 완전 gap                                     |
| 🔴 P1    | 레시피 추천(referral) 포인트 | `recipe_order_referrals`에 INSERT하는 코드가 어디에도 없음 — 관리자 통계/목록 화면은 있지만 항상 빈 데이터. 레시피 재료의 "장바구니 담기" 버튼도 미연결(장식용) | 완전 gap                                     |
| 🟠 P2    | 회원/판매자 정지             | 로그인 로직(`app/api/auth/login/route.ts`)이 `users.status`를 조회·검사하지 않음 — 관리자가 정지시켜도 정지 회원이 정상 로그인됨                                | 완전 gap                                     |
| 🟠 P2    | FAQ                          | 관리자는 FAQ CRUD 완비, 사용자 쪽 조회 화면·API가 전혀 없음(`/api/faqs` 자체가 없음)                                                                            | 완전 gap                                     |
| 🟡 P3    | 판매자 신청 반려 사유        | 사용자 화면(`rejected_reason` 표시)·DB 컬럼은 준비돼 있지만, 관리자 화면(`app/admin/sellers/page.tsx`)에 반려 사유 "입력" 필드가 없어 항상 null로 저장됨        | 부분 gap                                     |
| 🟡 P3    | 판매자 상품 문의             | 사용자는 문의 시 "상품문의" 카테고리를 선택할 수 있는데, 판매자 포털에는 문의를 열람/응대하는 화면·API가 전혀 없음(관리자만 전량 처리)                          | 부분 gap(설계상 의도적일 수 있음, 확인 필요) |
| 🟡 P3    | 관리자 포인트 조정           | 사용자 조회(`mypage/points`)는 있으나, 관리자가 특정 유저 포인트를 직접 가감하는 화면·API가 없음(통계 열람만 가능)                                              | 부분 gap                                     |
| ⚪ P4    | 위시리스트/북마크 통계       | 사용자 조회만 있고, 판매자 대시보드·관리자 분석 어디에도 찜/북마크 수 통계 노출 없음                                                                            | 참고(기능 누락이라기보단 개선 여지)          |
| ⚪ P4    | 쿠폰 상시 조회               | mypage 안에 "내 쿠폰함" 상설 메뉴는 없고 체크아웃 모달에서만 보유 쿠폰 확인 가능                                                                                | 참고(gap 아님, UX 개선 여지)                 |
| —        | 주문 상세 페이지             | `app/(main)/mypage/orders/[orderId]/page.tsx`가 "준비 중" 스텁 — 실제 상세는 목록 내 모달(`OrderDetailModal`)로 대체 구현되어 사실상 죽은 라우트                | 정리 대상                                    |

---

## 상세 내역

### 1. 주문 취소/환불 — 🔴 P1 완전 gap

- **정상 동작하는 부분**: 결제완료·주문확인 단계의 "취소 신청"은 완비됨.
  - 사용자: `app/(main)/mypage/orders/_components/OrderCardActions.tsx:31-39`에서 조건부 노출 → `OrderCancelModal.tsx:22`에서 사유 입력 후 `POST /orders/{orderId}/cancel`
  - API: `app/api/orders/[orderId]/cancel/route.ts:6` `CANCELLABLE_STATUSES = ['결제완료', '주문확인']`만 허용, `refund_requests`에 `status: '취소요청'`로 insert (54-61행)
  - 판매자: `app/api/seller/orders/refunds/db.ts`의 `getOrdersWithRefundRequests`가 이 데이터를 조회해 `app/seller/orders/cancel-refund/page.tsx`에서 승인/거부 처리
  - 사유(`request_reason`) ↔ 거부사유(`reject_reason`)도 양쪽 화면에 대칭적으로 표시됨 — 필드 레벨까지 일치 확인
- **문제**: `refund_requests`에 `status`를 insert하는 코드는 프로젝트 전체에서 `app/api/orders/[orderId]/cancel/route.ts` 단 한 곳뿐이고, 이 라우트는 `'취소요청'`만 생성한다(45행 `.eq('status', '취소요청')`, 57행 `status: '취소요청'`). 반면 판매자 화면과 `refunds/db.ts`에는 `'환불요청'` 탭·승인 로직(`approveRefund` 등)이 이미 구현돼 있음 — **배송완료 후 하자/단순변심 등으로 "환불"을 신청하는 사용자 액션 자체가 없어서, 판매자 쪽 환불요청 탭은 구조적으로 항상 비어있다.**
- `app/(main)/mypage/cancel/page.tsx`(`CancelList.tsx`)는 신청 폼이 아니라 `/orders?status=취소|환불` 필터 결과를 보여주는 **이력 조회 전용** 화면이라 이 gap을 메우지 못함.
- `docs/api/04-order.md`에도 취소 신청 엔드포인트만 명세되어 있고 환불 신청 엔드포인트는 애초에 문서에도 없음 — 스펙 단계에서부터 빠진 것으로 보임.
- 참고: 관리자 `app/admin/orders/page.tsx`는 조회 전용이며 취소/환불에 개입하는 코드 없음(의도된 설계로 보임 — 판매자 권한 영역).
- 부수 발견: `app/(main)/mypage/orders/[orderId]/page.tsx`가 "주문 상세 페이지 준비 중입니다."만 렌더링하는 스텁. 실제 상세는 목록 페이지 내 `OrderDetailModal`로 대체 구현되어 있어 이 라우트는 사실상 죽은 코드.

### 2. 배송 조회(송장 연동) — 정상

- 판매자가 `app/api/seller/shipping/orders/[itemId]/route.ts`에서 송장 입력 → `shippings` 테이블 upsert
- 사용자는 `app/api/orders/[orderId]/route.ts:22-26,71-76`에서 동일 테이블을 조회해 `OrderDetailContent.tsx:90-104`에 택배사/운송장번호/배송완료일 표시 — 필드까지 정상 매칭.

### 3. 리뷰 — 정상

- 상품 리뷰(`ReviewSectionClient.tsx` → `ReviewWriteModal`, `app/(main)/shopping/[id]`), 레시피 리뷰(`app/(main)/recipes/[id]`), 주문 완료 상품별 리뷰(`OrderReviewModal.tsx` via `OrderCardActions.tsx`) 모두 작성 UI 존재.
- 판매자 답글/신고(`app/seller/reviews/page.tsx`)와 관리자 모더레이션(`app/admin/reviews/page.tsx`)의 "생성원"이 실제로 존재함 — 대응 정상.

### 4. 1:1 문의 — 부분 gap (판매자 열람 화면 없음)

- 사용자 작성/조회: `app/(main)/mypage/support/page.tsx` + `InquiryForm.tsx`, `[inquiryId]/page.tsx`. API `app/api/inquiries/route.ts`(카테고리: 주문문의/상품문의/배송문의/기타)
- 관리자 답변: `app/admin/support/inquiry/page.tsx` → `api/admin/inquiries`, `.../[inquiryId]/reply`
- **"상품문의" 카테고리가 존재함에도 판매자 포털에는 문의를 열람/응대하는 화면·API가 전혀 없다.** `app/seller/**`, `app/api/seller/**` 전체에 inquiries 관련 코드 0건. 관리자가 전량 응대하는 구조가 의도된 설계인지, 아니면 원래는 판매자에게 라우팅되어야 했는지 확인 필요.

### 5. FAQ — 🟠 P2 완전 gap

- 관리자 관리: `app/admin/support/faq/page.tsx`, API `app/api/admin/faqs/route.ts`(GET/POST), `[faqId]/route.ts` — 모두 `requireAdmin`으로 보호.
- 사용자 조회 화면·API가 **전혀 없음**. `app/(main)` 전체에서 `faq` 키워드 매치 0건, `/api/faqs`처럼 인증 없이 접근 가능한 사용자용 엔드포인트도 없음. 관리자가 FAQ를 만들어도 사용자가 볼 방법이 없는 완전한 단절.

### 6. 포인트 — 부분 gap (관리자 직접 조정 화면 없음)

- 사용자 조회: `app/(main)/mypage/points/page.tsx` → `api/users/me/points/route.ts`(잔액 + 최근 50건)
- 적립/차감 발생 지점: 취소·환불 시 포인트 환급은 `app/api/seller/orders/refunds/db.ts:406-411`에 구현됨(순차 소진 방식, 최근 작업).
- **관리자가 특정 유저의 포인트를 직접 가감하는 화면·API는 없음.** `app/admin/**`에 points 관련 `page.tsx`가 없고, `api/admin/recipes/points`, `api/admin/recipes/referrals`는 통계 집계 GET만 제공.

### 7. 쿠폰 — 정상 (단, 상시 조회 메뉴는 없음)

- 관리자 발급(`app/admin/coupons/page.tsx`) → 사용자는 체크아웃의 `CouponModal.tsx`(`GET /coupons/mine`)에서 보유 쿠폰을 확인·적용, 주문 상세에도 할인액 표시됨 — 대응 정상.
- 다만 mypage 안에 상시 조회 가능한 "내 쿠폰함" 메뉴는 없고 결제 시점에만 노출됨. Gap은 아니나 UX 개선 여지로 기록.

### 8. 판매자 신청 — 🟡 P3 부분 gap (반려 사유 입력 UI 누락)

- 신청(`SellerApplyForm.tsx`) → 승인/반려(`app/admin/sellers/page.tsx` → `api/admin/sellers/[sellerId]/approve/route.ts`) → 결과 확인(`sellerapply.tsx`가 `approve_status`로 분기, 반려 시 `rejectedReason` 표시) 흐름 자체는 존재.
- **문제**: `app/admin/sellers/page.tsx`의 `handleSaveEdit`(161-186행)이 상태를 "반려"로 바꿀 때 사유를 입력받아 API로 전송하는 필드가 없음. 백엔드(`approve/route.ts:62`)와 사용자 화면은 `rejected_reason` 표시를 지원하도록 다 준비돼 있는데, 관리자가 실제로 사유를 입력할 방법이 없어 항상 `null`로 저장됨.

### 9. 회원/판매자 정지 — 🟠 P2 완전 gap

- 관리자 상태 변경: `app/admin/members/page.tsx` → `api/admin/users/[userId]/status/route.ts`(PATCH, `active`/`suspended`)
- **`app/api/auth/login/route.ts`는 Supabase 인증 성공 후 `users`에서 `role, user_id`만 조회하고 `status`를 조회·검사하는 코드가 없다.** `lib/serverAuth.ts`의 `requireAuth` 등도 마찬가지. 즉 **관리자가 회원(또는 판매자)을 정지시켜도 해당 계정은 아무 제약 없이 정상 로그인된다.** 정지 기능이 사실상 DB 컬럼만 바뀔 뿐 실효성이 없는 상태.

### 10. 위시리스트/북마크 — 참고 (통계 화면 없음)

- 사용자 조회(`mypage/likes`, `api/users/me/wishlists`, `.../bookmarks`)만 존재. 판매자 대시보드(`app/seller/page.tsx`), 관리자 분석(`app/admin/analytics/page.tsx`), 관리자 상품(`app/admin/products/page.tsx`) 어디에도 찜/북마크 수 통계가 없음(`wishlist`/`bookmark` 키워드 매치 0건). 필수 기능은 아니지만 상품 인기도 지표로 참고할 만함.

### 11. 레시피 추천(referral) 포인트 연동 — 🔴 P1 완전 gap

- `api/admin/recipes/points/route.ts`, `api/admin/recipes/referrals/route.ts`가 `recipe_order_referrals` 테이블(레시피 경유 주문 시 `point_paid`)을 집계/조회하는 관리자 화면은 구현되어 있음(읽기 전용).
- **이 테이블에 실제로 INSERT하는 코드가 `app/`, `lib/` 전체에 없음.** 주문/결제(`app/api/order`, `app/api/orders`, `app/api/cart`, `app/api/payment`) 어디에도 레시피-주문 연결을 기록하는 로직이 없어, 관리자 화면은 항상 빈 데이터를 보여주는 구조.
- 근본 원인으로 보이는 지점: `app/(main)/recipes/[id]/_components/RecipeIngredientItem.tsx`의 "장바구니 담기" 버튼에 `onClick` 핸들러가 없는 장식용 버튼 — 레시피 재료를 실제 상품 장바구니 담기로 연결하는 동작 자체가 미구현이라, 애초에 "레시피 경유 구매"라는 이벤트가 발생할 수 없음.

---

## 다음 작업 제안 (우선순위 순)

1. **환불 신청 API/UI 추가**: `POST /orders/{orderId}/items/{itemId}/refund` 같은 엔드포인트 신설 + 배송완료 주문에 "환불 신청" 버튼 추가. 기존 취소 신청과 유사한 패턴(`OrderCancelModal` 참고)으로 구현 가능.
2. **로그인 시 `status` 검사 추가**: `app/api/auth/login/route.ts`에서 `users.status`를 함께 조회해 `suspended`면 401과 함께 안내 메시지 반환. 판매자 승인 거절 상태(`approve_status`)와는 별개 이슈이므로 혼동 주의.
3. **레시피-상품 연동 재검토**: "장바구니 담기" 버튼 연결 + `recipe_order_referrals` insert 로직을 어디서 처리할지(주문 생성 시점? 결제 완료 시점?) 설계 필요. 범위가 커서 별도 작업으로 분리 권장.
4. **FAQ 사용자 조회 화면 추가**: `GET /api/faqs`(공개) + `mypage/support` 또는 별도 페이지에 목록/아코디언 UI.
5. **관리자 반려 사유 입력 필드 추가**: `app/admin/sellers/page.tsx`의 반려 처리 UI에 textarea 추가, `approve` API 호출 시 함께 전송.
6. **판매자 상품문의 열람 여부 팀 논의**: 의도된 설계인지 확인 후, 필요시 `app/seller/inquiries` 또는 기존 문의관리 화면에 필터 추가.
7. (Low) 관리자 포인트 직접 조정 화면, 위시리스트/북마크 통계 노출은 필요성 논의 후 백로그 등록.
8. (정리) `app/(main)/mypage/orders/[orderId]/page.tsx` 스텁 라우트 삭제 또는 실제 상세 페이지로 교체 검토.
