import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** 리뷰 평점 평균을 소수 첫째 자리로 반환한다. 리뷰가 없으면 0을 반환한다. */
export function calcRating(sum: number, count: number): number {
  return count > 0 ? Math.round((sum / count) * 10) / 10 : 0;
}
