import { ArrowLeft, Check, UserRound } from "lucide-react";
import { siteConfig } from "../config";
import { heroBadges } from "../data/content";
import { Link } from "../lib/router";
import { Badge, btn } from "./ui";

export function Hero() {
  const { instructor } = siteConfig;
  const [b1, b2, b3] = heroBadges;

  return (
    <section className="relative isolate overflow-x-clip">
      <div className="absolute -top-24 -end-24 -z-10 size-[28rem] rounded-full bg-brand-tint blur-3xl" />
      <div className="absolute top-1/2 -start-32 -z-10 size-[24rem] rounded-full bg-gold-tint blur-3xl" />

      <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 py-14 md:px-8 md:py-24 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <Badge tone="gold">منصة كورسات عربية متخصصة</Badge>

          <h1 className="mt-6 font-display text-4xl leading-[1.2] font-black text-balance md:text-6xl md:leading-[1.15]">
            أتقن التسويق الرقمي والذكاء الاصطناعي، وابنِ مهارة <span className="text-brand">تصنع الفرق</span>
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-9 text-ink-soft">
            كورسات عملية بالعربي تأخذك خطوة بخطوة، من أساسيات الإعلانات على ميتا وسناب شات وتيك توك وجوجل، إلى توظيف الذكاء
            الاصطناعي في الميديا وإدارة الأعمال.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/courses" className={btn("primary", "lg")}>
              استكشف الكورسات <ArrowLeft className="size-5" />
            </Link>
            <Link to="/instructor" className={btn("secondary", "lg")}>
              <UserRound className="size-5 text-brand" /> تعرّف على المحاضر
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

        {/* صورة المدرّب مع شارات عائمة */}
        <div className="relative mx-auto w-full max-w-sm lg:max-w-md">
          <div className="absolute inset-0 translate-x-4 translate-y-4 rotate-3 rounded-[2.5rem] bg-gold-tint" />
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] border border-line bg-brand shadow-lift">
            {instructor.photo ? (
              <img src={instructor.photo} alt={instructor.name} className="size-full object-cover" />
            ) : (
              <div className="relative grid size-full place-items-center bg-linear-to-br from-brand to-[#3f917a]">
                <div className="dots absolute inset-0" />
                <div className="relative text-center text-cream">
                  <UserRound className="mx-auto size-28" strokeWidth={1.2} />
                  <p className="mt-3 text-sm opacity-80">ضع صورتك هنا</p>
                </div>
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-ink/60 to-transparent px-5 pt-16 pb-11 text-cream">
              <p className="font-display text-lg font-bold">{instructor.name}</p>
              <p className="text-sm opacity-85">{instructor.title}</p>
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
    <div className={`glass-card absolute flex items-center gap-3 rounded-2xl border border-line px-4 py-3 shadow-soft ${className}`}>
      <span className="grid size-10 place-items-center rounded-xl bg-brand-tint text-brand">
        <Icon className="size-5" />
      </span>
      <div className="leading-tight">
        <p className="text-sm font-bold">{badge.title}</p>
        <p className="text-xs text-ink-soft">{badge.sub}</p>
      </div>
    </div>
  );
}
