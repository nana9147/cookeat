# 🍳 쿡잇 (Cookeat)

> **요리 레시피를 공유하고, 나만의 식단을 관리하는 푸드 커뮤니티 웹 서비스**

---

## 📖 목차

1. [프로젝트 개요](#-프로젝트-개요)
2. [실행 화면](#-실행-화면)
3. [핵심 기능](#-핵심-기능)
4. [기술 스택](#-기술-스택)
5. [프로젝트 구조](#-프로젝트-구조)
6. [API 문서](#-api-문서)
7. [설치 및 실행](#-설치-및-실행)
8. [팀 구성](#-팀-구성)
9. [라이선스](#-라이선스)

---

## ✨ 프로젝트 개요

| 항목               | 내용                                                                       |
| :----------------- | :------------------------------------------------------------------------- |
| 🎯 **목표**        | 레시피 공유와 식단 관리를 한 곳에서 즐길 수 있는 푸드 커뮤니티 서비스 구현 |
| 🧑‍🤝‍🧑 **대상 사용자** | 요리를 좋아하거나 건강한 식습관에 관심 있는 누구나                         |
| 📅 **개발 기간**   | 2026.05.27 ~ 2026.07.08 (5주)                                              |

---

## 🎬 실행 화면

### 홈

> 스크린샷 추가 예정

### 레시피 목록

> 스크린샷 추가 예정

### 재료 구매 목록

> 스크린샷 추가 예정

---

## 🧩 핵심 기능

### 📄 페이지

| 페이지         | 설명                                          |
| :------------- | :-------------------------------------------- |
| 🏠 **Home**    | 메인 페이지 — 인기 레시피 및 최신 게시글 노출 |
| 🍽️ **Recipes** | 레시피 목록 — 검색 및 카테고리 필터           |
| 👤 **My Page** | 내 정보 수정, 내 레시피, 즐겨찾기             |

### 🔐 인증 시스템

- 로그인 / 회원가입
- JWT 토큰 기반 접근 권한 설정
- 비로그인 시 보호 페이지 접근 차단 → 로그인 페이지 리다이렉트

### 🎨 UI/UX

- 모바일 반응형 디자인

---

## 🛠 기술 스택

| 구분           | 기술                       |
| :------------- | :------------------------- |
| **Frontend**   | Next.js, React, TypeScript |
| **상태 관리**  | Zustand                    |
| **스타일링**   | Tailwind CSS               |
| **API / 통신** | Axios                      |
| **백엔드**     | Next Api Route             |
| **DB**         | SupaBase                   |
| **배포**       | Vercel                     |

### 📦 주요 라이브러리

| 라이브러리                       | 버전         | 용도                 |
| :------------------------------- | :----------- | :------------------- |
| `@supabase/supabase-js`          | ^2.107.0     | DB 클라이언트        |
| `axios`                          | ^1.16.1      | HTTP 통신            |
| `zustand`                        | ^5.0.14      | 전역 상태 관리       |
| `@tiptap/react` + extensions     | ^3.26.0      | 리치 텍스트 에디터   |
| `@tosspayments/tosspayments-sdk` | ^2.7.0       | 토스페이 결제 SDK    |
| `react-daum-postcode`            | ^4.0.0       | 카카오 주소 검색     |
| `@dnd-kit/core` + sortable       | ^6.3 / ^10   | 드래그 앤 드롭       |
| `shadcn` / `radix-ui`            | ^4.10 / ^1.4 | UI 컴포넌트          |
| `lucide-react`                   | ^1.17.0      | 아이콘               |
| `tailwind-merge` / `clsx`        | ^3.6 / ^2.1  | Tailwind 클래스 유틸 |

---

## 📂 프로젝트 구조

```text
cookeat/
├── public/                   # 정적 에셋 (이미지, 아이콘 등)
├── app/                      # Next.js App Router
│   ├── (auth)/               # 로그인·회원가입 라우트 그룹
│   ├── (main)/               # 메인 라우트 그룹 (board, cart, mypage, recipes)
│   ├── admin/                # 어드민 페이지
│   └── api/                  # API 라우트 (auth, admin, order, payment, seller, user)
├── components/
│   ├── (auth)/               # 페이지별 컴포넌트 (cart, login, mypage)
│   ├── Header/               # 헤더·사이드바
│   ├── Footer/               # 푸터
│   └── ui/                   # shadcn/ui 기본 컴포넌트
├── hooks/
│   ├── auth/                 # 인증 훅
│   └── user/                 # 유저 훅 (프로필·판매자 신청·주소)
├── services/
│   └── auth/                 # 인증 서비스 레이어 및 타입 정의
├── store/                    # Zustand 스토어 (인증·헤더 UI)
├── lib/                      # API 클라이언트·Supabase 인스턴스·유틸
├── types/                    # 공통 타입 정의
├── supabase/
│   └── migrations/           # DB 마이그레이션 파일
├── docs/                     # 프로젝트 문서
│   ├── api/                  # API 도메인별 상세 명세
│   ├── daily_log/            # 팀원별 데일리 로그
│   └── reviews/              # 리뷰 문서
├── next.config.ts
└── package.json
```

---

## 📋 API 문서

전체 API 명세는 [`docs/api.md`](docs/api.md)에서 확인할 수 있습니다.

| 파일                                    | 포함 도메인                                              |
| :-------------------------------------- | :------------------------------------------------------- |
| [01-auth.md](docs/api/01-auth.md)       | Auth · 인증, User · 회원                                 |
| [02-recipe.md](docs/api/02-recipe.md)   | Recipe · 레시피, Ingredient · 식재료                     |
| [03-product.md](docs/api/03-product.md) | Product · 마켓 상품, Cart · 장바구니                     |
| [04-order.md](docs/api/04-order.md)     | Order · 주문 결제, Review · 리뷰                         |
| [05-social.md](docs/api/05-social.md)   | Bookmark · 북마크/좋아요, Point · 포인트, Inquiry · 문의 |
| [06-seller.md](docs/api/06-seller.md)   | Seller · 판매자                                          |
| [07-admin.md](docs/api/07-admin.md)     | Admin · 관리자                                           |
| [08-schema.md](docs/api/08-schema.md)   | DB 스키마                                                |

---

## ⚙️ 설치 및 실행

```bash
# 1. 저장소 클론
git clone https://github.com/djsy01/Cookeat.git

# 2. 폴더 이동
cd cookeat

# 3. 의존성 설치
npm install

# 4. 개발 서버 실행
npm run dev
```

### 환경 변수

프로젝트 루트에 `.env.local` 파일을 생성하고 아래 값을 설정하세요.

```env
# SupaBase
# Supabase 프로젝트 URL — Settings > API > Project URL
NEXT_PUBLIC_SUPABASE_URL=

# 브라우저에 노출해도 안전한 공개 키 — Settings > API > Project API keys > anon (public)
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=

# 서버 전용 관리자 키 (RLS 우회, 절대 클라이언트에 노출 금지) — Settings > API > Project API keys > service_role
SUPABASE_SERVICE_ROLE_KEY=

# KakaoPay
KAKAO_SECRET_KEY=
KAKAO_CID=
NEXT_PUBLIC_BASE_URL=

# TossPay (테스트 키)
NEXT_PUBLIC_TOSS_CLIENT_KEY=
TOSS_SECRET_KEY=

# JWT
JWT_SECRET=
```

---

## 🧑‍💻 팀 구성

|  이름  | 역할 |                        GitHub                        |
| :----: | :--: | :--------------------------------------------------: |
| 최유종 | 팀장 |         [@jjong0](https://github.com/jjong0)         |
| 홍정빈 | 팀원 | [@jbhong3010-ops](https://github.com/jbhong3010-ops) |
| 엄인호 | 팀원 |         [@djsy01](https://github.com/djsy01)         |
| 추유나 | 팀원 |       [@nana9147](https://github.com/nana9147)       |

---

## 🔒 라이선스

이 프로젝트는 [MIT License](./LICENSE.md)를 따릅니다.
