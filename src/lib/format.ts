import type { Course, Currency } from "../types";

export function formatPrice(amountEgp: number, currency: Currency): string {
  const value = Math.round(amountEgp * currency.rate);
  return `${value.toLocaleString("en-US")} ${currency.symbol}`;
}

export function discountPercent(price: number, oldPrice?: number): number {
  if (!oldPrice || oldPrice <= price) return 0;
  return Math.round(((oldPrice - price) / oldPrice) * 100);
}

export function countLessons(course: Course): number {
  return course.curriculum.reduce((total, unit) => total + unit.lessons.length, 0);
}
