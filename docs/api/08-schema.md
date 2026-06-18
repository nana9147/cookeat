# 08. DB 스키마

[← 목차로 돌아가기](../api.md)

---

## ERD 관계 요약

```text
[재료 쇼핑 카테고리]
ingredients (재료 쇼핑 대카테고리, 예: 채소, 과일·견과·쌀)
  └── categories (재료 쇼핑 소카테고리, 예: 고구마/감자/당근, 과일)
products (ingredient_id FK → ingredients) ─── product_images
                            │  (shipping_template_id FK → shipping_templates)
                            │  (return_policy_template_id FK → return_policy_templates)
                            └── sellers ──┬── shipping_templates
                                          └── return_policy_templates

[레시피 카테고리]
recipe_categories (레시피 카테고리, 예: 한식, 양식)
  └── recipes (recipe_category_id FK)
       ├── recipe_steps
       ├── recipe_ingredients ── ingredients (소카테고리 참조)
       ├── reviews (recipe_id) ── review_images
       ├── likes
       └── bookmarks

[사용자]
users ──────────────┬── sellers (위 참조)
  │
  ├── recipes (위 참조)
  ├── orders (coupon_id → coupons) ── order_items ── return_requests
  │         │                             (seller_id)
  │         └── shippings
  │         └── reviews (product_id / recipe_id) ── review_images
  ├── point_history
  ├── coupons
  └── inquiries ──── inquiry_images
                 └── inquiry_replies  (isAnswered는 이 row 존재 여부로 파생)
```

---

## 테이블 정의

### users

| 컬럼            | 타입                            | 제약             | 설명              |
| --------------- | ------------------------------- | ---------------- | ----------------- |
| `user_id`       | `INT`                           | PK, AI           | 사용자 고유 ID    |
| `email`         | `VARCHAR(255)`                  | UNIQUE, NOT NULL | 이메일            |
| `password_hash` | `VARCHAR(255)`                  | NOT NULL         | 해시된 비밀번호   |
| `nickname`      | `VARCHAR(50)`                   | NOT NULL         | 닉네임            |
| `phone`         | `VARCHAR(20)`                   | NOT NULL         | 휴대폰 번호       |
| `profile_image` | `VARCHAR(500)`                  | NULL             | 프로필 이미지 URL |
| `point`         | `INT`                           | DEFAULT 0        | 보유 포인트       |
| `role`          | `ENUM('user','seller','admin')` | DEFAULT 'user'   | 역할              |
| `status`        | `ENUM('active','suspended')`    | DEFAULT 'active' | 계정 상태         |
| `created_at`    | `DATETIME`                      | DEFAULT NOW()    | 가입일시          |
| `updated_at`    | `DATETIME`                      | ON UPDATE NOW()  | 수정일시          |

### sellers

| 컬럼                   | 타입                                    | 제약                    | 설명                                                |
| ---------------------- | --------------------------------------- | ----------------------- | --------------------------------------------------- |
| `seller_id`            | `INT`                                   | PK, AI                  | 판매자 고유 ID                                      |
| `user_id`              | `INT`                                   | FK → users, UNIQUE      | 연결된 사용자 ID                                    |
| `is_co_representative` | `BOOLEAN`                               | DEFAULT false, NOT NULL | 공동대표 여부 (true: 공동대표, false: 1인/개인대표) |
| `representative_name`  | `VARCHAR(100)`                          | NOT NULL                | 대표자명 (공동대표 시 "홍길동, 김철수" 형태)        |
| `cs_phone`             | `VARCHAR(20)`                           | NOT NULL                | 판매자 고객센터/CS 연락처                           |
| `store_name`           | `VARCHAR(100)`                          | NOT NULL                | 상호명                                              |
| `business_number`      | `VARCHAR(20)`                           | UNIQUE, NOT NULL        | 사업자 번호                                         |
| `business_address`     | `VARCHAR(300)`                          | NULL                    | 사업장 주소                                         |
| `bank_name`            | `VARCHAR(50)`                           | NOT NULL                | 정산 은행                                           |
| `bank_account`         | `VARCHAR(50)`                           | NOT NULL                | 정산 계좌번호                                       |
| `commission_rate`      | `DECIMAL(5,2)`                          | DEFAULT 15.00           | 수수료율 (%) — 정산 시 fee 계산에 사용              |
| `approve_status`       | `ENUM('pending','approved','rejected')` | DEFAULT 'pending'       | 승인 상태                                           |
| `rejected_reason`      | `VARCHAR(200)`                          | NULL                    | 거절 사유 (`rejected` 상태일 때만 사용)             |
| `created_at`           | `DATETIME`                              | DEFAULT NOW()           | 신청일시                                            |

