# 06. Seller · 판매자

[← 목차로 돌아가기](../api.md)

> **인증** : 판매자 계정 JWT 필요 (`role: seller`)

---

## 엔드포인트 목록

| Method | Endpoint                           | 설명                      | 인증 |
| ------ | ---------------------------------- | ------------------------- | ---- |
| GET    | `/seller/me`                       | 판매자 정보 조회          | ✓    |
| PATCH  | `/seller/me`                       | 판매자 정보 수정          | ✓    |
| GET    | `/seller/dashboard`                | 대시보드 (매출/주문 요약) | ✓    |
| GET    | `/seller/products`                 | 내 상품 목록              | ✓    |
| POST   | `/seller/products`                 | 상품 등록                 | ✓    |
| PATCH  | `/seller/products/:productId`      | 상품 수정                 | ✓    |
| DELETE | `/seller/products/:productId`      | 상품 삭제                 | ✓    |
| GET    | `/seller/orders`                   | 주문 관리 목록            | ✓    |
| PATCH  | `/seller/orders/:orderId/status`   | 주문 상태 변경            | ✓    |
| GET    | `/seller/orders/:orderId/shipping` | 배송 정보 조회            | ✓    |
| PATCH  | `/seller/orders/:orderId/shipping` | 운송장 업데이트           | ✓    |
| GET    | `/seller/inventory`                | 재고 현황                 | ✓    |
| PATCH  | `/seller/inventory/:productId`     | 재고 수량 수정            | ✓    |
| GET    | `/seller/sales`                    | 판매 내역 / 정산 관리     | ✓    |

---

### GET `/seller/me`

`Response 200`

| 필드             | 타입      | 설명              |
| ---------------- | --------- | ----------------- |
| `sellerId`       | `int`     | 판매자 고유 ID    |
| `storeName`      | `string`  | 상호명            |
| `email`          | `string`  | 이메일            |
| `phone`          | `string`  | 연락처            |
| `businessNumber` | `string`  | 사업자 번호       |
| `bankName`       | `string`  | 정산 은행         |
| `bankAccount`    | `string`  | 정산 계좌번호     |
| `isApproved`     | `boolean` | 승인 여부         |
| `createdAt`      | `string`  | 가입일 (ISO 8601) |

```json
{
  "success": true,
  "data": {
    "sellerId": 5,
    "storeName": "건강한 농장",
    "email": "seller@example.com",
    "phone": "010-0000-0000",
    "businessNumber": "000-00-00000",
    "bankName": "국민은행",
    "bankAccount": "123456-78-901234",
    "isApproved": true,
    "createdAt": "2026-01-01T00:00:00Z"
  }
}
```

---

### GET `/seller/dashboard`

`Response 200`

| 필드             | 타입  | 설명                   |
| ---------------- | ----- | ---------------------- |
| `todaySales`     | `int` | 오늘 매출 (원)         |
| `monthSales`     | `int` | 이번달 누적 매출 (원)  |
| `pendingOrders`  | `int` | 신규 주문 수 (처리 전) |
| `shippingOrders` | `int` | 배송중 주문 수         |
| `totalProducts`  | `int` | 등록 상품 수           |
| `lowStockCount`  | `int` | 재고 부족 상품 수      |

```json
{
  "success": true,
  "data": {
    "todaySales": 350000,
    "monthSales": 5200000,
    "pendingOrders": 12,
    "shippingOrders": 37,
    "totalProducts": 48,
    "lowStockCount": 3
  }
}
```

---

### GET `/seller/products`

`Query Parameters`

| 파라미터  | 타입     | 필수 | 설명                                 |
| --------- | -------- | ---- | ------------------------------------ |
| `keyword` | `string` | ✗    | 상품명 검색                          |
| `status`  | `string` | ✗    | 판매 상태 (`판매중`, `품절`, `숨김`) |
| `page`    | `int`    | ✗    | 페이지 번호                          |
| `limit`   | `int`    | ✗    | 페이지당 항목 수                     |

`Response 200`

| 필드         | 타입     | 설명              |
| ------------ | -------- | ----------------- |
| `productId`  | `int`    | 상품 ID           |
| `name`       | `string` | 상품명            |
| `price`      | `int`    | 가격 (원)         |
| `stock`      | `int`    | 재고 수량         |
| `status`     | `string` | 판매 상태         |
| `salesCount` | `int`    | 누적 판매 수      |
| `createdAt`  | `string` | 등록일 (ISO 8601) |

```json
{
  "success": true,
  "data": {
    "products": [
      {
        "productId": 100,
        "name": "목초란 10구",
        "price": 4500,
        "stock": 200,
        "status": "판매중",
        "salesCount": 1234,
        "createdAt": "2026-01-15T00:00:00Z"
      }
    ],
    "pagination": { "page": 1, "limit": 20, "total": 48, "hasNext": true }
  }
}
```

