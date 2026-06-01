# CookEat API 명세서

> **Base URL** : `/api/v1`
> **인증 방식** : JWT Bearer Token (`Authorization: Bearer <token>`)
> **공통 응답 포맷**
>
> ```json
> {
>   "success": true,
>   "data": { ... },
>   "message": "OK"
> }
> ```

---

## 목차

| # | 파일 | 포함 도메인 |
| --- | --- | --- |
| 1 | [api/01-auth.md](api/01-auth.md) | Auth · 인증, User · 회원 |
| 2 | [api/02-recipe.md](api/02-recipe.md) | Recipe · 레시피, Ingredient · 식재료 |
| 3 | [api/03-product.md](api/03-product.md) | Product · 마켓 상품, Cart · 장바구니 |
| 4 | [api/04-order.md](api/04-order.md) | Order · 주문 결제, Review · 리뷰 |
| 5 | [api/05-social.md](api/05-social.md) | Bookmark · 북마크/좋아요, Point · 포인트, Inquiry · 문의 |
| 6 | [api/06-seller.md](api/06-seller.md) | Seller · 판매자 |
| 7 | [api/07-admin.md](api/07-admin.md) | Admin · 관리자 |
| 8 | [api/08-schema.md](api/08-schema.md) | DB 스키마 |

---

## 공통 에러 코드

| HTTP Status | 코드 | 설명 |
| --- | --- | --- |
| 400 | `INVALID_PARAMS` | 잘못된 요청 파라미터 |
| 401 | `UNAUTHORIZED` | 인증 토큰 없음 또는 만료 |
| 403 | `FORBIDDEN` | 권한 없음 |
| 404 | `NOT_FOUND` | 리소스 없음 |
| 409 | `CONFLICT` | 중복 요청 (이미 좋아요 등) |
| 422 | `UNPROCESSABLE` | 유효성 검사 실패 |
| 500 | `SERVER_ERROR` | 서버 내부 오류 |

`에러 응답 포맷`

```json
{
  "success": false,
  "data": null,
  "message": "에러 메시지",
  "code": "NOT_FOUND"
}
```