### categories

> 재료 쇼핑 **소카테고리** (예: 고구마/감자/당근, 생선류). `parent_id`로 `ingredients` 대카테고리에 연결된다.

| 컬럼          | 타입          | 제약                       | 설명                  |
| ------------- | ------------- | -------------------------- | --------------------- |
| `category_id` | `INT`         | PK, AI                     | 카테고리 ID           |
| `name`        | `VARCHAR(50)` | NOT NULL                   | 소카테고리명          |
| `parent_id`   | `INT`         | FK → ingredients, NOT NULL | 대카테고리(ingredient_id) |
| `sort_order`  | `INT`         | DEFAULT 0                  | 노출 순서             |

### recipe_categories

> 레시피 전용 카테고리 (예: 한식, 양식, 중식, 다이어트).

| 컬럼                 | 타입          | 제약      | 설명                |
| -------------------- | ------------- | --------- | ------------------- |
| `recipe_category_id` | `INT`         | PK, AI    | 레시피 카테고리 ID  |
| `name`               | `VARCHAR(50)` | NOT NULL  | 카테고리명          |
| `sort_order`         | `INT`         | DEFAULT 0 | 노출 순서           |

### ingredients

> 재료 쇼핑 **대카테고리** (예: 채소, 과일·견과·쌀, 수산·해산물·건어물). `products.ingredient_id`가 여기에 연결된다.

| 컬럼            | 타입           | 제약             | 설명                                      |
| --------------- | -------------- | ---------------- | ----------------------------------------- |
| `ingredient_id` | `INT`          | PK, AI           | 대카테고리 고유 ID                        |
| `category`      | `VARCHAR(100)` | UNIQUE, NOT NULL | 대카테고리명 (예: 채소, 과일·견과·쌀)    |

### products

| 컬럼            | 타입                           | 제약                   | 설명                |
| --------------- | ------------------------------ | ---------------------- | ------------------- |
| `product_id`    | `INT`                          | PK, AI                 | 상품 고유 ID        |
| `seller_id`     | `INT`                          | FK → sellers, NOT NULL | 판매자 ID           |
| `ingredient_id` | `INT`                          | FK → ingredients, NULL | 연결 식재료 ID      |
| `name`          | `VARCHAR(200)`                 | NOT NULL               | 상품명              |
| `brand`         | `VARCHAR(100)`                 | NULL                   | 브랜드명            |
| `price`         | `INT`                          | NOT NULL               | 가격 (원)           |
| `stock`         | `INT`                          | DEFAULT 0              | 재고 수량           |
| `min_stock`     | `INT`                          | DEFAULT 10             | 재고 부족 알림 기준 |
| `origin`        | `VARCHAR(100)`                 | NOT NULL               | 원산지              |
| `description`   | `TEXT`                         | NULL                   | 상품 설명           |
| `image`         | `VARCHAR(500)`                 | NOT NULL               | 대표 이미지 URL     |
| `status`                    | `ENUM('판매중','품절','숨김')` | DEFAULT '판매중'                            | 판매 상태               |
| `sales_count`               | `INT`                          | DEFAULT 0                                    | 누적 판매 수            |
| `shipping_template_id`      | `INT`                          | FK → shipping_templates, NULL                | 연결된 배송 템플릿      |
| `return_policy_template_id` | `INT`                          | FK → return_policy_templates, NULL           | 연결된 반품정책 템플릿  |
| `created_at`                | `DATETIME`                     | DEFAULT NOW()                                | 등록일시                |
| `updated_at`                | `DATETIME`                     | ON UPDATE NOW()                              | 수정일시                |

