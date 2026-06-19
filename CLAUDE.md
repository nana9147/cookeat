# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## 프로젝트 컨텍스트

Cookeat는 레시피 공유와 식재료 마켓을 결합한 푸드 커뮤니티 서비스입니다. 일반 사용자·판매자·관리자 세 역할을 포함하며, TossPay / KakaoPay 결제와 Tiptap 리치 텍스트 에디터를 사용합니다. 팀 규모: 4명.

## 기술 스택

### Frontend
- Framework: Next.js 16 (App Router)
- Language: TypeScript (`strict: true`)
- Styling: Tailwind CSS v4 + shadcn/ui (radix-ui)
- State: Zustand v5
- HTTP: Axios (`lib/api.ts`)

### Backend
- API: Next.js API Routes (`app/api/`)
- DB: Supabase (PostgreSQL) + `@supabase/supabase-js`
- Auth: Supabase Auth (이메일/소셜) + 커스텀 role 관리

### DevOps
- Package Manager: npm
- CI/CD: GitHub Actions
- Hosting: Vercel

## 주요 명령어

```bash
npm run dev       # 개발 서버 (localhost:3000)
npm run build     # 프로덕션 빌드
npm run lint      # ESLint 검사
npm run format    # Prettier 일괄 포맷
```

테스트 러너 미설정 — 현재 테스트 파일 없음.

## 코드 컨벤션

### TypeScript
- `strict: true` 모드 — `any` 사용 금지
- 명시적 반환 타입 선호, 단순 유틸은 추론 허용
- 경로 alias `@/*` 사용 (상대 경로 `../../` 지양)

### 네이밍
- 컴포넌트 파일: PascalCase (`ProductCard.tsx`)
- 훅: camelCase + `use` 접두사 (`useFilter.ts`)
- 상수: UPPER_SNAKE_CASE
- 일반 파일/폴더: camelCase

### 포맷 (`.prettierrc`)
- `singleQuote: true`, `semi: true`, `tabWidth: 2`, `printWidth: 100`, `trailingComma: "es5"`

### Import 순서
1. React 및 외부 라이브러리
2. 내부 컴포넌트 (`@/components/`)
3. 훅·서비스·스토어 (`@/hooks/`, `@/services/`, `@/store/`)
4. 유틸·lib (`@/lib/`)
5. 타입 정의

### Server vs Client Components
- 기본: Server Component
- 브라우저 API·이벤트 핸들러·훅 사용 시만 `'use client'` 추가

## 아키텍처

### 세 개의 포털

| 경로 | 대상 | 레이아웃 |
|------|------|----------|
| `app/(auth)/` | 로그인·회원가입 | 헤더·푸터 없음 |
| `app/(main)/` | 일반 사용자 | Header + Footer |
| `app/seller/` | 판매자 | Header + Sidebar |
| `app/admin/` | 관리자 | Header + Sidebar + `AdminAuthGuard` |


### ⚠️ Supabase 클라이언트 이중 구조 — 혼용 금지

| 파일 | 키 | 사용 위치 |
|------|----|-----------|
| `lib/supabase.ts` | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | 클라이언트 컴포넌트 |
| `lib/supabaseAdmin.ts` | `SUPABASE_SERVICE_ROLE_KEY` | **`app/api/` 라우트 전용** |

`supabaseAdmin`은 RLS를 우회합니다. 클라이언트 번들에 포함되면 전체 DB 권한이 노출됩니다.

### 인증 흐름

1. `POST /api/auth/login` → Supabase Auth + `users` 테이블 role 조회
2. Zustand `authStore` 에 토큰 저장. `keepLogin` 여부에 따라 localStorage / sessionStorage 분기
3. `AuthInitializer` (루트 레이아웃 마운트) — 앱 시작 시 storage → Supabase에 세션 복원
4. `lib/api.ts` Axios 인터셉터 — 401 시 자동 갱신 후 재시도 (동시 요청은 내부 큐로 처리)

### API 라우트 인증 가드

```ts
// lib/serverAuth.ts 패턴
const result = await requireAuth(req)      // 로그인 필요
const result = await requireSeller(req)    // seller 또는 admin
const result = await requireAdmin(req)     // admin 전용
if (result instanceof NextResponse) return result
// 성공: AuthedUser { authId, userId, role }
```

### 판매자 컨텍스트 헬퍼

판매자 API 라우트에서는 `requireSeller` 대신 `requireSellerContext`를 사용한다. admin이 `?sellerId=` 쿼리로 특정 판매자를 대리 조회하는 경우까지 처리한다.

```ts
// lib/sellerContext.ts 패턴
const sellerCtx = await requireSellerContext(req)
if (sellerCtx instanceof NextResponse) return sellerCtx
// 성공: SellerContext { userId, sellerId, role }
```

### 컴포넌트 위치 규칙

- `components/` — 앱 전체 공유 (Header, Footer, `ui/` shadcn)
- `app/seller/components/`, `app/admin/components/` — 포털 전용
- 페이지 로컬 컴포넌트 → 해당 페이지 폴더 아래 `_components/` 서브폴더

### 상태 관리

- `store/authStore.ts` — 인증 토큰·사용자 정보·keepLogin
- `store/headerStore.ts` — 헤더 사이드바 UI 상태
- `store/cartStore.ts` — 장바구니 (Zustand persist)

### 서버 전용 lib

- `lib/products.ts` — `server-only` 선언. 클라이언트 번들에 임포트하면 빌드 에러.
- `lib/shipping.ts` — 배송비 상수(`FREE_SHIPPING_THRESHOLD`, `SHIPPING_FEE`)와 `calcShipping()`. 클라이언트·서버 모두 이 파일을 참조해야 하드코딩 분산을 막는다.

## 보안 요구사항

- `.env.local` 절대 커밋 금지 (`SUPABASE_SERVICE_ROLE_KEY`, `TOSS_SECRET_KEY` 등 포함)
- API 라우트에서 사용자 입력은 반드시 `lib/validators.ts` 또는 인라인 검증 후 처리
- SQL Injection: Supabase client 체이닝 사용 (raw SQL 금지)
- 권한 체크는 `lib/serverAuth.ts` 함수로 통일 — 직접 토큰 파싱 금지

## 환경 변수

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
KAKAO_SECRET_KEY=
KAKAO_CID=
NEXT_PUBLIC_BASE_URL=
NEXT_PUBLIC_TOSS_CLIENT_KEY=
TOSS_SECRET_KEY=
JWT_SECRET=
```

## API 명세

`docs/api/` 폴더에 도메인별 상세 명세가 있습니다.

- `01-auth.md` — 인증·회원
- `02-recipe.md` — 레시피·식재료
- `03-product.md` — 마켓 상품·장바구니
- `04-order.md` — 주문·결제·리뷰
- `05-social.md` — 북마크·포인트·문의
- `06-seller.md` — 판매자
- `07-admin.md` — 관리자
- `08-schema.md` — DB 스키마
