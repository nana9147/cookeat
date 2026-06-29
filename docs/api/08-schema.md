# 08. DB 스키마

[← 목차로 돌아가기](../api.md)

---

## ERD 관계 요약

```text
[재료 쇼핑 카테고리]
ingredients (재료 쇼핑 대카테고리, 예: 채소, 과일·견과·쌀)
  └── categories (재료 쇼핑 소카테고리, 예: 고구마/감자/당근, 과일)
products (category_id FK → categories) ─── product_images
                            │  (shipping_template_id FK → shipping_templates)
                            │  (return_policy_template_id FK → return_policy_templates)
                            └── sellers ──┬── shipping_templates
                                          ├── return_policy_templates
                                          └── addresses (출고지/반품지)

[레시피 카테고리]
recipe_categories (레시피 카테고리, 예: 한식, 양식)
  └── recipes (recipe_category_id FK)
       ├── recipe_steps
       ├── recipe_ingredients ── ingredients (대카테고리 참조)
       ├── reviews (recipe_id) ── review_images
       │         └── review_reports (review_id, reporter_id → users)
       ├── likes
       └── bookmarks

[사용자]
users ──────────────┬── sellers (위 참조)
  │
  ├── recipes (위 참조)
  ├── orders (coupon_id → coupons) ── order_items ── return_requests
  │         │                             (seller_id)
  │         └── shippings (seller_id 포함 — 셀러별 배송 단위)
  │         └── reviews (product_id / recipe_id) ── review_images
  │                   └── review_reports
  ├── point_history
  ├── coupons
  └── inquiries ──── inquiry_images
                 └── inquiry_replies  (isAnswered는 이 row 존재 여부로 파생)

[기타]
faqs (자주 묻는 질문, 셀러/사용자 도메인과 직접 연결 없음)
```

