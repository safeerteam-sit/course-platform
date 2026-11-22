import { useEffect } from "react";
import { BookOpen, Check, ChevronLeft, Clock, MessageCircle, CirclePlay, ShoppingBag, Signal, UserRound } from "lucide-react";
import { Accordion } from "../components/Accordion";
import { CourseCard } from "../components/CourseCard";
import { CourseCover } from "../components/CourseCover";
import { Reveal } from "../components/motion";
import { Badge, btn } from "../components/ui";
import { siteConfig } from "../config";
import { useStore } from "../context/StoreContext";
import { countLessons, discountPercent, formatPrice } from "../lib/format";
import { Link } from "../lib/router";
import { CardsSkeleton } from "./Home";

export function CourseDetails({ slug }: { slug: string }) {
  const { courses, loading, currency, addToCart, has, setCartOpen } = useStore();
  const course = courses.find((c) => c.slug === slug);

  useEffect(() => {
    document.title = course ? `${course.title} | ${siteConfig.name}` : siteConfig.name;
  }, [course]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-14 md:px-8">
        <CardsSkeleton count={3} />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="font-display text-3xl font-extrabold">لم نجد هذا الكورس</h1>
        <p className="mt-3 text-ink-soft">ربما تغيّر الرابط أو لم يعد الكورس متاحاً.</p>
        <Link to="/courses" className={btn("primary", "lg", "mt-8")}>
          العودة إلى الكورسات
        </Link>
      </div>
    );
  }

  const pct = discountPercent(course.price, course.oldPrice);
  const inCart = has(course.id);
  const related = courses.filter((c) => c.id !== course.id).slice(0, 3);
  const { instructor } = siteConfig;

  const buyButton = inCart ? (
    <button type="button" onClick={() => setCartOpen(true)} className={btn("outline", "lg", "w-full")}>
      <Check className="size-5" /> الكورس في سلتك
    </button>
  ) : (
    <button type="button" onClick={() => addToCart(course.id)} className={btn("primary", "lg", "w-full")}>
      <ShoppingBag className="size-5" /> اشترك الآن
    </button>
  );

  return (
    <div className="pb-24 lg:pb-0">
      <div className="mx-auto max-w-7xl px-4 pt-8 md:px-8">
        <nav aria-label="مسار التنقل" className="flex flex-wrap items-center gap-1.5 text-sm text-ink-soft">
          <Link to="/" className="hover:text-brand">
            الرئيسية
          </Link>
          <ChevronLeft className="size-4" />
          <Link to="/courses" className="hover:text-brand">
            الكورسات
          </Link>
          <ChevronLeft className="size-4" />
          <span className="text-ink">{course.title}</span>
        </nav>
      </div>

      <div className="mx-auto grid max-w-7xl items-start gap-10 px-4 py-10 md:px-8 lg:grid-cols-[1fr_22rem]">
        <div className="min-w-0 space-y-12">
          <section>
            <div className="group overflow-hidden rounded-[2rem] shadow-soft">
              <CourseCover course={course} className="h-56 md:h-72" />
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              {pct > 0 && <Badge tone="gold">خصم {pct}%</Badge>}
              <Badge tone="brand">{course.level}</Badge>
            </div>
            <h1 className="mt-4 font-display text-3xl leading-tight font-black text-balance md:text-5xl">{course.title}</h1>
            <p className="mt-4 text-lg leading-9 text-ink-soft">{course.shortDescription}</p>
            <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm text-ink-soft">
              <li className="flex items-center gap-2">
                <BookOpen className="size-4 text-brand" /> {countLessons(course)} درساً
              </li>
              <li className="flex items-center gap-2">
                <Clock className="size-4 text-brand" /> {course.duration}
              </li>
              <li className="flex items-center gap-2">
                <Signal className="size-4 text-brand" /> {course.level}
              </li>
            </ul>
          </section>

          <Reveal>
            <section className="rounded-[2rem] border border-line bg-cream-2/60 p-7 md:p-9">
              <h2 className="font-display text-2xl font-extrabold">ما الذي ستتعلمه؟</h2>
              <ul className="mt-6 grid gap-4 sm:grid-cols-2">
                {course.outcomes.map((item) => (
                  <li key={item} className="flex items-start gap-3 leading-7">
                    <span className="mt-1 grid size-5 shrink-0 place-items-center rounded-full bg-brand-tint text-brand">
                      <Check className="size-3" strokeWidth={3} />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          </Reveal>

          <Reveal>
            <section>
              <h2 className="font-display text-2xl font-extrabold">عن الكورس</h2>
              <div className="mt-4 space-y-4 leading-9 text-ink-soft">
                {course.longDescription.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          </Reveal>

          <Reveal>
            <section>
              <h2 className="font-display text-2xl font-extrabold">منهج الكورس</h2>
              <p className="mt-2 text-sm text-ink-soft">
                {course.curriculum.length} وحدات · {countLessons(course)} درساً
              </p>
              <div className="mt-6">
                <Accordion
                  defaultOpenId="u0"
                  items={course.curriculum.map((unit, i) => ({
                    id: `u${i}`,
                    title: `${i + 1}. ${unit.title}`,
                    meta: `${unit.lessons.length} دروس`,
                    content: (
                      <ul className="space-y-2.5">
                        {unit.lessons.map((lesson) => (
                          <li key={lesson} className="flex items-center gap-3">
                            <CirclePlay className="size-4 shrink-0 text-brand" /> {lesson}
                          </li>
                        ))}
                      </ul>
                    ),
                  }))}
                />
              </div>
            </section>
          </Reveal>

          <Reveal>
            <section className="flex flex-col items-center gap-6 rounded-[2rem] border border-line bg-cream-2/60 p-7 sm:flex-row md:p-9">
              <div className="grid size-24 shrink-0 place-items-center overflow-hidden rounded-3xl bg-brand text-cream">
                {instructor.photo ? (
                  <img src={instructor.photo} alt={instructor.name} className="size-full object-cover" />
                ) : (
                  <UserRound className="size-12" strokeWidth={1.4} />
                )}
              </div>
              <div className="text-center sm:text-start">
                <p className="text-sm text-ink-soft">مدرّب الكورس</p>
                <h3 className="font-display text-xl font-extrabold">{instructor.name}</h3>
                <p className="text-sm font-medium text-brand">{instructor.title}</p>
                <p className="mt-3 leading-8 text-ink-soft">{instructor.bio}</p>
              </div>
            </section>
          </Reveal>
        </div>

        {/* بطاقة الشراء الثابتة */}
        <aside className="sticky top-28 hidden space-y-4 lg:block">
          <div className="rounded-[2rem] border border-line bg-cream-2/70 p-7 shadow-lift">
            <div className="flex items-baseline gap-3">
              <span className="font-display text-4xl font-black text-brand">{formatPrice(course.price, currency)}</span>
              {course.oldPrice && course.oldPrice > course.price && (
                <span className="text-ink-soft line-through">{formatPrice(course.oldPrice, currency)}</span>
              )}
            </div>
            {pct > 0 && <Badge tone="gold" className="mt-3">وفّر {pct}%</Badge>}
            <div className="mt-6">{buyButton}</div>
            <a
              href={`https://wa.me/${siteConfig.whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className={btn("secondary", "md", "mt-3 w-full")}
            >
              <MessageCircle className="size-5 text-brand" /> اسأل قبل الاشتراك
            </a>
            <ul className="mt-6 space-y-3 border-t border-line pt-6 text-sm">
              {course.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2.5 leading-6">
                  <Check className="mt-1 size-4 shrink-0 text-brand" strokeWidth={3} /> {feature}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      <section className="mx-auto max-w-7xl px-4 pt-6 md:px-8">
        <h2 className="mb-8 font-display text-2xl font-extrabold">كورسات قد تهمك</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {related.map((c) => (
            <CourseCard key={c.id} course={c} />
          ))}
        </div>
      </section>

      {/* شريط الشراء السفلي للموبايل */}
      <div className="glass fixed inset-x-0 bottom-0 z-30 border-t border-line p-3 lg:hidden">
        <div className="mx-auto flex max-w-xl items-center justify-between gap-4">
          <div className="leading-tight">
            <div className="font-display text-xl font-extrabold text-brand">{formatPrice(course.price, currency)}</div>
            {course.oldPrice && course.oldPrice > course.price && (
              <div className="text-xs text-ink-soft line-through">{formatPrice(course.oldPrice, currency)}</div>
            )}
          </div>
          <div className="flex-1">{buyButton}</div>
        </div>
      </div>
    </div>
  );
}