---

### POST `/seller/products`

`Request Body`

| 필드           | 타입       | 필수 | 설명                 |
| -------------- | ---------- | ---- | -------------------- |
| `name`         | `string`   | ✓    | 상품명               |
| `price`        | `int`      | ✓    | 가격 (원)            |
| `stock`        | `int`      | ✓    | 초기 재고 수량       |
| `description`  | `string`   | ✓    | 상품 설명            |
| `image`        | `string`   | ✓    | 대표 이미지 URL      |
| `images`       | `string[]` | ✗    | 추가 이미지 URL 목록 |
| `ingredientId` | `int`      | ✗    | 연결 식재료 ID       |
| `brand`        | `string`   | ✗    | 브랜드명             |

```json
{
  "name": "목초란 10구",
  "price": 4500,
  "stock": 200,
  "description": "string",
  "image": "string",
  "images": ["string"],
  "ingredientId": 10,
  "brand": "string"
}
```

---

### PATCH `/seller/orders/:orderId/status`

`Request Body`

| 필드     | 타입     | 필수 | 설명                                                            |
| -------- | -------- | ---- | --------------------------------------------------------------- |
| `status` | `string` | ✓    | 변경할 주문 상태 (`주문확인`, `배송준비`, `배송중`, `배송완료`) |

```json
{ "status": "배송준비" }
```

---

### PATCH `/seller/orders/:orderId/shipping`

`Request Body`

| 필드             | 타입     | 필수 | 설명        |
| ---------------- | -------- | ---- | ----------- |
| `carrier`        | `string` | ✓    | 택배사명    |
| `trackingNumber` | `string` | ✓    | 운송장 번호 |

```json
{ "carrier": "CJ대한통운", "trackingNumber": "123456789012" }
```

---

### GET `/seller/inventory`

`Response 200`

| 필드        | 타입      | 설명           |
| ----------- | --------- | -------------- |
| `productId` | `int`     | 상품 ID        |
| `name`      | `string`  | 상품명         |
| `stock`     | `int`     | 현재 재고      |
| `minStock`  | `int`     | 최소 재고 기준 |
| `isLow`     | `boolean` | 재고 부족 여부 |

```json
{
  "success": true,
  "data": {
    "inventory": [
      { "productId": 100, "name": "목초란 10구", "stock": 15, "minStock": 20, "isLow": true }
    ]
  }
}
```

### PATCH `/seller/inventory/:productId`

`Request Body`

| 필드    | 타입  | 필수 | 설명                      |
| ------- | ----- | ---- | ------------------------- |
| `stock` | `int` | ✓    | 변경할 재고 수량 (0 이상) |

```json
{ "stock": 100 }
```

---

### GET `/seller/sales`

`Query Parameters`

| 파라미터    | 타입     | 필수 | 설명                     |
| ----------- | -------- | ---- | ------------------------ |
| `startDate` | `string` | ✗    | 조회 시작일 (YYYY-MM-DD) |
| `endDate`   | `string` | ✗    | 조회 종료일 (YYYY-MM-DD) |
| `page`      | `int`    | ✗    | 페이지 번호              |

`Response 200`

| 필드                    | 타입            | 설명                    |
| ----------------------- | --------------- | ----------------------- |
| `totalRevenue`          | `int`           | 기간 총 매출 (원)       |
| `totalFee`              | `int`           | 플랫폼 수수료 합계 (원) |
| `totalSettlement`       | `int`           | 정산 예정 금액 (원)     |
| `records[].orderId`     | `string`        | 주문 ID                 |
| `records[].productName` | `string`        | 상품명                  |
| `records[].quantity`    | `int`           | 판매 수량               |
| `records[].amount`      | `int`           | 매출 금액 (원)          |
| `records[].fee`         | `int`           | 수수료 (원)             |
| `records[].settlement`  | `int`           | 정산 금액 (원)          |
| `records[].settledAt`   | `string / null` | 정산 완료 일시          |

```json
{
  "success": true,
  "data": {
    "totalRevenue": 5200000,
    "totalFee": 260000,
    "totalSettlement": 4940000,
    "records": [
      {
        "orderId": "ORD-20260601-000001",
        "productName": "목초란 10구",
        "quantity": 3,
        "amount": 13500,
        "fee": 675,
        "settlement": 12825,
        "settledAt": "2026-06-05T00:00:00Z"
      }
    ],
    "pagination": { "page": 1, "limit": 20, "total": 120, "hasNext": true }
  }
}
```
