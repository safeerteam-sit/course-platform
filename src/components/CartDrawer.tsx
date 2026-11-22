import { useCallback } from "react";
import { ArrowLeft, ShoppingBag, Trash2, X } from "lucide-react";
import { useStore } from "../context/StoreContext";
import { useEscape, useLockBodyScroll } from "../hooks/overlay";
import { formatPrice } from "../lib/format";
import { Link } from "../lib/router";
import { CourseCover } from "./CourseCover";
import { btn } from "./ui";

export function CartDrawer() {
  const { cartOpen, setCartOpen, cartCourses, removeFromCart, clearCart, currency } = useStore();

  const close = useCallback(() => setCartOpen(false), [setCartOpen]);
  useLockBodyScroll(cartOpen);
  useEscape(cartOpen, close);

  const totalEgp = cartCourses.reduce((sum, course) => sum + course.price, 0);

  return (
    <div className={`fixed inset-0 z-50 ${cartOpen ? "" : "pointer-events-none"}`} aria-hidden={!cartOpen}>
      <div
        onClick={close}
        className={`absolute inset-0 bg-ink/40 backdrop-blur-sm transition-opacity duration-300 ${cartOpen ? "opacity-100" : "opacity-0"}`}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="سلة المشتريات"
        inert={!cartOpen}
        className={`absolute inset-y-0 left-0 flex w-full max-w-md flex-col rounded-r-[2rem] bg-cream shadow-lift transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${cartOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <header className="flex items-center justify-between border-b border-line px-6 py-5">
          <h2 className="flex items-center gap-2 font-display text-xl font-extrabold">
            <ShoppingBag className="size-5 text-brand" /> سلتك
            <span className="rounded-full bg-brand-tint px-2.5 py-0.5 text-sm text-brand">{cartCourses.length}</span>
          </h2>
          <button
            type="button"
            onClick={close}
            aria-label="إغلاق السلة"
            className="grid size-10 place-items-center rounded-full bg-cream-2 transition-colors hover:bg-cream-3"
          >
            <X className="size-5" />
          </button>
        </header>

        {cartCourses.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
            <div className="grid size-20 place-items-center rounded-3xl bg-cream-2 text-ink-soft">
              <ShoppingBag className="size-9" strokeWidth={1.5} />
            </div>
            <p className="font-display text-lg font-bold">سلتك فارغة</p>
            <p className="text-sm leading-7 text-ink-soft">تصفّح الكورسات وأضف ما يناسبك لتبدأ رحلتك.</p>
            <Link to="/courses" onClick={close} className={btn("primary", "md")}>
              تصفّح الكورسات
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 space-y-3 overflow-y-auto px-6 py-5">
              {cartCourses.map((course) => (
                <li key={course.id} className="flex items-center gap-3 rounded-3xl border border-line bg-cream-2/60 p-3">
                  <CourseCover course={course} compact className="size-16 shrink-0 rounded-2xl" />
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm leading-6 font-semibold">{course.title}</p>
                    <p className="mt-1 text-sm font-bold text-brand">{formatPrice(course.price, currency)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFromCart(course.id)}
                    aria-label={`إزالة ${course.title}`}
                    className="grid size-9 shrink-0 place-items-center rounded-full text-ink-soft transition-colors hover:bg-cream-3 hover:text-ink"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </li>
              ))}
            </ul>

            <div className="space-y-3 border-t border-line bg-cream-2/50 px-6 py-5">
              <div className="flex items-center justify-between">
                <span className="text-ink-soft">الإجمالي</span>
                <span className="font-display text-2xl font-extrabold text-brand">{formatPrice(totalEgp, currency)}</span>
              </div>
              {currency.code !== "EGP" && (
                <p className="text-xs leading-6 text-ink-soft">
                  الدفع يتم بالجنيه المصري: {totalEgp.toLocaleString("en-US")} ج.م (السعر بالعملة الأخرى تقريبي).
                </p>
              )}

              <Link to="/checkout" onClick={close} className={btn("primary", "lg", "w-full")}>
                إتمام الطلب <ArrowLeft className="size-5" />
              </Link>
              <button type="button" onClick={clearCart} className="w-full text-center text-sm text-ink-soft hover:text-ink">
                إفراغ السلة
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
