# 07. Admin · 관리자

[← 목차로 돌아가기](../api.md)

> **인증** : 관리자 계정 JWT 필요 (`role: admin`)

---

## 엔드포인트 목록

| Method | Endpoint                            | 설명                       | 인증 |
| ------ | ----------------------------------- | -------------------------- | ---- |
| GET    | `/admin/dashboard`                  | 전체 통계 대시보드         | ✓    |
| GET    | `/admin/users`                      | 회원 목록 조회             | ✓    |
| GET    | `/admin/users/:userId`              | 회원 상세 조회             | ✓    |
| PATCH  | `/admin/users/:userId/status`       | 회원 상태 변경 (정지/활성) | ✓    |
| DELETE | `/admin/users/:userId`              | 회원 강제 탈퇴             | ✓    |
| GET    | `/admin/sellers`                    | 판매자 목록 조회           | ✓    |
| PATCH  | `/admin/sellers/:sellerId/approve`  | 판매자 승인/거절           | ✓    |
| GET    | `/admin/products`                   | 전체 상품 목록             | ✓    |
| PATCH  | `/admin/products/:productId`        | 상품 정보 수정             | ✓    |
| DELETE | `/admin/products/:productId`        | 상품 삭제                  | ✓    |
| GET    | `/admin/orders`                     | 전체 주문 목록             | ✓    |
| PATCH  | `/admin/orders/:orderId/status`     | 주문 상태 변경             | ✓    |
| GET    | `/admin/reviews`                    | 리뷰 목록 조회 + 신고 통계 | ✓    |
| PATCH  | `/admin/reviews/:reviewId`          | 리뷰 상태 변경 (처리완료)  | ✓    |
| DELETE | `/admin/reviews/:reviewId`          | 리뷰 삭제 (어뷰징)         | ✓    |
| GET    | `/admin/settlements`                | 정산 목록                  | ✓    |
| PATCH  | `/admin/settlements/:settlementId`  | 정산 처리                  | ✓    |
| GET    | `/admin/inquiries`                  | 전체 문의 목록             | ✓    |
| POST   | `/admin/inquiries/:inquiryId/reply` | 문의 답변                  | ✓    |
| GET    | `/admin/faqs`                       | FAQ 목록 조회              | ✓    |
| POST   | `/admin/faqs`                       | FAQ 등록                   | ✓    |
| PATCH  | `/admin/faqs/:faqId`                | FAQ 수정                   | ✓    |
| DELETE | `/admin/faqs/:faqId`                | FAQ 삭제                   | ✓    |
| GET    | `/admin/coupons`                    | 쿠폰 목록 조회             | ✓    |
| POST   | `/admin/coupons`                    | 쿠폰 생성 및 전체 지급     | ✓    |
| DELETE | `/admin/coupons/:couponId`          | 쿠폰 삭제                  | ✓    |
| POST   | `/admin/coupons/:couponId/issue`    | 쿠폰 전체/개별 지급        | ✓    |

---

### GET `/admin/dashboard`

`Response 200`

| 필드               | 타입  | 설명                |
| ------------------ | ----- | ------------------- |
| `totalUsers`       | `int` | 전체 회원 수        |
| `newUsersToday`    | `int` | 오늘 신규 가입 수   |
| `totalSellers`     | `int` | 전체 판매자 수      |
| `pendingSellers`   | `int` | 승인 대기 판매자 수 |
| `totalOrders`      | `int` | 전체 주문 수        |
| `todayOrders`      | `int` | 오늘 주문 수        |
| `todayRevenue`     | `int` | 오늘 총 매출 (원)   |
| `monthRevenue`     | `int` | 이번달 총 매출 (원) |
| `pendingInquiries` | `int` | 미답변 문의 수      |

```json
{
  "success": true,
  "data": {
    "totalUsers": 12500,
    "newUsersToday": 47,
    "totalSellers": 230,
    "pendingSellers": 5,
    "totalOrders": 85000,
    "todayOrders": 320,
    "todayRevenue": 14500000,
    "monthRevenue": 380000000,
    "pendingInquiries": 18
  }
}
```