> 템플릿 삭제 시 해당 FK는 `ON DELETE SET NULL` 처리됩니다.

### product_images

| 컬럼         | 타입           | 제약                    | 설명       |
| ------------ | -------------- | ----------------------- | ---------- |
| `image_id`   | `INT`          | PK, AI                  | 이미지 ID  |
| `product_id` | `INT`          | FK → products, NOT NULL | 상품 ID    |
| `url`        | `VARCHAR(500)` | NOT NULL                | 이미지 URL |
| `sort_order` | `INT`          | DEFAULT 0               | 노출 순서  |

### recipes

| 컬럼           | 타입                           | 제약                      | 설명              |
| -------------- | ------------------------------ | ------------------------- | ----------------- |
| `recipe_id`          | `INT`                          | PK, AI                              | 레시피 고유 ID    |
| `user_id`            | `INT`                          | FK → users, NOT NULL                | 작성자 ID         |
| `recipe_category_id` | `INT`                          | FK → recipe_categories, NOT NULL    | 레시피 카테고리 ID |
| `title`        | `VARCHAR(200)`                 | NOT NULL                  | 레시피 제목       |
| `thumbnail`    | `VARCHAR(500)`                 | NOT NULL                  | 썸네일 이미지 URL |
| `difficulty`   | `ENUM('쉬움','보통','어려움')` | NOT NULL                  | 난이도            |
| `cooking_time` | `INT`                          | NOT NULL                  | 조리 시간 (분)    |
| `servings`     | `INT`                          | NOT NULL                  | 인분 수           |
| `description`  | `TEXT`                         | NULL                      | 레시피 설명       |
| `like_count`   | `INT`                          | DEFAULT 0                 | 좋아요 수         |
| `scrap_count`  | `INT`                          | DEFAULT 0                 | 스크랩 수         |
| `created_at`   | `DATETIME`                     | DEFAULT NOW()             | 등록일시          |
| `updated_at`   | `DATETIME`                     | ON UPDATE NOW()           | 수정일시          |

### recipe_steps

| 컬럼          | 타입           | 제약                   | 설명                 |
| ------------- | -------------- | ---------------------- | -------------------- |
| `step_id`     | `INT`          | PK, AI                 | 조리 단계 ID         |
| `recipe_id`   | `INT`          | FK → recipes, NOT NULL | 레시피 ID            |
| `step_order`  | `INT`          | NOT NULL               | 순서 번호            |
| `description` | `TEXT`         | NOT NULL               | 조리 설명            |
| `image`       | `VARCHAR(500)` | NULL                   | 조리 과정 이미지 URL |

### recipe_ingredients

| 컬럼            | 타입          | 제약                       | 설명                |
| --------------- | ------------- | -------------------------- | ------------------- |
| `id`            | `INT`         | PK, AI                     | ID                  |
| `recipe_id`     | `INT`         | FK → recipes, NOT NULL     | 레시피 ID           |
| `ingredient_id` | `INT`         | FK → ingredients, NOT NULL | 식재료 ID           |
| `product_id`    | `INT`         | FK → products, NULL        | 연결 상품 ID        |
| `amount`        | `FLOAT`       | NOT NULL                   | 수량                |
| `unit`          | `VARCHAR(20)` | NOT NULL                   | 단위 (개, g, ml 등) |

### orders