> ⚠️ **셀러별 배송 단위 분리**: 재료 주문은 장바구니에 여러 셀러 상품이 섞일 수 있는 반면, 기존 `shippings`는 `order_id` 단독 UNIQUE라 한 주문에 운송장이 1개만 허용됐습니다. 멀티셀러 주문 시 셀러 간 운송장 충돌(덮어쓰기) 문제가 있어, `shippings`에 `seller_id`를 추가하고 `UNIQUE(order_id, seller_id)`로 변경했습니다.
자세한 내용은 [shippings 테이블](#shippings) 참고.

---

## 테이블 정의

### users

| 컬럼            | 타입                | 제약                   | 설명                                              |
| --------------- | ------------------- | ---------------------- | ------------------------------------------------- |
| `user_id`       | `INT`               | PK, AI                 | 사용자 고유 ID                                    |
| `email`         | `VARCHAR(255)`      | UNIQUE, NOT NULL       | 이메일                                            |
| `password_hash` | `VARCHAR(255)`      | NULL                   | 해시된 비밀번호 (Supabase Auth 연동 시 NULL 가능) |
| `nickname`      | `VARCHAR(50)`       | UNIQUE, NULL           | 닉네임                                            |
| `phone`         | `VARCHAR(20)`       | NULL                   | 휴대폰 번호                                       |
| `profile_image` | `VARCHAR(500)`      | NULL                   | 프로필 이미지 URL                                 |
| `point`         | `INT`               | DEFAULT 0, NULL        | 보유 포인트                                       |
| `role`          | `ENUM(user_role)`   | DEFAULT 'user', NULL   | 역할                                              |
| `status`        | `ENUM(user_status)` | DEFAULT 'active', NULL | 계정 상태                                         |
| `created_at`    | `TIMESTAMPTZ`       | DEFAULT NOW(), NULL    | 가입일시                                          |
| `updated_at`    | `TIMESTAMPTZ`       | ON UPDATE NOW(), NULL  | 수정일시                                          |
| `auth_id`       | `UUID`              | UNIQUE, NULL           | Supabase Auth 연동 ID                             |

### sellers

| 컬럼                   | 타입                   | 제약               | 설명                                                |
| ---------------------- | ---------------------- | ------------------ | --------------------------------------------------- |
| `seller_id`            | `INT`                  | PK, AI             | 판매자 고유 ID                                      |
| `user_id`              | `INT`                  | FK → users, UNIQUE | 연결된 사용자 ID                                    |
| `is_co_representative` | `BOOLEAN`              | NOT NULL           | 공동대표 여부 (true: 공동대표, false: 1인/개인대표) |
| `representative_name`  | `VARCHAR(100)`         | NOT NULL           | 대표자명 (공동대표 시 "홍길동, 김철수" 형태)        |
| `cs_phone`             | `VARCHAR(20)`          | NOT NULL           | 판매자 고객센터/CS 연락처                           |
| `store_name`           | `VARCHAR(100)`         | NOT NULL           | 상호명                                              |
| `business_number`      | `VARCHAR(20)`          | UNIQUE, NOT NULL   | 사업자 번호                                         |
| `business_address`     | `VARCHAR(300)`         | NOT NULL           | 사업장 주소                                         |
| `bank_name`            | `VARCHAR(50)`          | NOT NULL           | 정산 은행                                           |
| `bank_account`         | `VARCHAR(50)`          | NOT NULL           | 정산 계좌번호                                       |
| `commission_rate`      | `NUMERIC(5,2)`         | NOT NULL           | 수수료율 (%) — 정산 시 fee 계산에 사용              |
| `approve_status`       | `ENUM(approve_status)` | NULL               | 승인 상태                                           |
| `rejected_reason`      | `VARCHAR(200)`         | NULL               | 거절 사유 (`rejected` 상태일 때만 사용)             |
| `created_at`           | `TIMESTAMPTZ`          | NULL               | 신청일시                                            |

### ingredients

> 재료 쇼핑 **대카테고리** (예: 채소, 과일·견과·쌀, 수산·해산물·건어물). `categories.parent_id`가 여기에 연결되고, `recipe_ingredients.ingredient_id`도 여기를 참조합니다.

| 컬럼            | 타입           | 제약     | 설명                                  |
| --------------- | -------------- | -------- | ------------------------------------- |
| `ingredient_id` | `INT`          | PK, AI   | 대카테고리 고유 ID                    |
| `category`      | `VARCHAR(100)` | NOT NULL | 대카테고리명 (예: 채소, 과일·견과·쌀) |

### categories

> 재료 쇼핑 **소카테고리** (예: 고구마/감자/당근, 생선류). `parent_id`로 `ingredients` 대카테고리에 연결됩니다. **자기참조 구조가 아닙니다.**

| 컬럼          | 타입          | 제약     | 설명                      |
| ------------- | ------------- | -------- | ------------------------- |
| `category_id` | `INT`         | PK, AI   | 카테고리 ID               |
| `name`        | `VARCHAR(50)` | NOT NULL | 소카테고리명              |
| `parent_id`   | `INT`         | NULL     | 대카테고리(ingredient_id) |
| `sort_order`  | `INT`         | NULL     | 노출 순서                 |

### recipe_categories

> 레시피 전용 카테고리 (예: 한식, 양식, 중식, 다이어트).

| 컬럼                 | 타입          | 제약     | 설명               |
| -------------------- | ------------- | -------- | ------------------ |
| `recipe_category_id` | `INT`         | PK, AI   | 레시피 카테고리 ID |
| `name`               | `VARCHAR(50)` | NOT NULL | 카테고리명         |
| `sort_order`         | `INT`         | NOT NULL | 노출 순서          |

### products

| 컬럼                        | 타입                   | 제약                               | 설명                            |
| --------------------------- | ---------------------- | ---------------------------------- | ------------------------------- |
| `product_id`                | `INT`                  | PK, AI                             | 상품 고유 ID                    |
| `seller_id`                 | `INT`                  | FK → sellers, NOT NULL             | 판매자 ID                       |
| `category_id`               | `INT`                  | FK → categories, NULL              | 연결 소카테고리 ID              |
| `name`                      | `VARCHAR(200)`         | NOT NULL                           | 상품명                          |
| `brand`                     | `VARCHAR(100)`         | NULL                               | 브랜드명                        |
| `price`                     | `INT`                  | NOT NULL                           | 가격 (원)                       |
| `stock`                     | `INT`                  | NULL                               | 재고 수량                       |
| `min_stock`                 | `INT`                  | NULL                               | 재고 부족 알림 기준             |
| `origin`                    | `VARCHAR(100)`         | NOT NULL                           | 원산지                          |
| `description`               | `TEXT`                 | NULL                               | 상품 설명                       |
| `image`                     | `VARCHAR(500)`         | NOT NULL                           | 대표 이미지 URL                 |
| `status`                    | `ENUM(product_status)` | NULL                               | 판매 상태 (판매중/품절/숨김 등) |
| `sales_count`               | `INT`                  | NULL                               | 누적 판매 수                    |
| `shipping_template_id`      | `INT`                  | FK → shipping_templates, NULL      | 연결된 배송 템플릿              |
| `return_policy_template_id` | `INT`                  | FK → return_policy_templates, NULL | 연결된 반품정책 템플릿          |
| `discount_type`             | `VARCHAR`              | NULL                               | 할인 유형 (none 등)             |
| `discount_value`            | `INT`                  | NULL                               | 할인 값                         |
| `created_at`                | `TIMESTAMPTZ`          | NULL                               | 등록일시                        |
| `updated_at`                | `TIMESTAMPTZ`          | NULL                               | 수정일시                        |

> 템플릿 삭제 시 해당 FK는 `ON DELETE SET NULL` 처리됩니다.
> `shipping_template_id`/`return_policy_template_id`는 DB 레벨에서는 NULL 허용이지만, 상품 등록/수정 API에서는 필수값으로 검증해 미선택 시 등록을 차단합니다.

### product_images

| 컬럼         | 타입           | 제약                    | 설명       |
| ------------ | -------------- | ----------------------- | ---------- |
| `image_id`   | `INT`          | PK, AI                  | 이미지 ID  |
| `product_id` | `INT`          | FK → products, NOT NULL | 상품 ID    |
| `url`        | `VARCHAR(500)` | NOT NULL                | 이미지 URL |
| `sort_order` | `INT`          | NULL                    | 노출 순서  |

### recipes

| 컬럼                 | 타입                     | 제약                             | 설명               |
| -------------------- | ------------------------ | -------------------------------- | ------------------ |
| `recipe_id`          | `INT`                    | PK, AI                           | 레시피 고유 ID     |
| `user_id`            | `INT`                    | FK → users, NOT NULL             | 작성자 ID          |
| `recipe_category_id` | `INT`                    | FK → recipe_categories, NOT NULL | 레시피 카테고리 ID |
| `title`              | `VARCHAR(200)`           | NOT NULL                         | 레시피 제목        |
| `thumbnail`          | `VARCHAR(500)`           | NOT NULL                         | 썸네일 이미지 URL  |
| `difficulty`         | `ENUM(difficulty_level)` | NOT NULL                         | 난이도             |
| `cooking_time`       | `INT`                    | NOT NULL                         | 조리 시간 (분)     |
| `servings`           | `INT`                    | NOT NULL                         | 인분 수            |
| `description`        | `TEXT`                   | NULL                             | 레시피 설명        |
| `like_count`         | `INT`                    | NULL                             | 좋아요 수          |
| `scrap_count`        | `INT`                    | NULL                             | 스크랩 수          |
| `created_at`         | `TIMESTAMPTZ`            | NULL                             | 등록일시           |
| `updated_at`         | `TIMESTAMPTZ`            | NULL                             | 수정일시           |

### recipe_steps

| 컬럼          | 타입           | 제약                   | 설명                 |
| ------------- | -------------- | ---------------------- | -------------------- |
| `step_id`     | `INT`          | PK, AI                 | 조리 단계 ID         |
| `recipe_id`   | `INT`          | FK → recipes, NOT NULL | 레시피 ID            |
| `step_order`  | `INT`          | NOT NULL               | 순서 번호            |
| `description` | `TEXT`         | NOT NULL               | 조리 설명            |
| `image`       | `VARCHAR(500)` | NULL                   | 조리 과정 이미지 URL |

### recipe_ingredients

| 컬럼            | 타입          | 제약                       | 설명                  |
| --------------- | ------------- | -------------------------- | --------------------- |
| `id`            | `INT`         | PK, AI                     | ID                    |
| `recipe_id`     | `INT`         | FK → recipes, NOT NULL     | 레시피 ID             |
| `ingredient_id` | `INT`         | FK → ingredients, NOT NULL | 식재료(대카테고리) ID |
| `product_id`    | `INT`         | FK → products, NULL        | 연결 상품 ID          |
| `amount`        | `FLOAT8`      | NOT NULL                   | 수량                  |
| `unit`          | `VARCHAR(20)` | NOT NULL                   | 단위 (개, g, ml 등)   |

### orders

| 컬럼               | 타입                 | 제약                 | 설명                          |
| ------------------ | -------------------- | -------------------- | ----------------------------- |
| `order_id`         | `VARCHAR(30)`        | PK                   | 주문 ID (ORD-YYYYMMDD-XXXXXX) |
| `user_id`          | `INT`                | FK → users, NOT NULL | 주문자 ID                     |
| `total_amount`     | `INT`                | NOT NULL             | 상품 합계 금액 (원)           |
| `shipping_fee`     | `INT`                | NULL                 | 배송비 (원)                   |
| `used_point`       | `INT`                | NULL                 | 사용 포인트                   |
| `coupon_id`        | `INT`                | FK → coupons, NULL   | 사용한 쿠폰 ID                |
| `coupon_discount`  | `INT`                | NULL                 | 쿠폰 할인 금액 (원)           |
| `final_amount`     | `INT`                | NOT NULL             | 최종 결제 금액 (원)           |
| `payment_method`   | `VARCHAR(20)`        | NOT NULL             | 결제 수단                     |
| `status`           | `ENUM(order_status)` | NULL                 | 주문 상태 (아래 참고)         |
| `recipient`        | `VARCHAR(50)`        | NOT NULL             | 수령인                        |
| `phone`            | `VARCHAR(20)`        | NOT NULL             | 수령인 연락처                 |
| `address`          | `VARCHAR(300)`       | NOT NULL             | 배송지 주소                   |
| `address_detail`   | `VARCHAR(100)`       | NULL                 | 상세 주소                     |
| `shipping_request` | `VARCHAR(200)`       | NULL                 | 배송 요청사항                 |
| `created_at`       | `TIMESTAMPTZ`        | NULL                 | 주문일시                      |
| `updated_at`       | `TIMESTAMPTZ`        | NULL                 | 수정일시                      |

> `order_status` enum 값: `결제전`, `결제완료`, `주문확인`, `배송준비`, `배송중`, `배송완료`, `취소`, `환불` (8종)

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

> ⚠️ **2026-06-24 변경**: 재료 주문은 장바구니에 여러 셀러 상품이 섞일 수 있는데, 기존 구조(`order_id` 단독 UNIQUE)는 주문 1개당 운송장 1개만 허용해 멀티셀러 주문 시 셀러 간 운송장 덮어쓰기 충돌이 발생했습니다. `seller_id`를 추가하고 UNIQUE 제약을 `(order_id, seller_id)` 조합으로 변경해, 한 주문에 여러 셀러가 섞여도 각자 독립적인 운송장을 가질 수 있도록 했습니다.

| 컬럼              | 타입          | 제약                   | 설명         |
| ----------------- | ------------- | ---------------------- | ------------ |
| `shipping_id`     | `INT`         | PK, AI                 | 배송 ID      |
| `order_id`        | `VARCHAR(30)` | FK → orders, NOT NULL  | 주문 ID      |
| `seller_id`       | `INT`         | FK → sellers, NOT NULL | 판매자 ID    |
| `carrier`         | `VARCHAR(50)` | NULL                   | 택배사명     |
| `tracking_number` | `VARCHAR(50)` | NULL                   | 운송장 번호  |
| `shipped_at`      | `TIMESTAMPTZ` | NULL                   | 출고일시     |
| `delivered_at`    | `TIMESTAMPTZ` | NULL                   | 배송완료일시 |

> UNIQUE 제약: `(order_id, seller_id)` — 같은 주문이라도 셀러가 다르면 독립적인 배송 row 허용.
> 셀러별 배송 조회/입력 시 `order_id`만으로 필터링하면 다른 셀러의 운송장이 함께 조회될 수 있으므로, 항상 `seller_id`도 함께 필터링해야 합니다.

### reviews

> `recipe_id`와 `product_id` 중 하나만 NOT NULL이어야 합니다.
> CHECK: `(recipe_id IS NOT NULL) XOR (product_id IS NOT NULL)`

| 컬럼            | 타입                    | 제약                   | 설명                                         |
| --------------- | ----------------------- | ---------------------- | -------------------------------------------- |
| `review_id`     | `INT`                   | PK, AI                 | 리뷰 고유 ID                                 |
| `recipe_id`     | `INT`                   | FK → recipes, NULL     | 레시피 ID (레시피 리뷰일 때)                 |
| `product_id`    | `INT`                   | FK → products, NULL    | 상품 ID (상품 리뷰일 때)                     |
| `order_item_id` | `INT`                   | FK → order_items, NULL | 구매 확인용 (상품 리뷰만 사용, 중복 방지)    |
| `user_id`       | `INT`                   | FK → users, NOT NULL   | 작성자 ID                                    |
| `rating`        | `INT2`                  | NOT NULL               | 평점 (1~5)                                   |
| `content`       | `TEXT`                  | NOT NULL               | 리뷰 내용                                    |
| `status`        | `ENUM(review_status)`   | DEFAULT '정상', NOT NULL | 신고 처리 상태 (`정상` / `신고` / `처리완료`) |
| `created_at`    | `TIMESTAMPTZ`           | NULL                   | 작성일시                                     |
| `updated_at`    | `TIMESTAMPTZ`           | NULL                   | 수정일시                                     |

> UNIQUE KEY `uq_product_review` (`order_item_id`, `user_id`) — 상품 리뷰 중복 방지
> `status`는 `review_reports` INSERT 트리거(`trg_flag_review`)에 의해 `정상` → `신고`로 자동 전환됩니다.

### review_reports

> 사용자가 리뷰를 신고할 때 기록되는 테이블. 신고 등록 시 트리거로 `reviews.status`가 `신고`로 변경됩니다.

| 컬럼          | 타입           | 제약                       | 설명                            |
| ------------- | -------------- | -------------------------- | ------------------------------- |
| `report_id`   | `INT`          | PK, AI                     | 신고 고유 ID                    |
| `review_id`   | `INT`          | FK → reviews, NOT NULL     | 신고 대상 리뷰 ID               |
| `reporter_id` | `INT`          | FK → users, NOT NULL       | 신고자 ID                       |
| `reason`      | `VARCHAR(200)` | NOT NULL                   | 신고 사유                       |
| `created_at`  | `TIMESTAMPTZ`  | DEFAULT NOW(), NOT NULL    | 신고 일시                       |

> UNIQUE 제약 `uq_review_report` (`review_id`, `reporter_id`) — 동일 유저의 중복 신고 방지
> `ON DELETE CASCADE` — 리뷰 삭제 시 관련 신고 내역 자동 삭제

### review_images

| 컬럼        | 타입           | 제약                   | 설명       |
| ----------- | -------------- | ---------------------- | ---------- |
| `image_id`  | `INT`          | PK, AI                 | 이미지 ID  |
| `review_id` | `INT`          | FK → reviews, NOT NULL | 리뷰 ID    |
| `url`       | `VARCHAR(500)` | NOT NULL               | 이미지 URL |

### likes

| 컬럼         | 타입          | 제약                   | 설명        |
| ------------ | ------------- | ---------------------- | ----------- |
| `like_id`    | `INT`         | PK, AI                 | 좋아요 ID   |
| `recipe_id`  | `INT`         | FK → recipes, NOT NULL | 레시피 ID   |
| `user_id`    | `INT`         | FK → users, NOT NULL   | 사용자 ID   |
| `created_at` | `TIMESTAMPTZ` | NULL                   | 좋아요 일시 |

> UNIQUE KEY `uq_like` (`recipe_id`, `user_id`)

### bookmarks

| 컬럼          | 타입          | 제약                   | 설명        |
| ------------- | ------------- | ---------------------- | ----------- |
| `bookmark_id` | `INT`         | PK, AI                 | 북마크 ID   |
| `recipe_id`   | `INT`         | FK → recipes, NOT NULL | 레시피 ID   |
| `user_id`     | `INT`         | FK → users, NOT NULL   | 사용자 ID   |
| `created_at`  | `TIMESTAMPTZ` | NULL                   | 북마크 일시 |

> UNIQUE KEY `uq_bookmark` (`recipe_id`, `user_id`)

### point_history

| 컬럼          | 타입               | 제약                 | 설명             |
| ------------- | ------------------ | -------------------- | ---------------- |
| `point_id`    | `INT`              | PK, AI               | 포인트 내역 ID   |
| `user_id`     | `INT`              | FK → users, NOT NULL | 사용자 ID        |
| `type`        | `ENUM(point_type)` | NOT NULL             | 유형 (적립/사용) |
| `amount`      | `INT`              | NOT NULL             | 포인트 금액      |
| `description` | `VARCHAR(200)`     | NOT NULL             | 내역 설명        |
| `created_at`  | `TIMESTAMPTZ`      | NULL                 | 일시             |

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
| `created_at` | `TIMESTAMPTZ`  | NULL                 | 등록일시     |

### inquiry_images

| 컬럼         | 타입           | 제약                     | 설명       |
| ------------ | -------------- | ------------------------ | ---------- |
| `image_id`   | `INT`          | PK, AI                   | 이미지 ID  |
| `inquiry_id` | `INT`          | FK → inquiries, NOT NULL | 문의 ID    |
| `url`        | `VARCHAR(500)` | NOT NULL                 | 이미지 URL |

### inquiry_replies

| 컬럼         | 타입          | 제약                   | 설명             |
| ------------ | ------------- | ---------------------- | ---------------- |
| `reply_id`   | `INT`         | PK, AI                 | 답변 ID          |
| `inquiry_id` | `INT`         | FK → inquiries, UNIQUE | 문의 ID          |
| `admin_id`   | `INT`         | FK → users, NOT NULL   | 답변한 어드민 ID |
| `content`    | `TEXT`        | NOT NULL               | 답변 내용        |
| `created_at` | `TIMESTAMPTZ` | NULL                   | 답변일시         |

### coupons

| 컬럼                  | 타입                  | 제약             | 설명                             |
| --------------------- | --------------------- | ---------------- | -------------------------------- |
| `coupon_id`           | `INT`                 | PK, AI           | 쿠폰 ID                          |
| `code`                | `VARCHAR(50)`         | UNIQUE, NOT NULL | 쿠폰 코드                        |
| `discount_type`       | `ENUM(discount_type)` | NOT NULL         | 할인 유형                        |
| `discount_value`      | `INT`                 | NOT NULL         | 할인 값 (% 또는 원)              |
| `min_order_amount`    | `INT`                 | NULL             | 최소 주문 금액 (원)              |
| `max_usage_count`     | `INT`                 | NULL             | 최대 사용 횟수 (NULL이면 무제한) |
| `current_usage_count` | `INT`                 | NULL             | 현재 사용 횟수                   |
| `expired_at`          | `TIMESTAMPTZ`         | NOT NULL         | 만료일시                         |
| `created_at`          | `TIMESTAMPTZ`         | NULL             | 생성일시                         |

### settlements

| 컬럼            | 타입                      | 제약                   | 설명                  |
| --------------- | ------------------------- | ---------------------- | --------------------- |
| `settlement_id` | `INT`                     | PK, AI                 | 정산 ID               |
| `seller_id`     | `INT`                     | FK → sellers, NOT NULL | 판매자 ID             |
| `amount`        | `INT`                     | NOT NULL               | 정산 금액 (원)        |
| `fee`           | `INT`                     | NOT NULL               | 플랫폼 수수료 (원)    |
| `status`        | `ENUM(settlement_status)` | NULL                   | 정산 상태 (대기/완료) |
| `period_start`  | `DATE`                    | NOT NULL               | 정산 기간 시작        |
| `period_end`    | `DATE`                    | NOT NULL               | 정산 기간 종료        |
| `settled_at`    | `TIMESTAMPTZ`             | NULL                   | 정산 완료 일시        |
| `created_at`    | `TIMESTAMPTZ`             | NULL                   | 생성일시              |

### shipping_templates

| 컬럼             | 타입           | 제약                   | 설명                                         |
| ---------------- | -------------- | ---------------------- | -------------------------------------------- |
| `template_id`    | `INT`          | PK, AI                 | 배송 템플릿 ID                               |
| `seller_id`      | `INT`          | FK → sellers, NOT NULL | 판매자 ID                                    |
| `name`           | `VARCHAR(100)` | NOT NULL               | 템플릿 이름 (예: "기본 배송")                |
| `fee_type`       | `VARCHAR`      | NOT NULL               | 배송비 유형 (무료/유료/조건부 무료)          |
| `fee`            | `INT`          | NOT NULL               | 배송비 (원)                                  |
| `free_threshold` | `INT`          | NULL                   | 무료배송 기준 금액 (조건부 무료일 때만 사용) |
| `return_fee`     | `INT`          | NOT NULL               | 반품 배송비 (원)                             |
| `origin_address` | `VARCHAR(300)` | NOT NULL               | 출고지 주소                                  |
| `return_address` | `VARCHAR(300)` | NOT NULL               | 반품지 주소                                  |
| `is_default`     | `BOOLEAN`      | NOT NULL               | 기본 템플릿 여부                             |
| `created_at`     | `TIMESTAMPTZ`  | NULL                   | 생성일시                                     |

> `is_default = true`는 판매자당 1개만 허용 — 부분 UNIQUE 인덱스로 강제.
> `origin_address`/`return_address`는 현재 자유 텍스트 입력 또는 [`addresses`](#addresses) 테이블에서 선택해 채워집니다 (FK 연결 없음, 문자열로 저장).

### return_policy_templates

| 컬럼                 | 타입           | 제약                   | 설명                            |
| -------------------- | -------------- | ---------------------- | ------------------------------- |
| `template_id`        | `INT`          | PK, AI                 | 반품정책 템플릿 ID              |
| `seller_id`          | `INT`          | FK → sellers, NOT NULL | 판매자 ID                       |
| `name`               | `VARCHAR(100)` | NOT NULL               | 템플릿 이름                     |
| `return_period`      | `INT`          | NOT NULL               | 반품 가능 기간 (일)             |
| `refund_period`      | `INT`          | NOT NULL               | 환불 처리 기간 (일)             |
| `non_return_reasons` | `JSONB`        | NULL                   | 반품 불가 사유 목록 (JSON 배열) |
| `is_default`         | `BOOLEAN`      | NOT NULL               | 기본 템플릿 여부                |
| `created_at`         | `TIMESTAMPTZ`  | NULL                   | 생성일시                        |

> `non_return_reasons` 예시: `["신선식품 단순변심 반품불가", "포장 개봉/사용 후"]`
> `is_default = true`는 판매자당 1개만 허용 — 부분 UNIQUE 인덱스로 강제.

### addresses

> 셀러의 출고지/반품지 주소록. `shipping_templates`의 출고지/반품지 입력 시 여기서 선택해 채울 수 있습니다 (값은 문자열로 복사되며 FK 연결 없음).

| 컬럼             | 타입          | 제약                   | 설명                         |
| ---------------- | ------------- | ---------------------- | ---------------------------- |
| `address_id`     | `INT`         | PK, AI                 | 주소 고유 ID                 |
| `seller_id`      | `INT`         | FK → sellers, NOT NULL | 판매자 ID                    |
| `type`           | `TEXT`        | NOT NULL               | 용도 (`출고지` / `반품지`)   |
| `name`           | `TEXT`        | NOT NULL               | 주소 별칭 (예: "본사 창고")  |
| `zip_code`       | `TEXT`        | NOT NULL               | 우편번호                     |
| `base_address`   | `TEXT`        | NOT NULL               | 기본 주소                    |
| `detail_address` | `TEXT`        | NOT NULL               | 상세 주소 (기본값 빈 문자열) |
| `is_default`     | `BOOLEAN`     | NOT NULL               | 기본 주소 여부               |
| `created_at`     | `TIMESTAMPTZ` | NOT NULL               | 등록일시                     |
| `updated_at`     | `TIMESTAMPTZ` | NOT NULL               | 수정일시                     |

> UNIQUE 제약(partial index): `(seller_id, type)` 조합에서 `is_default = true`인 row는 최대 1개 — 셀러당 type(출고지/반품지)별 기본 주소는 항상 1개만 존재.
> 동일 주소(우편번호/기본주소/상세주소, 공백 정규화 비교) 중복 등록은 API 레벨에서 차단합니다.

### return_requests

> user 쪽 담당자와 설계 확정 후 최종 반영. 기본 스펙은 아래와 같음.

| 컬럼                 | 타입           | 제약                       | 설명                                            |
| -------------------- | -------------- | -------------------------- | ----------------------------------------------- |
| `return_id`          | `INT`          | PK, AI                     | 반품/교환 신청 ID                               |
| `order_item_id`      | `INT`          | FK → order_items, NOT NULL | 대상 주문 상품                                  |
| `user_id`            | `INT`          | FK → users, NOT NULL       | 신청자                                          |
| `type`               | `VARCHAR`      | NOT NULL                   | 신청 유형 (반품/교환)                           |
| `reason`             | `VARCHAR(200)` | NOT NULL                   | 신청 사유                                       |
| `fault_type`         | `VARCHAR`      | NOT NULL                   | 귀책 구분 (판매자귀책/구매자귀책)               |
| `shipping_fee_payer` | `VARCHAR`      | NOT NULL                   | 반품/교환 배송비 부담자 (판매자/구매자)         |
| `shipping_fee`       | `INT`          | NOT NULL                   | 실제 부과된 반품/교환 배송비 (신청 시점 확정값) |
| `refund_amount`      | `INT`          | NULL                       | 환불 금액 (신청 시점 확정값, 교환이면 NULL)     |
| `status`             | `VARCHAR`      | NOT NULL                   | 처리 상태 (신청/수거중/검수중/완료/거절)        |
| `created_at`         | `TIMESTAMPTZ`  | NULL                       | 신청일시                                        |

> `refund_amount` 계산: 판매자귀책+반품이면 `상품가 + orders.shipping_fee`, 그 외엔 상품가만.
> 금액은 신청 시점에 확정 저장 — 이후 배송비 정책 변경이 소급 적용되지 않도록.

### faqs

| 컬럼         | 타입          | 제약     | 설명        |
| ------------ | ------------- | -------- | ----------- |
| `faq_id`     | `INT`         | PK, AI   | FAQ 고유 ID |
| `category`   | `VARCHAR`     | NOT NULL | 카테고리    |
| `title`      | `VARCHAR`     | NOT NULL | 제목        |
| `content`    | `TEXT`        | NOT NULL | 내용        |
| `is_public`  | `BOOLEAN`     | NOT NULL | 공개 여부   |
| `views`      | `INT`         | NOT NULL | 조회수      |
| `created_at` | `TIMESTAMPTZ` | NOT NULL | 등록일시    |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL | 수정일시    |