---

### GET `/admin/users`

`Query Parameters`

| 파라미터  | 타입     | 필수 | 설명                  |
| --------- | -------- | ---- | --------------------- |
| `keyword` | `string` | ✗    | 닉네임/이메일 검색    |
| `status`  | `string` | ✗    | 상태 (`활성`, `정지`) |
| `page`    | `int`    | ✗    | 페이지 번호           |
| `limit`   | `int`    | ✗    | 페이지당 항목 수      |

`Response 200`

| 필드         | 타입     | 설명                  |
| ------------ | -------- | --------------------- |
| `userId`     | `int`    | 회원 ID               |
| `email`      | `string` | 이메일                |
| `nickname`   | `string` | 닉네임                |
| `status`     | `string` | 상태 (`활성`, `정지`) |
| `point`      | `int`    | 보유 포인트           |
| `orderCount` | `int`    | 총 주문 수            |
| `createdAt`  | `string` | 가입일 (ISO 8601)     |

```json
{
  "success": true,
  "data": {
    "users": [
      {
        "userId": 1,
        "email": "user@example.com",
        "nickname": "string",
        "status": "활성",
        "point": 3000,
        "orderCount": 12,
        "createdAt": "2026-01-01T00:00:00Z"
      }
    ],
    "pagination": { "page": 1, "limit": 20, "total": 12500, "hasNext": true }
  }
}
```

### PATCH `/admin/users/:userId/status`

`Request Body`

| 필드     | 타입     | 필수 | 설명                         |
| -------- | -------- | ---- | ---------------------------- |
| `status` | `string` | ✓    | 변경할 상태 (`활성`, `정지`) |
| `reason` | `string` | ✗    | 사유 (정지 시 권장)          |

```json
{ "status": "정지", "reason": "불법 콘텐츠 게시" }
```

---

### GET `/admin/sellers`

`Query Parameters`

| 파라미터 | 타입     | 필수 | 설명                               |
| -------- | -------- | ---- | ---------------------------------- |
| `status` | `string` | ✗    | 승인 상태 (`승인`, `대기`, `거절`) |
| `page`   | `int`    | ✗    | 페이지 번호                        |
| `limit`  | `int`    | ✗    | 페이지당 항목 수                   |

`Response 200`

| 필드             | 타입     | 설명                                          |
| ---------------- | -------- | --------------------------------------------- |
| `sellerId`       | `int`    | 판매자 ID                                     |
| `storeName`      | `string` | 상호명                                        |
| `email`          | `string` | 이메일                                        |
| `businessNumber` | `string` | 사업자 번호                                   |
| `approveStatus`  | `string` | 승인 상태 (`pending`, `approved`, `rejected`) |
| `productCount`   | `int`    | 등록 상품 수                                  |
| `createdAt`      | `string` | 신청일 (ISO 8601)                             |

```json
{
  "success": true,
  "data": {
    "sellers": [
      {
        "sellerId": 5,
        "storeName": "건강한 농장",
        "email": "seller@example.com",
        "businessNumber": "000-00-00000",
        "approveStatus": "pending",
        "productCount": 0,
        "createdAt": "2026-05-30T00:00:00Z"
      }
    ],
    "pagination": { "page": 1, "limit": 20, "total": 230, "hasNext": true }
  }
}
```

### PATCH `/admin/sellers/:sellerId/approve`

`Request Body`

| 필드     | 타입     | 필수 | 설명                              |
| -------- | -------- | ---- | --------------------------------- |
| `status` | `string` | ✓    | `approved` 또는 `rejected`        |
| `reason` | `string` | ✗    | 거절 사유 (`rejected` 시 권장)    |

```json
{ "status": "rejected", "reason": "서류 미비" }
```

---

### GET `/admin/reviews`

`Query Parameters`