| 컬럼               | 타입                                                                | 제약                 | 설명                          |
| ------------------ | ------------------------------------------------------------------- | -------------------- | ----------------------------- |
| `order_id`         | `VARCHAR(30)`                                                       | PK                   | 주문 ID (ORD-YYYYMMDD-XXXXXX) |
| `user_id`          | `INT`                                                               | FK → users, NOT NULL | 주문자 ID                     |
| `total_amount`     | `INT`                                                               | NOT NULL             | 상품 합계 금액 (원)           |
| `shipping_fee`     | `INT`                                                               | DEFAULT 0            | 배송비 (원)                   |
| `used_point`       | `INT`                                                               | DEFAULT 0            | 사용 포인트                   |
| `coupon_id`        | `INT`                                                               | FK → coupons, NULL   | 사용한 쿠폰 ID                |
| `coupon_discount`  | `INT`                                                               | DEFAULT 0            | 쿠폰 할인 금액 (원)           |
| `final_amount`     | `INT`                                                               | NOT NULL             | 최종 결제 금액 (원)           |
| `payment_method`   | `VARCHAR(20)`                                                       | NOT NULL             | 결제 수단                     |
| `status`           | `ENUM('결제완료','주문확인','배송준비','배송중','배송완료','취소')` | DEFAULT '결제완료'   | 주문 상태                     |
| `recipient`        | `VARCHAR(50)`                                                       | NOT NULL             | 수령인                        |
| `phone`            | `VARCHAR(20)`                                                       | NOT NULL             | 수령인 연락처                 |
| `address`          | `VARCHAR(300)`                                                      | NOT NULL             | 배송지 주소                   |
| `address_detail`   | `VARCHAR(100)`                                                      | NULL                 | 상세 주소                     |
| `shipping_request` | `VARCHAR(200)`                                                      | NULL                 | 배송 요청사항                 |
| `created_at`       | `DATETIME`                                                          | DEFAULT NOW()        | 주문일시                      |
| `updated_at`       | `DATETIME`                                                          | ON UPDATE NOW()      | 수정일시                      |

### order_items

| 컬럼         | 타입          | 제약                    | 설명                |
| ------------ | ------------- | ----------------------- | ------------------- |
| `item_id`    | `INT`         | PK, AI                  | 주문 상품 ID        |
| `order_id`   | `VARCHAR(30)` | FK → orders, NOT NULL   | 주문 ID             |
| `product_id` | `INT`         | FK → products, NOT NULL | 상품 ID             |
| `seller_id`  | `INT`         | FK → sellers, NOT NULL  | 판매자 ID           |
| `quantity`   | `INT`         | NOT NULL                | 수량                |
| `unit_price` | `INT`         | NOT NULL                | 주문 시점 단가 (원) |

### shippings

| 컬럼              | 타입          | 제약                | 설명         |
| ----------------- | ------------- | ------------------- | ------------ |
| `shipping_id`     | `INT`         | PK, AI              | 배송 ID      |
| `order_id`        | `VARCHAR(30)` | FK → orders, UNIQUE | 주문 ID      |
| `carrier`         | `VARCHAR(50)` | NULL                | 택배사명     |
| `tracking_number` | `VARCHAR(50)` | NULL                | 운송장 번호  |
| `shipped_at`      | `DATETIME`    | NULL                | 출고일시     |
| `delivered_at`    | `DATETIME`    | NULL                | 배송완료일시 |

### reviews

> `recipe_id`와 `product_id` 중 하나만 NOT NULL이어야 합니다.
> CHECK: `(recipe_id IS NOT NULL) XOR (product_id IS NOT NULL)`

