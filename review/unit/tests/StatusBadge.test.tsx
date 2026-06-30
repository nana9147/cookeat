import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import StatusBadge from "@/components/common/StatusBadge";

// 상태 뱃지는 상태 문자열에 맞는 색을 입혀야 하므로,
// 텍스트와 색 클래스가 함께 나오는지 확인합니다.
describe("StatusBadge", () => {
  it("상태 문자열을 그대로 텍스트로 보여준다", () => {
    render(<StatusBadge status="판매중" />);
    expect(screen.getByText("판매중")).toBeInTheDocument();
  });

  it("'판매중'은 초록 계열 색 클래스를 입는다", () => {
    render(<StatusBadge status="판매중" />);
    expect(screen.getByText("판매중").className).toContain("bg-green-100");
  });

  it("'품절'은 빨강 계열 색 클래스를 입는다", () => {
    render(<StatusBadge status="품절" />);
    expect(screen.getByText("품절").className).toContain("bg-red-100");
  });
});
