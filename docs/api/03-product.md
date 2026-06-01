# 03. Product · 마켓 상품 / Cart · 장바구니

[← 목차로 돌아가기](../api.md)

---

## Product · 마켓 상품

| Method | Endpoint | 설명 | 인증 |
| --- | --- | --- | --- |
| GET | `/products` | 상품 목록 검색 | ✗ |
| GET | `/products/:productId` | 상품 상세 조회 | ✗ |
| GET | `/products/category/:ingredientId` | 동일 카테고리 대체 상품 목록 | ✗ |

### GET `/products`

`Query Parameters`

| 파라미터 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| `keyword` | `string` | ✗ | 상품명 검색 |
| `page` | `int` | ✗ | 페이지 번호 |
| `limit` | `int` | ✗ | 페이지당 항목 수 |

`Response 200`

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `productId` | `int` | 상품 고유 ID |
| `name` | `string` | 상품명 |
| `price` | `int` | 가격 (원) |
| `image` | `string` | 상품 이미지 URL |
| `brand` | `string` | 브랜드명 |
| `ingredientId` | `int` | 연결 식재료 ID |

```json
{
  "success": true,
  "data": {
    "products": [
      {
        "productId": 100,
        "name": "목초란 10구",
        "price": 4500,
        "image": "string",
        "brand": "string",
        "ingredientId": 10
      }
    ],
    "pagination": { "page": 1, "limit": 20, "total": 50, "hasNext": true }
  }
}
```

---

### GET `/products/:productId`

`Path Parameters`

| 파라미터 | 타입 | 설명 |
| --- | --- | --- |
| `productId` | `int` | 상품 고유 ID |

`Response 200`

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `productId` | `int` | 상품 고유 ID |
| `name` | `string` | 상품명 |
| `price` | `int` | 가격 (원) |
| `image` | `string` | 상품 이미지 URL |
| `brand` | `string` | 브랜드명 |
| `description` | `string` | 상품 상세 설명 |
| `stock` | `int` | 재고 수량 |
| `ingredientId` | `int` | 연결 식재료 ID |
| `sellerId` | `int` | 판매자 ID |

```json
{
  "success": true,
  "data": {
    "productId": 100,
    "name": "목초란 10구",
    "price": 4500,
    "image": "string",
    "brand": "string",
    "description": "string",
    "stock": 200,
    "ingredientId": 10,
    "sellerId": 5
  }
}
```

---

## Cart · 장바구니

> 장바구니는 `Zustand + LocalStorage persist`로 프론트에서 관리.
> 아래 API는 **재고 확인** 및 **최신 상품 정보 동기화** 목적으로 사용.

| Method | Endpoint | 설명 | 인증 |
| --- | --- | --- | --- |
| POST | `/cart/sync` | 장바구니 상품 정보 일괄 동기화 | ✗ |

### POST `/cart/sync`

`Request Body`

| 필드 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| `items[].productId` | `int` | ✓ | 상품 ID |
| `items[].quantity` | `int` | ✓ | 수량 |

```json
{
  "items": [
    { "productId": 100, "quantity": 2 },
    { "productId": 101, "quantity": 1 }
  ]
}
```

`Response 200`

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `productId` | `int` | 상품 ID |
| `name` | `string` | 상품명 |
| `price` | `int` | 가격 (원) |
| `image` | `string` | 상품 이미지 URL |
| `quantity` | `int` | 요청 수량 |
| `stock` | `int` | 현재 재고 |
| `isAvailable` | `boolean` | 구매 가능 여부 |

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "productId": 100,
        "name": "목초란 10구",
        "price": 4500,
        "image": "string",
        "quantity": 2,
        "stock": 50,
        "isAvailable": true
      }
    ]
  }
}
```