| 컬럼            | 타입       | 제약                   | 설명                                      |
| --------------- | ---------- | ---------------------- | ----------------------------------------- |
| `review_id`     | `INT`      | PK, AI                 | 리뷰 고유 ID                              |
| `recipe_id`     | `INT`      | FK → recipes, NULL     | 레시피 ID (레시피 리뷰일 때)              |
| `product_id`    | `INT`      | FK → products, NULL    | 상품 ID (상품 리뷰일 때)                  |
| `order_item_id` | `INT`      | FK → order_items, NULL | 구매 확인용 (상품 리뷰만 사용, 중복 방지) |
| `user_id`       | `INT`      | FK → users, NOT NULL   | 작성자 ID                                 |
| `rating`        | `TINYINT`  | NOT NULL               | 평점 (1~5)                                |
| `content`       | `TEXT`     | NOT NULL               | 리뷰 내용                                 |
| `created_at`    | `DATETIME` | DEFAULT NOW()          | 작성일시                                  |
| `updated_at`    | `DATETIME` | ON UPDATE NOW()        | 수정일시                                  |

> UNIQUE KEY `uq_product_review` (`order_item_id`, `user_id`) — 상품 리뷰 중복 방지

### review_images

| 컬럼        | 타입           | 제약                   | 설명       |
| ----------- | -------------- | ---------------------- | ---------- |
| `image_id`  | `INT`          | PK, AI                 | 이미지 ID  |
| `review_id` | `INT`          | FK → reviews, NOT NULL | 리뷰 ID    |
| `url`       | `VARCHAR(500)` | NOT NULL               | 이미지 URL |

### likes

| 컬럼         | 타입       | 제약                   | 설명        |
| ------------ | ---------- | ---------------------- | ----------- |
| `like_id`    | `INT`      | PK, AI                 | 좋아요 ID   |
| `recipe_id`  | `INT`      | FK → recipes, NOT NULL | 레시피 ID   |
| `user_id`    | `INT`      | FK → users, NOT NULL   | 사용자 ID   |
| `created_at` | `DATETIME` | DEFAULT NOW()          | 좋아요 일시 |

> UNIQUE KEY `uq_like` (`recipe_id`, `user_id`)

### bookmarks

| 컬럼          | 타입       | 제약                   | 설명        |
| ------------- | ---------- | ---------------------- | ----------- |
| `bookmark_id` | `INT`      | PK, AI                 | 북마크 ID   |
| `recipe_id`   | `INT`      | FK → recipes, NOT NULL | 레시피 ID   |
| `user_id`     | `INT`      | FK → users, NOT NULL   | 사용자 ID   |
| `created_at`  | `DATETIME` | DEFAULT NOW()          | 북마크 일시 |

> UNIQUE KEY `uq_bookmark` (`recipe_id`, `user_id`)

### point_history

| 컬럼          | 타입                  | 제약                 | 설명           |
| ------------- | --------------------- | -------------------- | -------------- |
| `point_id`    | `INT`                 | PK, AI               | 포인트 내역 ID |
| `user_id`     | `INT`                 | FK → users, NOT NULL | 사용자 ID      |
| `type`        | `ENUM('적립','사용')` | NOT NULL             | 유형           |
| `amount`      | `INT`                 | NOT NULL             | 포인트 금액    |
| `description` | `VARCHAR(200)`        | NOT NULL             | 내역 설명      |
| `created_at`  | `DATETIME`            | DEFAULT NOW()        | 일시           |

### inquiries

> 답변 상태는 `inquiry_replies`와 LEFT JOIN해서 파생합니다.
> `inquiry_replies.inquiry_id`가 존재하면 `isAnswered: true`, 없으면 `false`.

| 컬럼         | 타입           | 제약                 | 설명         |
| ------------ | -------------- | -------------------- | ------------ |
| `inquiry_id` | `INT`          | PK, AI               | 문의 고유 ID |
| `user_id`    | `INT`          | FK → users, NOT NULL | 문의자 ID    |
| `category`   | `VARCHAR(50)`  | NOT NULL             | 문의 유형    |
| `title`      | `VARCHAR(200)` | NOT NULL             | 문의 제목    |
| `content`    | `TEXT`         | NOT NULL             | 문의 내용    |
| `created_at` | `DATETIME`     | DEFAULT NOW()        | 등록일시     |

