# 05. Bookmark · 북마크/좋아요 / Point · 포인트 / Inquiry · 문의

[← 목차로 돌아가기](../api.md)

---

## Bookmark · 북마크 좋아요

| Method | Endpoint | 설명 | 인증 |
| --- | --- | --- | --- |
| POST | `/recipes/:recipeId/like` | 좋아요 토글 | ✓ |
| POST | `/recipes/:recipeId/bookmark` | 북마크 토글 | ✓ |

`Response 200` (좋아요/북마크 공통)

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `isActive` | `boolean` | 현재 활성 상태 |
| `count` | `int` | 총 좋아요/북마크 수 |

```json
{
  "success": true,
  "data": { "isActive": true, "count": 121 }
}
```

---

## Point · 포인트

| Method | Endpoint | 설명 | 인증 |
| --- | --- | --- | --- |
| GET | `/users/me/points` | 포인트 잔액 및 내역 조회 | ✓ |

`Response 200`

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `balance` | `int` | 현재 포인트 잔액 |
| `history[].pointId` | `int` | 포인트 내역 ID |
| `history[].type` | `string` | 유형 (`적립`, `사용`) |
| `history[].amount` | `int` | 포인트 금액 |
| `history[].description` | `string` | 내역 설명 |
| `history[].createdAt` | `string` | 일시 (ISO 8601) |

```json
{
  "success": true,
  "data": {
    "balance": 3000,
    "history": [
      {
        "pointId": 1,
        "type": "적립",
        "amount": 500,
        "description": "레시피 구매 적립",
        "createdAt": "2026-05-30T10:00:00Z"
      }
    ]
  }
}
```

---

## Inquiry · 문의

| Method | Endpoint | 설명 | 인증 |
| --- | --- | --- | --- |
| GET | `/inquiries` | 내 문의 목록 조회 | ✓ |
| POST | `/inquiries` | 문의 등록 | ✓ |
| GET | `/inquiries/:inquiryId` | 문의 상세 조회 | ✓ |

### POST `/inquiries`

`Request Body`

| 필드 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| `category` | `string` | ✓ | 문의 유형 (`주문문의`, `상품문의`, `배송문의`, `기타`) |
| `title` | `string` | ✓ | 문의 제목 |
| `content` | `string` | ✓ | 문의 내용 |
| `images` | `string[]` | ✗ | 첨부 이미지 URL 목록 |

```json
{
  "category": "주문문의",
  "title": "string",
  "content": "string",
  "images": ["string"]
}
```

`Response 201`

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `inquiryId` | `int` | 문의 고유 ID |
| `isAnswered` | `boolean` | 답변 완료 여부 (inquiry_replies 존재 여부로 파생) |
| `createdAt` | `string` | 등록 일시 (ISO 8601) |

```json
{
  "success": true,
  "data": {
    "inquiryId": 1,
    "isAnswered": false,
    "createdAt": "2026-06-01T12:00:00Z"
  }
}
```
