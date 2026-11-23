import { ArrowLeft, Check, ShoppingBag } from "lucide-react";
import { useStore } from "../context/StoreContext";
import { discountPercent, formatPrice } from "../lib/format";
import { Link } from "../lib/router";
import type { Course } from "../types";
import { CourseCover } from "./CourseCover";
import { Badge, btn } from "./ui";

/** بانر كبير لكورس مميّز (على غرار بانرات المتاجر) */
export function FeaturedBanner({ course, flip = false }: { course: Course; flip?: boolean }) {
  const { currency, addToCart, has, setCartOpen } = useStore();
  const pct = discountPercent(course.price, course.oldPrice);
  const inCart = has(course.id);

  return (
    <article className="group card-interactive grid overflow-hidden rounded-[2.2rem] border border-line bg-cream-2/80 backdrop-blur-sm shadow-soft transition-all duration-500 hover:border-orange-500/40 hover:shadow-[0_24px_60px_-15px_rgba(234,88,12,0.3)] md:grid-cols-2">
      <div className={flip ? "md:order-2" : ""}>
        <CourseCover course={course} className="h-60 md:h-full md:min-h-[26rem] transition-transform duration-700 ease-out group-hover:scale-105" />
      </div>

      <div className="flex flex-col justify-center gap-5 p-7 md:p-12">
        <div className="flex flex-wrap items-center gap-2">
          {pct > 0 && <Badge tone="orange">خصم {pct}% لفترة محدودة</Badge>}
          <Badge tone="brand">{course.level}</Badge>
        </div>

        <h3 className="font-display text-2xl leading-snug font-extrabold text-balance md:text-3xl group-hover:text-[#EA580C] transition-colors">{course.title}</h3>
        <p className="leading-8 text-ink-soft">{course.shortDescription}</p>

        <ul className="grid gap-3 sm:grid-cols-2">
          {course.features.map((feature) => (
            <li key={feature} className="flex items-start gap-2.5 text-sm leading-6">
              <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-orange-500/15 text-[#EA580C]">
                <Check className="size-3" strokeWidth={3} />
              </span>
              {feature}
            </li>
          ))}
        </ul>

        <div className="flex items-baseline gap-3">
          <span className="font-display text-3xl font-black text-transparent bg-clip-text bg-linear-to-r from-brand via-[#8B5CF6] to-[#EA580C]">{formatPrice(course.price, currency)}</span>
          {course.oldPrice && course.oldPrice > course.price && (
            <span className="text-ink-soft/75 line-through">{formatPrice(course.oldPrice, currency)}</span>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          {inCart ? (
            <button type="button" onClick={() => setCartOpen(true)} className={btn("outline", "md")}>
              <Check className="size-4" /> الكورس في سلتك
            </button>
          ) : (
            <button type="button" onClick={() => addToCart(course.id)} className={btn("gradient", "md")}>
              <ShoppingBag className="size-4" /> ابدأ الآن
            </button>
          )}
          <Link to={`/courses/${course.slug}`} className={btn("secondary", "md")}>
            مشاهدة التفاصيل <ArrowLeft className="size-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}
