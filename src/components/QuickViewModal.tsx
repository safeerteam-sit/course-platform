import { ArrowLeft, Check, ShoppingBag, X } from "lucide-react";
import { useStore } from "../context/StoreContext";
import { useEscape, useLockBodyScroll } from "../hooks/overlay";
import { discountPercent, formatPrice } from "../lib/format";
import { Link } from "../lib/router";
import { CourseCover } from "./CourseCover";
import { Badge, btn } from "./ui";

/** نافذة سريعة لعرض تفاصيل الكورس دون مغادرة الصفحة */
export function QuickViewModal() {
  const { quickViewId, closeQuickView, courses, currency, addToCart, has, setCartOpen } = useStore();
  const course = courses.find((c) => c.id === quickViewId);

  useLockBodyScroll(Boolean(course));
  useEscape(Boolean(course), closeQuickView);

  if (!course) return null;
  const pct = discountPercent(course.price, course.oldPrice);
  const inCart = has(course.id);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4" role="dialog" aria-modal="true" aria-label={course.title}>
      <div onClick={closeQuickView} className="absolute inset-0 animate-fade bg-ink/45 backdrop-blur-sm" />

      <div className="relative max-h-[90vh] w-full max-w-2xl animate-pop overflow-y-auto rounded-[2rem] border border-line bg-cream shadow-lift">
        <button
          type="button"
          onClick={closeQuickView}
          aria-label="إغلاق"
          className="absolute top-4 end-4 z-10 grid size-10 place-items-center rounded-full bg-cream/85 shadow-soft backdrop-blur-sm transition-colors hover:bg-cream"
        >
          <X className="size-5" />
        </button>

        <CourseCover course={course} className="h-44 md:h-52" />

        <div className="space-y-5 p-6 md:p-8">
          <div className="flex flex-wrap gap-2">
            {pct > 0 && <Badge tone="gold">خصم {pct}%</Badge>}
            <Badge tone="brand">{course.duration}</Badge>
            <Badge tone="neutral">{course.level}</Badge>
          </div>

          <h3 className="font-display text-2xl leading-snug font-extrabold text-balance">{course.title}</h3>
          <p className="leading-8 text-ink-soft">{course.shortDescription}</p>

          <ul className="grid gap-3 sm:grid-cols-2">
            {course.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2.5 text-sm leading-6">
                <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-brand-tint text-brand">
                  <Check className="size-3" strokeWidth={3} />
                </span>
                {feature}
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line pt-5">
            <div className="flex items-baseline gap-3">
              <span className="font-display text-3xl font-extrabold text-brand">{formatPrice(course.price, currency)}</span>
              {course.oldPrice && course.oldPrice > course.price && (
                <span className="text-ink-soft line-through">{formatPrice(course.oldPrice, currency)}</span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <Link to={`/courses/${course.slug}`} onClick={closeQuickView} className={btn("secondary", "md")}>
                التفاصيل الكاملة <ArrowLeft className="size-4" />
              </Link>
              {inCart ? (
                <button
                  type="button"
                  onClick={() => {
                    closeQuickView();
                    setCartOpen(true);
                  }}
                  className={btn("outline", "md")}
                >
                  <Check className="size-4" /> في السلة
                </button>
              ) : (
                <button type="button" onClick={() => addToCart(course.id)} className={btn("primary", "md")}>
                  <ShoppingBag className="size-4" /> أضف للسلة
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