| 파라미터  | 타입     | 필수 | 설명              |
| --------- | -------- | ---- | ----------------- |
| `keyword` | `string` | ✗    | 리뷰 내용 키워드  |
| `page`    | `int`    | ✗    | 페이지 번호       |
| `limit`   | `int`    | ✗    | 페이지당 항목 수  |

`Response 200`

| 필드                    | 타입     | 설명                               |
| ----------------------- | -------- | ---------------------------------- |
| `stats.total`           | `int`    | 전체 리뷰 수                       |
| `stats.pendingReports`  | `int`    | 신고 대기 리뷰 수 (`status=신고`)  |
| `stats.resolved`        | `int`    | 처리 완료 리뷰 수                  |
| `reviews[].reviewId`    | `int`    | 리뷰 ID                            |
| `reviews[].author`      | `string` | 작성자 닉네임                      |
| `reviews[].authorEmail` | `string` | 작성자 이메일                      |
| `reviews[].targetName`  | `string` | 대상 상품명 또는 레시피 제목       |
| `reviews[].rating`      | `int`    | 평점 (1~5)                         |
| `reviews[].content`     | `string` | 리뷰 내용                          |
| `reviews[].state`       | `string` | 상태 (`정상` \| `신고` \| `처리완료`) |
| `reviews[].reportCount` | `int`    | 신고 수                            |
| `reviews[].reports`     | `array`  | 신고 내역 목록                     |
| `reviews[].createdAt`   | `string` | 작성일시 (ISO 8601)                |

```json
{
  "stats": { "total": 3456, "pendingReports": 5, "resolved": 12 },
  "reviews": [
    {
      "reviewId": 1,
      "author": "홍길동",
      "authorEmail": "hong@example.com",
      "targetName": "제주 감귤 5kg",
      "rating": 1,
      "content": "이 제품 광고입니다",
      "state": "신고",
      "reportCount": 3,
      "reports": [
        { "reporter": "김철수", "date": "2026.06.01", "reason": "광고성 리뷰" }
      ],
      "createdAt": "2026-05-30T00:00:00Z"
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 3456, "hasNext": true }
}
```

---

### PATCH `/admin/reviews/:reviewId`

`Request Body`

| 필드     | 타입     | 필수 | 설명                                  |
| -------- | -------- | ---- | ------------------------------------- |
| `status` | `string` | ✓    | `정상` \| `신고` \| `처리완료`        |

```json
{ "status": "처리완료" }
```

`Response 200`

```json
{ "success": true }
```

---

### DELETE `/admin/reviews/:reviewId`

`Response 200`

```json
{ "success": true }
```

> `review_reports` 테이블의 관련 신고 내역은 `ON DELETE CASCADE`로 자동 삭제됩니다.

---

### GET `/admin/settlements`

`Query Parameters`

| 파라미터    | 타입     | 필수 | 설명                       |
| ----------- | -------- | ---- | -------------------------- |
| `status`    | `string` | ✗    | 정산 상태 (`대기`, `완료`) |
| `startDate` | `string` | ✗    | 조회 시작일 (YYYY-MM-DD)   |
| `endDate`   | `string` | ✗    | 조회 종료일 (YYYY-MM-DD)   |
| `page`      | `int`    | ✗    | 페이지 번호                |

`Response 200`

| 필드           | 타입            | 설명                       |
| -------------- | --------------- | -------------------------- |
| `settlementId` | `int`           | 정산 ID                    |
| `sellerId`     | `int`           | 판매자 ID                  |
| `storeName`    | `string`        | 판매자 상호명              |
| `amount`       | `int`           | 정산 금액 (원)             |
| `status`       | `string`        | 정산 상태 (`대기`, `완료`) |
| `settledAt`    | `string / null` | 정산 완료 일시             |

```json
{
  "success": true,
  "data": {
    "settlements": [
      {
        "settlementId": 1,
        "sellerId": 5,
        "storeName": "건강한 농장",
        "amount": 4940000,
        "status": "대기",
        "settledAt": null
      }
    ],
    "pagination": { "page": 1, "limit": 20, "total": 50, "hasNext": true }
  }
}
```

