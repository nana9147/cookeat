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
| GET    | `/admin/reviews`                    | 리뷰 목록 조회             | ✓    |
| DELETE | `/admin/reviews/:reviewId`          | 리뷰 삭제 (어뷰징)         | ✓    |
| GET    | `/admin/categories`                 | 카테고리 목록              | ✓    |
| POST   | `/admin/categories`                 | 카테고리 추가              | ✓    |
| PATCH  | `/admin/categories/:categoryId`     | 카테고리 수정              | ✓    |
| DELETE | `/admin/categories/:categoryId`     | 카테고리 삭제              | ✓    |
| GET    | `/admin/coupons`                    | 프로모 코드 목록           | ✓    |
| POST   | `/admin/coupons`                    | 프로모 코드 생성           | ✓    |
| DELETE | `/admin/coupons/:couponId`          | 프로모 코드 삭제           | ✓    |
| GET    | `/admin/settlements`                | 정산 목록                  | ✓    |
| PATCH  | `/admin/settlements/:settlementId`  | 정산 처리                  | ✓    |
| GET    | `/admin/inquiries`                  | 전체 문의 목록             | ✓    |
| POST   | `/admin/inquiries/:inquiryId/reply` | 문의 답변                  | ✓    |

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

| 필드             | 타입      | 설명                          |
| ---------------- | --------- | ----------------------------- |
| `sellerId`       | `int`     | 판매자 ID                     |
| `storeName`      | `string`  | 상호명                        |
| `email`          | `string`  | 이메일                        |
| `businessNumber` | `string`  | 사업자 번호                   |
| `isApproved`     | `boolean` | 승인 여부                     |
| `status`         | `string`  | 상태 (`승인`, `대기`, `거절`) |
| `productCount`   | `int`     | 등록 상품 수                  |
| `createdAt`      | `string`  | 신청일 (ISO 8601)             |

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
        "isApproved": false,
        "status": "대기",
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

| 필드       | 타입      | 필수 | 설명                       |
| ---------- | --------- | ---- | -------------------------- |
| `approved` | `boolean` | ✓    | `true` 승인 / `false` 거절 |
| `reason`   | `string`  | ✗    | 거절 사유                  |

```json
{ "approved": true, "reason": null }
```

---

### POST `/admin/categories`

`Request Body`

| 필드        | 타입         | 필수 | 설명                             |
| ----------- | ------------ | ---- | -------------------------------- |
| `name`      | `string`     | ✓    | 카테고리명                       |
| `parentId`  | `int / null` | ✗    | 상위 카테고리 ID (최상위면 null) |
| `sortOrder` | `int`        | ✗    | 노출 순서                        |

```json
{ "name": "다이어트", "parentId": null, "sortOrder": 5 }
```

---

### POST `/admin/coupons`

`Request Body`

| 필드             | 타입         | 필수 | 설명                             |
| ---------------- | ------------ | ---- | -------------------------------- |
| `code`           | `string`     | ✓    | 쿠폰 코드                        |
| `discountType`   | `string`     | ✓    | 할인 유형 (`rate`, `fixed`)      |
| `discountValue`  | `int`        | ✓    | 할인 값 (% 또는 원)              |
| `minOrderAmount` | `int`        | ✗    | 최소 주문 금액 (원)              |
| `maxUsageCount`  | `int / null` | ✗    | 최대 사용 횟수 (null이면 무제한) |
| `expiredAt`      | `string`     | ✓    | 만료일 (ISO 8601)                |

```json
{
  "code": "SUMMER2026",
  "discountType": "rate",
  "discountValue": 10,
  "minOrderAmount": 20000,
  "maxUsageCount": 1000,
  "expiredAt": "2026-08-31T23:59:59Z"
}
```

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
