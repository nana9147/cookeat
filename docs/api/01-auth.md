# 01. Auth · 인증 / User · 회원

[← 목차로 돌아가기](../api.md)

---

## Auth · 인증

| Method | Endpoint         | 설명        | 인증 |
| ------ | ---------------- | ----------- | ---- |
| POST   | `/auth/signup`   | 회원가입    | ✗    |
| POST   | `/auth/login`    | 로그인      | ✗    |
| POST   | `/auth/logout`   | 로그아웃    | ✓    |
| POST   | `/auth/refresh`  | 토큰 재발급 | ✗    |
| DELETE | `/auth/withdraw` | 회원 탈퇴   | ✓    |

### POST `/auth/signup`

`Request Body`

| 필드       | 타입     | 필수 | 설명                        |
| ---------- | -------- | ---- | --------------------------- |
| `email`    | `string` | ✓    | 이메일 (형식 검사)          |
| `password` | `string` | ✓    | 비밀번호 (8자 이상)         |
| `nickname` | `string` | ✓    | 닉네임                      |
| `phone`    | `string` | ✓    | 휴대폰 번호 (010-0000-0000) |

```json
{
  "email": "user@example.com",
  "password": "string",
  "nickname": "string",
  "phone": "010-0000-0000"
}
```

`Response 201`

| 필드       | 타입     | 설명           |
| ---------- | -------- | -------------- |
| `userId`   | `int`    | 사용자 고유 ID |
| `email`    | `string` | 이메일         |
| `nickname` | `string` | 닉네임         |

```json
{
  "success": true,
  "data": {
    "userId": 1,
    "email": "user@example.com",
    "nickname": "string"
  }
}
```

---

### POST `/auth/login`

`Request Body`

| 필드       | 타입     | 필수 | 설명     |
| ---------- | -------- | ---- | -------- |
| `email`    | `string` | ✓    | 이메일   |
| `password` | `string` | ✓    | 비밀번호 |

```json
{
  "email": "user@example.com",
  "password": "string"
}
```

`Response 200`

| 필드                | 타입            | 설명              |
| ------------------- | --------------- | ----------------- |
| `accessToken`       | `string`        | JWT 액세스 토큰   |
| `refreshToken`      | `string`        | JWT 리프레시 토큰 |
| `user.userId`       | `int`           | 사용자 고유 ID    |
| `user.nickname`     | `string`        | 닉네임            |
| `user.profileImage` | `string / null` | 프로필 이미지 URL |

```json
{
  "success": true,
  "data": {
    "accessToken": "string",
    "refreshToken": "string",
    "user": {
      "userId": 1,
      "nickname": "string",
      "profileImage": "string | null"
    }
  }
}
```

---

## User · 회원

| Method | Endpoint              | 설명               | 인증 |
| ------ | --------------------- | ------------------ | ---- |
| GET    | `/users/me`           | 내 프로필 조회     | ✓    |
| PATCH  | `/users/me`           | 프로필 수정        | ✓    |
| PATCH  | `/users/me/password`  | 비밀번호 변경      | ✓    |
| GET    | `/users/me/orders`    | 주문 내역 조회     | ✓    |
| GET    | `/users/me/recipes`   | 내가 작성한 레시피 | ✓    |
| GET    | `/users/me/bookmarks` | 위시리스트/찜 조회 | ✓    |

### GET `/users/me`

`Response 200`

| 필드           | 타입            | 설명              |
| -------------- | --------------- | ----------------- |
| `userId`       | `int`           | 사용자 고유 ID    |
| `email`        | `string`        | 이메일            |
| `nickname`     | `string`        | 닉네임            |
| `profileImage` | `string / null` | 프로필 이미지 URL |
| `point`        | `int`           | 보유 포인트       |
| `createdAt`    | `string`        | 가입일 (ISO 8601) |

```json
{
  "success": true,
  "data": {
    "userId": 1,
    "email": "user@example.com",
    "nickname": "string",
    "profileImage": "string | null",
    "point": 3000,
    "createdAt": "2026-05-27T00:00:00Z"
  }
}
```

### PATCH `/users/me`

`Request Body` (변경할 필드만)

| 필드           | 타입            | 필수 | 설명              |
| -------------- | --------------- | ---- | ----------------- |
| `nickname`     | `string`        | ✗    | 새 닉네임         |
| `profileImage` | `string / null` | ✗    | 프로필 이미지 URL |

```json
{
  "nickname": "string",
  "profileImage": "string | null"
}
```

### PATCH `/users/me/password`

`Request Body`

| 필드              | 타입     | 필수 | 설명          |
| ----------------- | -------- | ---- | ------------- |
| `currentPassword` | `string` | ✓    | 현재 비밀번호 |
| `newPassword`     | `string` | ✓    | 새 비밀번호   |

```json
{
  "currentPassword": "string",
  "newPassword": "string"
}
```
