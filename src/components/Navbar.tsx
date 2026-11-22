import { useState } from "react";
import { ChevronDown, Menu, ShoppingBag, Sparkles, UserRound, X } from "lucide-react";
import { siteConfig } from "../config";
import { useStore } from "../context/StoreContext";
import { Link, goToSection, useRoute } from "../lib/router";

const navLinkClass =
  "rounded-full px-4 py-2 text-[15px] font-medium text-ink-soft transition-colors hover:bg-cream-2 hover:text-ink";

export function Navbar() {
  const { cartIds, setCartOpen, currency, setCurrencyCode } = useStore();
  const path = useRoute();
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  const isHome = path === "/";
  const isCourses = path.startsWith("/courses");
  const isInstructor = path === "/instructor";

  return (
    <header className="glass sticky top-0 z-40 border-b border-line/70">
      <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between gap-3 px-4 md:px-8">
        <Link to="/" onClick={closeMenu} className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-2xl bg-brand text-cream shadow-soft">
            <Sparkles className="size-5" />
          </span>
          <span className="font-display text-lg font-extrabold whitespace-nowrap">{siteConfig.name}</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="التنقل الرئيسي">
          <Link to="/" className={`${navLinkClass} ${isHome ? "bg-cream-2 text-ink!" : ""}`}>
            الرئيسية
          </Link>
          <Link to="/courses" className={`${navLinkClass} ${isCourses ? "bg-cream-2 text-ink!" : ""}`}>
            الكورسات
          </Link>
          <button type="button" onClick={() => goToSection("why")} className={navLinkClass}>
            لماذا نحن
          </button>
          <button type="button" onClick={() => goToSection("faq")} className={navLinkClass}>
            الأسئلة الشائعة
          </button>
          <Link
            to="/instructor"
            className={`ms-2 inline-flex items-center gap-2 rounded-full border border-gold/60 bg-gold-tint px-4 py-2 text-[15px] font-semibold text-gold-ink transition-all duration-300 hover:-translate-y-0.5 hover:shadow-soft ${isInstructor ? "ring-2 ring-gold/50" : ""}`}
          >
            <UserRound className="size-4" /> عن المحاضر
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <label className="relative hidden sm:block">
            <span className="sr-only">العملة</span>
            <select
              value={currency.code}
              onChange={(event) => setCurrencyCode(event.target.value)}
              className="appearance-none rounded-full border border-line bg-cream-2 py-2 ps-4 pe-9 text-sm font-medium text-ink"
            >
              {siteConfig.currencies.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-ink-soft" />
          </label>

          <button
            type="button"
            onClick={() => setCartOpen(true)}
            aria-label={`السلة، ${cartIds.length} كورس`}
            className="relative grid size-11 place-items-center rounded-full bg-brand text-cream shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand-dark"
          >
            <ShoppingBag className="size-5" />
            {cartIds.length > 0 && (
              <span className="absolute -top-1 -end-1 grid size-5 place-items-center rounded-full bg-gold text-[11px] font-bold text-ink">
                {cartIds.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? "إغلاق القائمة" : "فتح القائمة"}
            aria-expanded={menuOpen}
            className="grid size-11 place-items-center rounded-full border border-line bg-cream-2 lg:hidden"
          >
            {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="animate-pop px-4 pb-4 lg:hidden">
          <nav className="flex flex-col rounded-3xl border border-line bg-cream p-2 shadow-soft" aria-label="القائمة">
            <Link to="/" onClick={closeMenu} className={`${navLinkClass} py-3`}>
              الرئيسية
            </Link>
            <Link to="/courses" onClick={closeMenu} className={`${navLinkClass} py-3`}>
              الكورسات
            </Link>
            <button
              type="button"
              onClick={() => {
                closeMenu();
                goToSection("why");
              }}
              className={`${navLinkClass} py-3 text-start`}
            >
              لماذا نحن
            </button>
            <button
              type="button"
              onClick={() => {
                closeMenu();
                goToSection("faq");
              }}
              className={`${navLinkClass} py-3 text-start`}
            >
              الأسئلة الشائعة
            </button>
            <Link
              to="/instructor"
              onClick={closeMenu}
              className="mt-1 flex items-center gap-2 rounded-2xl bg-gold-tint px-4 py-3 text-[15px] font-semibold text-gold-ink"
            >
              <UserRound className="size-4" /> عن المحاضر
            </Link>
            <label className="mt-1 flex items-center justify-between rounded-2xl bg-cream-2 px-4 py-3 text-[15px] sm:hidden">
              <span className="font-medium text-ink-soft">العملة</span>
              <select
                value={currency.code}
                onChange={(event) => setCurrencyCode(event.target.value)}
                className="rounded-full border border-line bg-cream px-4 py-1.5 text-sm font-medium"
              >
                {siteConfig.currencies.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label}
                  </option>
                ))}
              </select>
            </label>
          </nav>
        </div>
      )}
    </header>
  );
}