### PATCH `/admin/settlements/:settlementId`

`Request Body`

| 필드     | 타입     | 필수 | 설명   |
| -------- | -------- | ---- | ------ |
| `status` | `string` | ✓    | `완료` |

```json
{ "status": "완료" }
```

---

### POST `/admin/inquiries/:inquiryId/reply`

`Request Body`

| 필드      | 타입     | 필수 | 설명      |
| --------- | -------- | ---- | --------- |
| `content` | `string` | ✓    | 답변 내용 |

```json
{ "content": "안녕하세요. 문의해주신 내용에 대해 답변 드립니다..." }
```

---

### GET `/admin/faqs`

`Query Parameters`

| 파라미터   | 타입     | 필수 | 설명                                        |
| ---------- | -------- | ---- | ------------------------------------------- |
| `category` | `string` | ✗    | 카테고리 (`배송`, `환불`, `상품`, `회원`, `결제`) |
| `keyword`  | `string` | ✗    | 제목 키워드 검색                            |

`Response 200`

| 필드        | 타입      | 설명                        |
| ----------- | --------- | --------------------------- |
| `faq_id`    | `int`     | FAQ ID                      |
| `category`  | `string`  | 카테고리                    |
| `title`     | `string`  | 질문                        |
| `content`   | `string`  | 답변                        |
| `views`     | `int`     | 조회수                      |
| `is_public` | `boolean` | 공개 여부                   |
| `created_at`| `string`  | 등록일 (ISO 8601)           |

```json
{
  "faqs": [
    {
      "faq_id": 1,
      "category": "배송",
      "title": "배송은 얼마나 걸리나요?",
      "content": "평균 2~3 영업일 소요됩니다.",
      "views": 120,
      "is_public": true,
      "created_at": "2026-06-01T00:00:00Z"
    }
  ],
  "total": 1
}
```

---

### POST `/admin/faqs`

`Request Body`

| 필드        | 타입      | 필수 | 설명                                        |
| ----------- | --------- | ---- | ------------------------------------------- |
| `category`  | `string`  | ✓    | 카테고리 (`배송`, `환불`, `상품`, `회원`, `결제`) |
| `title`     | `string`  | ✓    | 질문                                        |
| `content`   | `string`  | ✓    | 답변                                        |
| `is_public` | `boolean` | ✗    | 공개 여부 (기본값 `true`)                   |

```json
{ "category": "배송", "title": "배송은 얼마나 걸리나요?", "content": "평균 2~3 영업일 소요됩니다.", "is_public": true }
```

`Response 201`

```json
{ "faq": { "faq_id": 1, "category": "배송", "title": "...", "content": "...", "views": 0, "is_public": true, "created_at": "..." } }
```

---

### PATCH `/admin/faqs/:faqId`

`Request Body`

| 필드        | 타입      | 필수 | 설명                                        |
| ----------- | --------- | ---- | ------------------------------------------- |
| `category`  | `string`  | ✗    | 카테고리 (`배송`, `환불`, `상품`, `회원`, `결제`) |
| `title`     | `string`  | ✗    | 질문                                        |
| `content`   | `string`  | ✗    | 답변                                        |
| `is_public` | `boolean` | ✗    | 공개 여부                                   |

```json
{ "is_public": false }
```

`Response 200`

```json
{ "faq": { "faq_id": 1, "category": "배송", "title": "...", "content": "...", "views": 120, "is_public": false, "created_at": "..." } }
```

---

### DELETE `/admin/faqs/:faqId`

`Response 200`

```json
{ "success": true }
```

---

### GET `/admin/coupons`

`Response 200`

