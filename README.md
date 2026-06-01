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

### 게시판

> 스크린샷 추가 예정

---

## 🧩 핵심 기능

### 📄 페이지

| 페이지         | 설명                                          |
| :------------- | :-------------------------------------------- |
| 🏠 **Home**    | 메인 페이지 — 인기 레시피 및 최신 게시글 노출 |
| 🍽️ **Recipes** | 레시피 목록 — 검색 및 카테고리 필터           |
| 📋 **Board**   | 커뮤니티 게시판 — 게시글 작성 · 조회 · 댓글   |
| 👤 **My Page** | 내 정보 수정, 내 레시피, 즐겨찾기             |

### 🔐 인증 시스템

- 로그인 / 회원가입
- JWT 토큰 기반 접근 권한 설정
- 비로그인 시 보호 페이지 접근 차단 → 로그인 페이지 리다이렉트

### 🎨 UI/UX

- 모바일 반응형 디자인
- 다크 모드 지원

---

## 🛠 기술 스택

| 구분           | 기술                       |
| :------------- | :------------------------- |
| **Frontend**   | Next.js, React, TypeScript |
| **상태 관리**  | Zustand                    |
| **스타일링**   | Tailwind CSS               |
| **API / 통신** | Next.js API Routes         |
| **배포**       | Vercel                     |

### 📦 주요 라이브러리

> 추가 예정
> 추가 예

---

## 📂 프로젝트 구조

```text
cookeat/
├── public/                   # 정적 에셋 (이미지, 아이콘 등)
├── app/                      # Next.js App Router
│   ├── layout.tsx            # 루트 레이아웃
│   ├── page.tsx              # 홈 페이지
│   ├── globals.css           # 전역 스타일
│   ├── (auth)/               # 로그인 / 회원가입
│   ├── recipes/              # 레시피 목록 및 상세
│   ├── board/                # 커뮤니티 게시판
│   └── mypage/               # 마이페이지
│   └── user/                 # 유저페이지
│       └── user/components   # 유저페이지/컴포넌트
│   └── seller/               # 판매자페이지
│       └── seller/components # 판매자페이지/컴포넌트
│   └── admin/                # 어드민페이지
│       └── admin/components  # 어드민페이지/컴포넌트
├── components/               # 공용 컴포넌트
├── store/                    # Zustand 스토어
├── lib/                      # 유틸 함수 및 API 클라이언트
├── types/                    # TypeScript 타입 정의
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
NEXT_PUBLIC_BASE_URL=<백엔드 서버 URL>
```

---

## 🧑‍💻 팀 구성

|  이름  | 역할 |                        GitHub                        |
| :----: | :--: | :--------------------------------------------------: |
| 홍정빈 | 팀장 | [@jbhong3010-ops](https://github.com/jbhong3010-ops) |
| 엄인호 | 팀원 |         [@djsy01](https://github.com/djsy01)         |
| 최유종 | 팀원 |         [@jjong0](https://github.com/jjong0)         |
| 추유나 | 팀원 |       [@nana9147](https://github.com/nana9147)       |

---

## 🔒 라이선스

이 프로젝트는 [MIT License](./LICENSE.md)를 따릅니다.
