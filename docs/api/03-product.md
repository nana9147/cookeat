# 03. Product · 마켓 상품 / Cart · 장바구니

[← 목차로 돌아가기](../api.md)

---

## Product · 마켓 상품

| Method | Endpoint                           | 설명                         | 인증 |
| ------ | ---------------------------------- | ---------------------------- | ---- |
| GET    | `/products`                        | 상품 목록 검색               | ✗    |
| GET    | `/products/:productId`             | 상품 상세 조회               | ✗    |
| GET    | `/products/category/:ingredientId` | 동일 카테고리 대체 상품 목록 | ✗    |

### GET `/products`

`Query Parameters`

| 파라미터   | 타입     | 필수 | 설명                                                                                          |
| ---------- | -------- | ---- | --------------------------------------------------------------------------------------------- |
| `keyword`  | `string` | ✗    | 상품명 검색                                                                                   |
| `category` | `string` | ✗    | 대카테고리 필터 (`ingredients.category` 값: 채소 / 과일·견과·쌀 / 수산·해산물·건어물 / 정육·가공육·달걀 / 면·양념·오일 / 베이커리 / 유제품 / 가공식품) |
| `minPrice` | `int`    | ✗    | 최소 가격 (원)                                                                                |
| `maxPrice` | `int`    | ✗    | 최대 가격 (원)                                                                                |
| `sellers`  | `string` | ✗    | 판매자 필터 (쉼표 구분, 예: `판매자A,판매자B`)                                                |
| `sort`     | `string` | ✗    | 정렬 기준 (`추천순` / `신상품순` / `낮은가격순` / `높은가격순` / `별점순`, 기본값: `추천순`) |
| `page`     | `int`    | ✗    | 페이지 번호 (기본값: 1)                                                                       |
| `limit`    | `int`    | ✗    | 페이지당 항목 수 (기본값: 12, 최대: 50)                                                       |

`Response 200`

| 필드          | 타입     | 설명                                         |
| ------------- | -------- | -------------------------------------------- |
| `productId`   | `int`    | 상품 고유 ID                                 |
| `name`        | `string` | 상품명                                       |
| `price`       | `int`    | 가격 (원)                                    |
| `image`       | `string` | 상품 이미지 URL                              |
| `brand`       | `string` | 브랜드명                                     |
| `category`    | `string` | 대카테고리명 (`ingredients.category` 값)     |
| `seller`      | `string` | 판매자 상호명                                |
| `rating`      | `float`  | 평점 (0~5)                                   |
| `reviewCount` | `int`    | 리뷰 수                                      |
| `stock`       | `int`    | 재고 수량                                    |
| `createdAt`   | `string` | 등록일시                                     |
| `sellers`     | `string[]` | 전체 판매자 목록 (필터용)                  |

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
        "category": "정육·가공육·달걀",
        "seller": "하나로마트",
        "rating": 4.5,
        "reviewCount": 12,
        "stock": 200,
        "createdAt": "2026-01-08T00:00:00.000Z"
      }
    ],
    "sellers": ["하나로마트", "신선마켓"],
    "pagination": { "page": 1, "limit": 12, "total": 50, "hasNext": true }
  }
}
```

---

### GET `/products/:productId`

`Path Parameters`

| 파라미터    | 타입  | 설명         |
| ----------- | ----- | ------------ |
| `productId` | `int` | 상품 고유 ID |

`Response 200`

| 필드          | 타입       | 설명                                     |
| ------------- | ---------- | ---------------------------------------- |
| `productId`   | `int`      | 상품 고유 ID                             |
| `name`        | `string`   | 상품명                                   |
| `price`       | `int`      | 가격 (원)                                |
| `image`       | `string`   | 대표 이미지 URL                          |
| `images`      | `string[]` | 추가 이미지 URL 목록                     |
| `brand`       | `string`   | 브랜드명                                 |
| `description` | `string`   | 상품 상세 설명                           |
| `origin`      | `string`   | 원산지                                   |
| `stock`       | `int`      | 재고 수량                                |
| `ingredientId`| `int`      | 대카테고리 ID (`ingredients.ingredient_id`) |
| `category`    | `string`   | 대카테고리명 (`ingredients.category` 값) |
| `sellerId`    | `int`      | 판매자 ID                                |
| `seller`      | `string`   | 판매자 상호명                            |
| `sellerPhone` | `string`   | 판매자 연락처                            |
| `rating`      | `float`    | 평점 (0~5)                               |
| `reviewCount` | `int`      | 리뷰 수                                  |

```json
{
  "success": true,
  "data": {
    "productId": 100,
    "name": "목초란 10구",
    "price": 4500,
    "image": "string",
    "images": ["string"],
    "brand": "string",
    "description": "string",
    "origin": "국내산",
    "stock": 200,
    "ingredientId": 4,
    "category": "정육·가공육·달걀",
    "sellerId": 5,
    "seller": "하나로마트",
    "sellerPhone": "010-1234-5678",
    "rating": 4.5,
    "reviewCount": 12
  }
}
```

---

## Cart · 장바구니

> 장바구니는 `Zustand + LocalStorage persist`로 프론트에서 관리.
> 아래 API는 **재고 확인** 및 **최신 상품 정보 동기화** 목적으로 사용.

| Method | Endpoint     | 설명                           | 인증 |
| ------ | ------------ | ------------------------------ | ---- |
| POST   | `/cart/sync` | 장바구니 상품 정보 일괄 동기화 | ✗    |

### POST `/cart/sync`

`Request Body`

| 필드                | 타입  | 필수 | 설명    |
| ------------------- | ----- | ---- | ------- |
| `items[].productId` | `int` | ✓    | 상품 ID |
| `items[].quantity`  | `int` | ✓    | 수량    |

```json
{
  "items": [
    { "productId": 100, "quantity": 2 },
    { "productId": 101, "quantity": 1 }
  ]
}
```

`Response 200`

| 필드          | 타입      | 설명            |
| ------------- | --------- | --------------- |
| `productId`   | `int`     | 상품 ID         |
| `name`        | `string`  | 상품명          |
| `price`       | `int`     | 가격 (원)       |
| `image`       | `string`  | 상품 이미지 URL |
| `quantity`    | `int`     | 요청 수량       |
| `stock`       | `int`     | 현재 재고       |
| `isAvailable` | `boolean` | 구매 가능 여부  |

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
