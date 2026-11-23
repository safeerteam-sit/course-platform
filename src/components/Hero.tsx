import { ArrowLeft, Check, UserRound } from "lucide-react";
import { siteConfig } from "../config";
import { heroBadges } from "../data/content";
import { Link } from "../lib/router";
import { btn } from "./ui";

export function Hero() {
  const { instructor } = siteConfig;
  const [b1, b2, b3] = heroBadges;

  return (
    <section className="relative isolate overflow-x-clip">
      <div className="absolute -top-24 -end-24 -z-10 size-[28rem] rounded-full bg-brand-tint blur-3xl" />
      <div className="absolute top-1/2 -start-32 -z-10 size-[24rem] rounded-full bg-gold-tint blur-3xl" />

      <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 py-14 md:px-8 md:py-24 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-gradient-to-r from-orange-500/15 via-purple-500/10 to-orange-500/10 px-4 py-1.5 text-xs font-black text-orange-800 shadow-xs">
            <span className="size-2 rounded-full bg-[#EA580C] animate-pulse" />
            أكاديمية تدريب معتمدة وموجهة لرواد الأعمال
          </div>

          <h1 className="mt-6 font-display text-4xl leading-[1.2] font-black text-balance md:text-6xl md:leading-[1.15]">
            أتقن التسويق الرقمي والذكاء الاصطناعي، وابنِ مهارة{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7C3AED] via-[#FF6B00] to-[#EA580C]">
              تصنع الفارق الحقيقي
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-9 text-ink-soft">
            كورسات عملية تأخذك خطوة بخطوة داخل عالم التسويق الرقمي الحديث وحلول الذكاء الاصطناعي لإدارة الأعمال وصناعة المحتوى، بإشراف وتدريب مباشر.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/courses" className={btn("gradient", "lg")}>
              استكشف الكورسات <ArrowLeft className="size-5" />
            </Link>
            <Link to="/instructor" className={btn("secondary", "lg")}>
              <UserRound className="size-5 text-[#EA580C]" /> تعرّف على المحاضر
            </Link>
          </div>

          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-ink-soft">
            {["محتوى عربي واضح", "تطبيق عملي في كل كورس", "دفع سهل بفودافون كاش وإنستاباي"].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="grid size-5 place-items-center rounded-full bg-brand-tint text-brand">
                  <Check className="size-3" strokeWidth={3} />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* صورة المدرّب مع شارات عائمة وتأثيرات ضوئية */}
        <div className="relative mx-auto w-full max-w-sm lg:max-w-md">
          <div className="absolute inset-0 translate-x-3 translate-y-3 rotate-2 rounded-[2.8rem] bg-linear-to-tr from-[#7C3AED]/35 via-[#FF6B00]/30 to-[#EA580C]/40 blur-md" />
          <div className="relative p-[3px] rounded-[2.8rem] bg-linear-to-tr from-[#7C3AED] via-[#FF6B00] to-[#EA580C] shadow-[0_24px_50px_-12px_rgba(234,88,12,0.4)]">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2.6rem] bg-linear-to-br from-[#1c0f38] via-[#2d124d] to-[#3a1527]">
              {instructor.photo ? (
                <img src={instructor.photo} alt={instructor.name} className="size-full object-cover transition-transform duration-700 hover:scale-105" />
              ) : (
                <div className="relative grid size-full place-items-center bg-linear-to-br from-[#1c0f38] via-[#2d124d] to-[#3a1527]">
                  <div className="dots absolute inset-0 opacity-40" />
                  <div className="relative text-center text-cream">
                    <div className="mx-auto grid size-28 place-items-center rounded-3xl bg-white/10 ring-2 ring-white/25 backdrop-blur-md shadow-2xl transition-transform duration-500 hover:scale-110">
                      <UserRound className="size-16 text-[#FF8A3D]" strokeWidth={1.5} />
                    </div>
                    <p className="mt-4 text-lg font-bold text-white tracking-wide">د. أحمد حسين</p>
                    <p className="text-xs text-orange-300 font-semibold mt-1">مدرّب وخبير الأكاديمية</p>
                  </div>
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/85 via-black/45 to-transparent px-6 pt-16 pb-7 text-cream">
                <p className="font-display text-xl font-black">{instructor.name}</p>
                <p className="text-xs font-semibold text-orange-300 mt-1">{instructor.title}</p>
              </div>
            </div>
          </div>

          <FloatingBadge badge={b1} className="-top-4 -start-3 animate-float md:-start-10" />
          <FloatingBadge badge={b2} className="top-1/2 -end-3 animate-float-slow md:-end-10" />
          <FloatingBadge badge={b3} className="-bottom-7 start-4 animate-float md:start-2" />
        </div>
      </div>
    </section>
  );
}

function FloatingBadge({ badge, className }: { badge: (typeof heroBadges)[number]; className: string }) {
  const Icon = badge.icon;
  return (
    <div className={`glass-card absolute flex items-center gap-3 rounded-2xl border border-white/70 px-4 py-3 shadow-[0_12px_30px_-8px_rgba(234,88,12,0.25)] backdrop-blur-md transition-all duration-300 hover:scale-105 ${className}`}>
      <span className="grid size-10 place-items-center rounded-xl bg-linear-to-br from-[#7C3AED] to-[#EA580C] text-white shadow-md">
        <Icon className="size-5" />
      </span>
      <div className="leading-tight">
        <p className="text-sm font-bold text-ink">{badge.title}</p>
        <p className="text-xs font-medium text-ink-soft">{badge.sub}</p>
      </div>
    </div>
  );
}
