import { describe, it, expect } from "vitest";
import { formatWon, formatDate } from "@/lib/format";

// 가격(원)·날짜 포맷은 상품/주문/정산 화면이 공통으로 쓰는 순수 함수입니다.
describe("formatWon", () => {
  it("값이 없으면(null/undefined) 대시(-)로 막는다", () => {
    expect(formatWon(null)).toBe("-");
    expect(formatWon(undefined)).toBe("-");
  });

  it("숫자는 천 단위 콤마와 '원'을 붙인다", () => {
    expect(formatWon(12000)).toBe("12,000원");
  });

  it("0원은 대시가 아니라 '0원'으로 구분한다", () => {
    expect(formatWon(0)).toBe("0원");
  });
});

describe("formatDate", () => {
  it("ISO 날짜를 'yyyy.MM.dd'로 보여준다", () => {
    expect(formatDate("2026-06-14T09:00:00")).toBe("2026.06.14");
  });

  it("월·일을 두 자리로 0 채움 한다", () => {
    expect(formatDate("2026-03-05T00:00:00")).toBe("2026.03.05");
  });
});
