# 04. Order · 주문 결제 / Review · 리뷰

[← 목차로 돌아가기](../api.md)

---

## Order · 주문 결제

| Method | Endpoint                  | 설명                  | 인증 |
| ------ | ------------------------- | --------------------- | ---- |
| POST   | `/orders`                 | 주문 생성 (결제 요청) | ✓    |
| GET    | `/orders`                 | 주문 목록 조회        | ✓    |
| GET    | `/orders/:orderId`        | 주문 상세 조회        | ✓    |
| POST   | `/orders/:orderId/cancel` | 주문 취소             | ✓    |
| POST   | `/orders/:orderId/refund` | 배송완료 주문 환불 신청 | ✓    |

### POST `/orders`

`Request Body`

| 필드                     | 타입     | 필수 | 설명                                 |
| ------------------------ | -------- | ---- | ------------------------------------ |
| `items[].productId`      | `int`    | ✓    | 상품 ID                              |
| `items[].quantity`       | `int`    | ✓    | 수량                                 |
| `shipping.recipient`     | `string` | ✓    | 수령인 이름                          |
| `shipping.phone`         | `string` | ✓    | 수령인 연락처                        |
| `shipping.address`       | `string` | ✓    | 배송지 주소                          |
| `shipping.addressDetail` | `string` | ✗    | 상세 주소                            |
| `shipping.request`       | `string` | ✗    | 배송 요청사항                        |
| `payment.method`         | `string` | ✓    | 결제 수단 (`card`, `point`, `kakao`) |
| `payment.usePoint`       | `int`    | ✗    | 사용할 포인트 (기본 0)               |
| `payment.userCouponId`   | `int`    | ✗    | 사용할 user_coupons.id (없으면 생략) |

```json
{
  "items": [{ "productId": 100, "quantity": 2 }],
  "shipping": {
    "recipient": "홍길동",
    "phone": "010-0000-0000",
    "address": "서울시 강남구 ...",
    "addressDetail": "101호",
    "request": "문 앞에 놔주세요"
  },
  "payment": { "method": "card", "usePoint": 1000, "userCouponId": 42 }
}
```

`Response 201`

| 필드             | 타입     | 설명                             |
| ---------------- | -------- | -------------------------------- |
| `orderId`        | `string` | 주문 ID (ORD-YYYYMMDD-XXXXXX)    |
| `totalAmount`    | `int`    | 상품 합계 금액 (원)              |
| `shippingFee`    | `int`    | 배송비 (원)                      |
| `usedPoint`      | `int`    | 사용된 포인트                    |
| `couponDiscount` | `int`    | 쿠폰 할인 금액 (원, 미사용 시 0) |
| `finalAmount`    | `int`    | 최종 결제 금액 (원)              |
| `status`         | `string` | 주문 상태                        |
| `createdAt`      | `string` | 주문 일시 (ISO 8601)             |

```json
{
  "success": true,
  "data": {
    "orderId": "ORD-20260601-000001",
    "totalAmount": 13500,
    "shippingFee": 3000,
    "usedPoint": 1000,
    "couponDiscount": 1350,
    "finalAmount": 14150,
    "status": "결제완료",
    "createdAt": "2026-06-01T12:00:00Z"
  }
}
```

---

### GET `/orders`

`Query Parameters`

| 파라미터 | 타입  | 필수 | 설명             |
| -------- | ----- | ---- | ---------------- |
| `page`   | `int` | ✗    | 페이지 번호      |
| `limit`  | `int` | ✗    | 페이지당 항목 수 |

`Response 200`

| 필드          | 타입     | 설명                 |
| ------------- | -------- | -------------------- |
| `orderId`     | `string` | 주문 ID              |
| `finalAmount` | `int`    | 최종 결제 금액 (원)  |
| `status`      | `string` | 주문 상태            |
| `itemCount`   | `int`    | 주문 상품 수         |
| `createdAt`   | `string` | 주문 일시 (ISO 8601) |

```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "orderId": "ORD-20260601-000001",
        "finalAmount": 15500,
        "status": "배송중",
        "itemCount": 3,
        "createdAt": "2026-06-01T12:00:00Z"
      }
    ],
    "pagination": { "page": 1, "limit": 10, "total": 5, "hasNext": false }
  }
}
```

---

## Review · 리뷰