### inquiry_images

| 컬럼         | 타입           | 제약                     | 설명       |
| ------------ | -------------- | ------------------------ | ---------- |
| `image_id`   | `INT`          | PK, AI                   | 이미지 ID  |
| `inquiry_id` | `INT`          | FK → inquiries, NOT NULL | 문의 ID    |
| `url`        | `VARCHAR(500)` | NOT NULL                 | 이미지 URL |

### inquiry_replies

| 컬럼         | 타입       | 제약                   | 설명             |
| ------------ | ---------- | ---------------------- | ---------------- |
| `reply_id`   | `INT`      | PK, AI                 | 답변 ID          |
| `inquiry_id` | `INT`      | FK → inquiries, UNIQUE | 문의 ID          |
| `admin_id`   | `INT`      | FK → users, NOT NULL   | 답변한 어드민 ID |
| `content`    | `TEXT`     | NOT NULL               | 답변 내용        |
| `created_at` | `DATETIME` | DEFAULT NOW()          | 답변일시         |

### coupons

| 컬럼                  | 타입                   | 제약             | 설명                             |
| --------------------- | ---------------------- | ---------------- | -------------------------------- |
| `coupon_id`           | `INT`                  | PK, AI           | 쿠폰 ID                          |
| `code`                | `VARCHAR(50)`          | UNIQUE, NOT NULL | 쿠폰 코드                        |
| `discount_type`       | `ENUM('rate','fixed')` | NOT NULL         | 할인 유형                        |
| `discount_value`      | `INT`                  | NOT NULL         | 할인 값 (% 또는 원)              |
| `min_order_amount`    | `INT`                  | NULL             | 최소 주문 금액 (원)              |
| `max_usage_count`     | `INT`                  | NULL             | 최대 사용 횟수 (NULL이면 무제한) |
| `current_usage_count` | `INT`                  | DEFAULT 0        | 현재 사용 횟수                   |
| `expired_at`          | `DATETIME`             | NOT NULL         | 만료일시                         |
| `created_at`          | `DATETIME`             | DEFAULT NOW()    | 생성일시                         |

### settlements

| 컬럼            | 타입                  | 제약                   | 설명               |
| --------------- | --------------------- | ---------------------- | ------------------ |
| `settlement_id` | `INT`                 | PK, AI                 | 정산 ID            |
| `seller_id`     | `INT`                 | FK → sellers, NOT NULL | 판매자 ID          |
| `amount`        | `INT`                 | NOT NULL               | 정산 금액 (원)     |
| `fee`           | `INT`                 | NOT NULL               | 플랫폼 수수료 (원) |
| `status`        | `ENUM('대기','완료')` | DEFAULT '대기'         | 정산 상태          |
| `period_start`  | `DATE`                | NOT NULL               | 정산 기간 시작     |
| `period_end`    | `DATE`                | NOT NULL               | 정산 기간 종료     |
| `settled_at`    | `DATETIME`            | NULL                   | 정산 완료 일시     |
| `created_at`    | `DATETIME`            | DEFAULT NOW()          | 생성일시           |

### shipping_templates

| 컬럼              | 타입                              | 제약                     | 설명                                            |
| ----------------- | --------------------------------- | ------------------------ | ----------------------------------------------- |
| `template_id`     | `INT`                             | PK, AI                   | 배송 템플릿 ID                                  |
| `seller_id`       | `INT`                             | FK → sellers, NOT NULL   | 판매자 ID                                       |
| `name`            | `VARCHAR(100)`                    | NOT NULL                 | 템플릿 이름 (예: "기본 배송")                   |
| `fee_type`        | `ENUM('무료','유료','조건부 무료')` | NOT NULL                | 배송비 유형                                     |
| `fee`             | `INT`                             | DEFAULT 0                | 배송비 (원)                                     |
| `free_threshold`  | `INT`                             | NULL                     | 무료배송 기준 금액 (조건부 무료일 때만 사용)    |
| `return_fee`      | `INT`                             | DEFAULT 0                | 반품 배송비 (원)                                |
| `origin_address`  | `VARCHAR(300)`                    | NOT NULL                 | 출고지 주소                                     |
| `return_address`  | `VARCHAR(300)`                    | NOT NULL                 | 반품지 주소                                     |
| `is_default`      | `BOOLEAN`                         | DEFAULT false, NOT NULL  | 기본 템플릿 여부                                |
| `created_at`      | `DATETIME`                        | DEFAULT NOW()            | 생성일시                                        |

