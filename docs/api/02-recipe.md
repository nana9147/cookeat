# 02. Recipe · 레시피 / Ingredient · 식재료

[← 목차로 돌아가기](../api.md)

---

## Recipe · 레시피

| Method | Endpoint             | 설명                                      | 인증 |
| ------ | -------------------- | ----------------------------------------- | ---- |
| GET    | `/recipes`           | 레시피 목록 조회 (필터/정렬/페이지네이션) | ✗    |
| GET    | `/recipes/:recipeId` | 레시피 상세 조회                          | ✗    |
| POST   | `/recipes`           | 레시피 등록                               | ✓    |
| PATCH  | `/recipes/:recipeId` | 레시피 수정                               | ✓    |
| DELETE | `/recipes/:recipeId` | 레시피 삭제                               | ✓    |

### GET `/recipes`

`Query Parameters`

| 파라미터      | 타입       | 필수 | 설명                         | 예시                                 |
| ------------- | ---------- | ---- | ---------------------------- | ------------------------------------ |
| `ingredients` | `string[]` | ✗    | 보유 식재료 태그 (AND 조건)  | `?ingredients=대파&ingredients=계란` |
| `category`    | `string`   | ✗    | 카테고리                     | `한식`, `양식`, `다이어트`           |
| `sort`        | `string`   | ✗    | 정렬 기준                    | `popular`, `latest`, `scrap`         |
| `page`        | `int`      | ✗    | 페이지 번호 (기본값 1)       | `?page=1`                            |
| `limit`       | `int`      | ✗    | 페이지당 항목 수 (기본값 12) | `?limit=12`                          |

`Response 200`

| 필드               | 타입       | 설명                        |
| ------------------ | ---------- | --------------------------- |
| `recipeId`         | `int`      | 레시피 고유 ID              |
| `title`            | `string`   | 레시피 제목                 |
| `thumbnail`        | `string`   | 썸네일 이미지 URL           |
| `category`         | `string`   | 카테고리 (한식, 양식 등)    |
| `difficulty`       | `string`   | 난이도 (쉬움, 보통, 어려움) |
| `cookingTime`      | `int`      | 조리 시간 (분)              |
| `servings`         | `int`      | 인분 수                     |
| `likeCount`        | `int`      | 좋아요 수                   |
| `scrapCount`       | `int`      | 스크랩 수                   |
| `hasMarketProduct` | `boolean`  | 연결 상품 존재 여부         |
| `ingredients`      | `string[]` | 주요 식재료 목록            |
| `author.userId`    | `int`      | 작성자 ID                   |
| `author.nickname`  | `string`   | 작성자 닉네임               |

```json
{
  "success": true,
  "data": {
    "recipes": [
      {
        "recipeId": 1,
        "title": "계란볶음밥",
        "thumbnail": "string",
        "category": "한식",
        "difficulty": "쉬움",
        "cookingTime": 15,
        "servings": 2,
        "likeCount": 120,
        "scrapCount": 45,
        "hasMarketProduct": true,
        "ingredients": ["계란", "대파", "밥"],
        "author": { "userId": 1, "nickname": "string" }
      }
    ],
    "pagination": { "page": 1, "limit": 12, "total": 80, "hasNext": true }
  }
}
```

---

### GET `/recipes/:recipeId`

`Path Parameters`

| 파라미터   | 타입  | 설명           |
| ---------- | ----- | -------------- |
| `recipeId` | `int` | 레시피 고유 ID |

`Response 200`

| 필드                                    | 타입            | 설명                 |
| --------------------------------------- | --------------- | -------------------- |
| `recipeId`                              | `int`           | 레시피 고유 ID       |
| `title`                                 | `string`        | 레시피 제목          |
| `thumbnail`                             | `string`        | 썸네일 이미지 URL    |
| `category`                              | `string`        | 카테고리             |
| `difficulty`                            | `string`        | 난이도               |
| `cookingTime`                           | `int`           | 조리 시간 (분)       |
| `servings`                              | `int`           | 인분 수              |
| `description`                           | `string`        | 레시피 설명          |
| `likeCount`                             | `int`           | 좋아요 수            |
| `scrapCount`                            | `int`           | 스크랩 수            |
| `isLiked`                               | `boolean`       | 내가 좋아요 눌렀는지 |
| `isBookmarked`                          | `boolean`       | 내가 북마크 했는지   |
| `steps[].order`                         | `int`           | 조리 순서 번호       |
| `steps[].description`                   | `string`        | 조리 설명            |
| `steps[].image`                         | `string / null` | 조리 과정 이미지     |
| `recipeIngredients[].ingredientId`      | `int`           | 식재료 ID            |
| `recipeIngredients[].name`              | `string`        | 식재료명             |
| `recipeIngredients[].unit`              | `string`        | 단위 (개, g, ml 등)  |
| `recipeIngredients[].amount`            | `float`         | 수량                 |
| `recipeIngredients[].product.productId` | `int`           | 연결 상품 ID         |
| `recipeIngredients[].product.price`     | `int`           | 상품 가격 (원)       |