> `reviews` 테이블은 **레시피 리뷰**와 **상품 리뷰** 두 가지를 모두 처리합니다.
> `recipe_id` / `product_id` 중 하나만 값을 가지며 나머지는 NULL 입니다.

| Method | Endpoint                                 | 설명                          | 인증 |
| ------ | ---------------------------------------- | ----------------------------- | ---- |
| GET    | `/recipes/:recipeId/reviews`             | 레시피 리뷰 목록              | ✗    |
| POST   | `/recipes/:recipeId/reviews`             | 레시피 리뷰 작성              | ✓    |
| PATCH  | `/recipes/:recipeId/reviews/:reviewId`   | 레시피 리뷰 수정              | ✓    |
| DELETE | `/recipes/:recipeId/reviews/:reviewId`   | 레시피 리뷰 삭제              | ✓    |
| GET    | `/products/:productId/reviews`           | 상품 리뷰 목록                | ✗    |
| POST   | `/products/:productId/reviews`           | 상품 리뷰 작성 (구매 확정 후) | ✓    |
| PATCH  | `/products/:productId/reviews/:reviewId` | 상품 리뷰 수정                | ✓    |
| DELETE | `/products/:productId/reviews/:reviewId` | 상품 리뷰 삭제                | ✓    |

### GET `/recipes/:recipeId/reviews`

`Response 200`

| 필드                  | 타입            | 설명                 |
| --------------------- | --------------- | -------------------- |
| `reviewId`            | `int`           | 리뷰 고유 ID         |
| `author.userId`       | `int`           | 작성자 ID            |
| `author.nickname`     | `string`        | 작성자 닉네임        |
| `author.profileImage` | `string / null` | 작성자 프로필 이미지 |
| `rating`              | `int`           | 평점 (1~5)           |
| `content`             | `string`        | 리뷰 내용            |
| `images`              | `string[]`      | 리뷰 이미지 URL 목록 |
| `createdAt`           | `string`        | 작성 일시 (ISO 8601) |
| `averageRating`       | `float`         | 평균 평점            |
| `totalCount`          | `int`           | 총 리뷰 수           |

```json
{
  "success": true,
  "data": {
    "reviews": [
      {
        "reviewId": 1,
        "author": { "userId": 1, "nickname": "string", "profileImage": "string | null" },
        "rating": 5,
        "content": "맛있어요!",
        "images": ["string"],
        "createdAt": "2026-06-01T12:00:00Z"
      }
    ],
    "averageRating": 4.5,
    "totalCount": 12
  }
}
```

### POST `/recipes/:recipeId/reviews`

`Request Body`

| 필드      | 타입       | 필수 | 설명                 |
| --------- | ---------- | ---- | -------------------- |
| `rating`  | `int`      | ✓    | 평점 (1~5)           |
| `content` | `string`   | ✓    | 리뷰 내용            |
| `images`  | `string[]` | ✗    | 리뷰 이미지 URL 목록 |

```json
{
  "rating": 5,
  "content": "string",
  "images": ["string"]
}
```

---

### GET `/products/:productId/reviews`

`Response 200` — 레시피 리뷰와 동일한 포맷

```json
{
  "success": true,
  "data": {
    "reviews": [
      {
        "reviewId": 10,
        "author": { "userId": 2, "nickname": "string", "profileImage": "string | null" },
        "rating": 4,
        "content": "신선해요!",
        "images": ["string"],
        "createdAt": "2026-06-01T12:00:00Z"
      }
    ],
    "averageRating": 4.2,
    "totalCount": 8
  }
}
```

### POST `/products/:productId/reviews`

> 해당 상품을 포함한 주문이 `배송완료` 상태인 경우에만 작성 가능합니다.

`Request Body`

| 필드          | 타입       | 필수 | 설명                                    |
| ------------- | ---------- | ---- | --------------------------------------- |
| `orderItemId` | `int`      | ✓    | 리뷰 대상 주문 상품 ID (중복 작성 방지) |
| `rating`      | `int`      | ✓    | 평점 (1~5)                              |
| `content`     | `string`   | ✓    | 리뷰 내용                               |
| `images`      | `string[]` | ✗    | 리뷰 이미지 URL 목록                    |

```json
{
  "orderItemId": 55,
  "rating": 4,
  "content": "string",
  "images": ["string"]
}
```
