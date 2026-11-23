import { BookOpen, Check, Clock, Eye, ShoppingBag, Signal } from "lucide-react";
import { useStore } from "../context/StoreContext";
import { countLessons, discountPercent, formatPrice } from "../lib/format";
import { Link } from "../lib/router";
import type { Course } from "../types";
import { CourseCover } from "./CourseCover";
import { btn } from "./ui";

export function CourseCard({ course }: { course: Course }) {
  const { currency, addToCart, has, openQuickView, setCartOpen } = useStore();
  const inCart = has(course.id);
  const pct = discountPercent(course.price, course.oldPrice);

  return (
    <article className="group card-interactive flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-cream-2/70 backdrop-blur-sm shadow-soft">
      <div className="relative overflow-hidden">
        <Link to={`/courses/${course.slug}`} aria-label={course.title} className="block overflow-hidden">
          <CourseCover course={course} className="aspect-[16/10] transition-transform duration-700 ease-out group-hover:scale-108" />
        </Link>
        {pct > 0 && (
          <span className="absolute top-3 end-3 rounded-full bg-linear-to-r from-[#FF6B00] to-[#EA580C] px-3.5 py-1 text-xs font-black text-white shadow-[0_4px_16px_rgba(234,88,12,0.5)]">
            خصم {pct}%
          </span>
        )}
        <button
          type="button"
          onClick={() => openQuickView(course.id)}
          aria-label={`نظرة سريعة على ${course.title}`}
          className="absolute top-3 start-3 grid size-10 place-items-center rounded-full bg-white/90 text-ink shadow-[0_4px_12px_rgba(0,0,0,0.15)] backdrop-blur-md transition-all duration-300 hover:scale-110 hover:bg-white md:translate-y-1 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 md:focus-visible:translate-y-0 md:focus-visible:opacity-100"
        >
          <Eye className="size-[18px] text-brand" />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5 md:p-6">
        <div className="flex-1">
          <h3 className="font-display text-lg leading-snug font-bold text-balance">
            <Link to={`/courses/${course.slug}`} className="transition-colors hover:text-[#EA580C]">
              {course.title}
            </Link>
          </h3>
          <p className="mt-2 line-clamp-3 text-sm leading-7 text-ink-soft">{course.shortDescription}</p>
        </div>

        <ul className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-ink-soft">
          <li className="flex items-center gap-1.5 font-medium">
            <BookOpen className="size-3.5 text-[#EA580C]" /> {countLessons(course)} درساً
          </li>
          <li className="flex items-center gap-1.5 font-medium">
            <Clock className="size-3.5 text-brand" /> {course.duration}
          </li>
          <li className="flex items-center gap-1.5 font-medium">
            <Signal className="size-3.5 text-[#EA580C]" /> {course.level}
          </li>
        </ul>

        <div className="flex items-end justify-between gap-3 border-t border-line/80 pt-4">
          <div>
            {course.oldPrice && course.oldPrice > course.price && (
              <div className="text-xs text-ink-soft/75 line-through">{formatPrice(course.oldPrice, currency)}</div>
            )}
            <div className="font-display text-xl font-black text-transparent bg-clip-text bg-linear-to-r from-brand via-[#8B5CF6] to-[#EA580C]">
              {formatPrice(course.price, currency)}
            </div>
          </div>
          {inCart ? (
            <button type="button" onClick={() => setCartOpen(true)} className={btn("outline", "sm")}>
              <Check className="size-4" /> في السلة
            </button>
          ) : (
            <button type="button" onClick={() => addToCart(course.id)} className={btn("gold", "sm")}>
              <ShoppingBag className="size-4" /> أضف للسلة
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