> `is_default = true`는 판매자당 1개만 허용 — 부분 UNIQUE 인덱스로 강제.

### return_policy_templates

| 컬럼                 | 타입           | 제약                     | 설명                            |
| -------------------- | -------------- | ------------------------ | ------------------------------- |
| `template_id`        | `INT`          | PK, AI                   | 반품정책 템플릿 ID              |
| `seller_id`          | `INT`          | FK → sellers, NOT NULL   | 판매자 ID                       |
| `name`               | `VARCHAR(100)` | NOT NULL                 | 템플릿 이름                     |
| `return_period`      | `INT`          | NOT NULL                 | 반품 가능 기간 (일)             |
| `refund_period`      | `INT`          | NOT NULL                 | 환불 처리 기간 (일)             |
| `non_return_reasons` | `JSONB`        | NULL                     | 반품 불가 사유 목록 (JSON 배열) |
| `is_default`         | `BOOLEAN`      | DEFAULT false, NOT NULL  | 기본 템플릿 여부                |
| `created_at`         | `DATETIME`     | DEFAULT NOW()            | 생성일시                        |

> `non_return_reasons` 예시: `["개봉/사용/설치 완료", "신선식품 단순 변심"]`
> `is_default = true`는 판매자당 1개만 허용 — 부분 UNIQUE 인덱스로 강제.

### return_requests

> user 쪽 담당자와 설계 확정 후 최종 반영. 기본 스펙은 아래와 같음.

| 컬럼                 | 타입                                                    | 제약                       | 설명                                            |
| -------------------- | ------------------------------------------------------- | -------------------------- | ------------------------------------------------ |
| `return_id`          | `INT`                                                   | PK, AI                     | 반품/교환 신청 ID                               |
| `order_item_id`      | `INT`                                                   | FK → order_items, NOT NULL | 대상 주문 상품                                  |
| `user_id`            | `INT`                                                   | FK → users, NOT NULL       | 신청자                                          |
| `type`               | `ENUM('반품','교환')`                                   | NOT NULL                   | 신청 유형                                       |
| `reason`             | `VARCHAR(200)`                                          | NOT NULL                   | 신청 사유                                       |
| `fault_type`         | `ENUM('판매자귀책','구매자귀책')`                       | NOT NULL                   | 귀책 구분                                       |
| `shipping_fee_payer` | `ENUM('판매자','구매자')`                               | NOT NULL                   | 반품/교환 배송비 부담자                         |
| `shipping_fee`       | `INT`                                                   | NOT NULL                   | 실제 부과된 반품/교환 배송비 (신청 시점 확정값) |
| `refund_amount`      | `INT`                                                   | NULL                       | 환불 금액 (신청 시점 확정값, 교환이면 NULL)     |
| `status`             | `ENUM('신청','수거중','검수중','완료','거절')`          | DEFAULT '신청'             | 처리 상태                                       |
| `created_at`         | `DATETIME`                                              | DEFAULT NOW()              | 신청일시                                        |

> `refund_amount` 계산: 판매자귀책+반품이면 `상품가 + orders.shipping_fee`, 그 외엔 상품가만.
> 금액은 신청 시점에 확정 저장 — 이후 배송비 정책 변경이 소급 적용되지 않도록.