```json
{
  "success": true,
  "data": {
    "recipeId": 1,
    "title": "계란볶음밥",
    "thumbnail": "string",
    "category": "한식",
    "difficulty": "쉬움",
    "cookingTime": 15,
    "servings": 2,
    "description": "string",
    "likeCount": 120,
    "scrapCount": 45,
    "isLiked": false,
    "isBookmarked": false,
    "author": {
      "userId": 1,
      "nickname": "string",
      "profileImage": "string | null"
    },
    "steps": [
      { "order": 1, "description": "팬에 기름을 두르고 대파를 볶는다.", "image": "string | null" }
    ],
    "recipeIngredients": [
      {
        "ingredientId": 10,
        "name": "계란",
        "unit": "개",
        "amount": 2,
        "product": {
          "productId": 100,
          "name": "목초란 10구",
          "price": 4500,
          "image": "string",
          "marketUrl": "string"
        }
      }
    ]
  }
}
```

---

### POST `/recipes`

`Request Body`

| 필드                               | 타입            | 필수 | 설명              |
| ---------------------------------- | --------------- | ---- | ----------------- |
| `title`                            | `string`        | ✓    | 레시피 제목       |
| `thumbnail`                        | `string`        | ✓    | 썸네일 이미지 URL |
| `category`                         | `string`        | ✓    | 카테고리          |
| `difficulty`                       | `string`        | ✓    | 난이도            |
| `cookingTime`                      | `int`           | ✓    | 조리 시간 (분)    |
| `servings`                         | `int`           | ✓    | 인분 수           |
| `description`                      | `string`        | ✓    | 레시피 설명       |
| `steps[].order`                    | `int`           | ✓    | 조리 순서         |
| `steps[].description`              | `string`        | ✓    | 조리 설명         |
| `steps[].image`                    | `string / null` | ✗    | 조리 과정 이미지  |
| `recipeIngredients[].ingredientId` | `int`           | ✓    | 식재료 ID         |
| `recipeIngredients[].amount`       | `float`         | ✓    | 수량              |
| `recipeIngredients[].productId`    | `int`           | ✗    | 연결 상품 ID      |

```json
{
  "title": "string",
  "thumbnail": "string",
  "category": "한식",
  "difficulty": "쉬움",
  "cookingTime": 15,
  "servings": 2,
  "description": "string",
  "steps": [{ "order": 1, "description": "string", "image": "string | null" }],
  "recipeIngredients": [{ "ingredientId": 10, "amount": 2, "productId": 100 }]
}
```

---

## Ingredient · 식재료

| Method | Endpoint       | 설명                          | 인증 |
| ------ | -------------- | ----------------------------- | ---- |
| GET    | `/ingredients` | 식재료 목록 검색 (자동완성용) | ✗    |

### GET `/ingredients`

`Query Parameters`

| 파라미터  | 타입     | 필수 | 설명                   |
| --------- | -------- | ---- | ---------------------- |
| `keyword` | `string` | ✗    | 검색 키워드            |
| `limit`   | `int`    | ✗    | 최대 반환 수 (기본 10) |

`Response 200`

| 필드           | 타입     | 설명            |
| -------------- | -------- | --------------- |
| `ingredientId` | `int`    | 식재료 고유 ID  |
| `name`         | `string` | 식재료명        |
| `category`     | `string` | 식재료 카테고리 |

```json
{
  "success": true,
  "data": [
    { "ingredientId": 10, "name": "계란", "category": "단백질" },
    { "ingredientId": 11, "name": "계피", "category": "향신료" }
  ]
}
```