| 필드                       | 타입     | 설명                              |
| -------------------------- | -------- | --------------------------------- |
| `coupons[].couponId`       | `int`    | 쿠폰 ID                           |
| `coupons[].code`           | `string` | 쿠폰 코드                         |
| `coupons[].discountType`   | `string` | 할인 유형 (`rate` \| `fixed`)     |
| `coupons[].discountValue`  | `int`    | 할인 값 (% 또는 원)               |
| `coupons[].minOrderAmount` | `int\|null` | 최소 주문 금액 (원)            |
| `coupons[].maxUsageCount`  | `int\|null` | 최대 발급 횟수 (NULL이면 무제한) |
| `coupons[].issuedCount`    | `int`    | 현재까지 발급된 수                |
| `coupons[].usedCount`      | `int`    | 현재까지 사용된 수                |
| `coupons[].expiredAt`      | `string` | 만료일시 (ISO 8601)               |
| `coupons[].createdAt`      | `string` | 생성일시 (ISO 8601)               |

```json
{
  "coupons": [
    {
      "couponId": 1,
      "code": "SUMMER2026",
      "discountType": "rate",
      "discountValue": 10,
      "minOrderAmount": 30000,
      "maxUsageCount": null,
      "issuedCount": 1250,
      "usedCount": 342,
      "expiredAt": "2026-08-31T23:59:59Z",
      "createdAt": "2026-07-01T00:00:00Z"
    }
  ]
}
```

---

### POST `/admin/coupons`

> 쿠폰을 생성하고 **전체 활성 사용자(`role=user`, `status=active`)에게 즉시 자동 지급**합니다.

`Request Body`

| 필드              | 타입     | 필수 | 설명                          |
| ----------------- | -------- | ---- | ----------------------------- |
| `code`            | `string` | ✓    | 쿠폰 코드 (대문자, 중복 불가) |
| `discountType`    | `string` | ✓    | `rate` (정률) 또는 `fixed` (정액) |
| `discountValue`   | `int`    | ✓    | 할인 값 (정률이면 1~100)      |
| `minOrderAmount`  | `int`    | ✗    | 최소 주문 금액 (원)           |
| `expiredAt`       | `string` | ✓    | 만료일시 (ISO 8601, 미래 시각) |

```json
{
  "code": "SUMMER2026",
  "discountType": "rate",
  "discountValue": 10,
  "minOrderAmount": 30000,
  "expiredAt": "2026-08-31T23:59:59Z"
}
```

`Response 201` — 생성된 쿠폰 객체 (`GET /admin/coupons` 항목과 동일한 shape)

`Error`

| 상태 | 설명                        |
| ---- | --------------------------- |
| 409  | 이미 존재하는 쿠폰 코드     |
| 400  | 유효성 검증 실패            |

---

### DELETE `/admin/coupons/:couponId`

> 이미 사용된(`used_at IS NOT NULL`) 쿠폰이 1건이라도 있으면 삭제 불가.

`Response 204` — 본문 없음

`Error`

| 상태 | 설명                             |
| ---- | -------------------------------- |
| 409  | 이미 사용된 쿠폰은 삭제 불가    |

---

### POST `/admin/coupons/:couponId/issue`

> 쿠폰을 특정 사용자 또는 전체 활성 사용자에게 지급합니다. `user_coupons` 테이블에 row를 생성하며, 이미 지급된 사용자는 중복 지급되지 않습니다(`ignoreDuplicates`).

`Request Body`

| 필드       | 타입       | 필수 | 설명                                              |
| ---------- | ---------- | ---- | ------------------------------------------------- |
| `issueAll` | `boolean`  | ✗    | `true`이면 전체 활성 사용자에게 지급              |
| `userIds`  | `int[]`    | ✗    | `issueAll`이 없거나 `false`일 때 지급할 userId 목록 |

> `issueAll`과 `userIds`는 택일. `issueAll: true` 시 `userIds` 무시.

```json
{ "issueAll": true }
```

`Response 200`

| 필드          | 타입  | 설명                        |
| ------------- | ----- | --------------------------- |
| `issuedCount` | `int` | 실제 신규 지급된 건수       |

```json
{ "issuedCount": 1250 }
```
