import { useEffect } from "react";
import { ArrowLeft, MessageCircle, Star } from "lucide-react";
import { Accordion } from "../components/Accordion";
import { CourseCard } from "../components/CourseCard";
import { FeaturedBanner } from "../components/FeaturedBanner";
import { Hero } from "../components/Hero";
import { Reveal } from "../components/motion";
import { StatsBar } from "../components/StatsBar";
import { SectionHeading, btn } from "../components/ui";
import { siteConfig } from "../config";
import { faqs, steps, whyUs } from "../data/content";
import { useStore } from "../context/StoreContext";
import { Link } from "../lib/router";

export function CardsSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="h-[26rem] animate-pulse rounded-3xl border border-line bg-cream-2/70" />
      ))}
    </div>
  );
}

export function Home() {
  const { courses, loading } = useStore();
  const featured = courses.filter((course) => course.featured);

  useEffect(() => {
    document.title = `${siteConfig.name} | كورسات التسويق الرقمي والذكاء الاصطناعي`;
  }, []);

  return (
    <>
      <Hero />

      <div className="relative z-10 -mt-2">
        <StatsBar />
      </div>

      {/* الكورسات المميزة */}
      <section id="featured" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-20 md:px-8 md:py-28">
        <Reveal>
          <SectionHeading eyebrow="الأكثر طلباً" title="كورسات مختارة لتبدأ بها" subtitle="اخترنا لك أبرز الكورسات التي تناسب من يريد نتائج عملية سريعة." />
        </Reveal>
        <div className="mt-12 space-y-8">
          {featured.map((course, index) => (
            <Reveal key={course.id}>
              <FeaturedBanner course={course} flip={index % 2 === 1} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* كل الكورسات */}
      <section id="courses" className="mx-auto max-w-7xl scroll-mt-24 px-4 pb-20 md:px-8 md:pb-28">
        <Reveal>
          <SectionHeading eyebrow="الكورسات" title="كل الكورسات في مكان واحد" subtitle="تسويق إلكتروني، ذكاء اصطناعي، وإدارة أعمال: اختر مجالك وابدأ." />
        </Reveal>

        <div className="mt-12">
          {loading ? (
            <CardsSkeleton />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((course, index) => (
                <Reveal key={course.id} delay={(index % 3) * 90} className="h-full">
                  <CourseCard course={course} />
                </Reveal>
              ))}
            </div>
          )}
        </div>

        <div className="mt-10 text-center">
          <Link to="/courses" className={btn("outline", "lg")}>
            تصفّح المتجر بالكامل <ArrowLeft className="size-5" />
          </Link>
        </div>
      </section>

      {/* لماذا نحن */}
      <section id="why" className="scroll-mt-24 bg-cream-2/70 py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <Reveal>
            <SectionHeading eyebrow="لماذا نحن" title="تجربة تعلّم مصمّمة لتصل بك إلى التطبيق" />
          </Reveal>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {whyUs.map((item, index) => {
              const Icon = item.icon;
              return (
                <Reveal key={item.title} delay={index * 90} className="h-full">
                  <div className="group card-interactive h-full rounded-3xl border border-line bg-cream/90 backdrop-blur-sm p-7 shadow-soft transition-all duration-500 hover:-translate-y-2 hover:border-orange-500/40 hover:shadow-[0_20px_45px_-10px_rgba(234,88,12,0.25)]">
                    <span className="grid size-14 place-items-center rounded-2xl bg-linear-to-br from-[#7C3AED] to-[#EA580C] text-white shadow-md group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                      <Icon className="size-7" strokeWidth={1.8} />
                    </span>
                    <h3 className="mt-5 font-display text-lg font-bold group-hover:text-[#EA580C] transition-colors">{item.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-ink-soft">{item.text}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* رحلتك */}
      <section className="mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-28">
        <Reveal>
          <SectionHeading eyebrow="رحلتك" title="من الاختيار إلى التطبيق في أربع خطوات" />
        </Reveal>
        <ol className="relative mt-14 grid gap-8 md:grid-cols-4">
          <div className="absolute start-[12%] end-[12%] top-8 hidden h-px bg-line md:block" />
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <Reveal key={step.title} delay={index * 110}>
                <li className="group relative text-center">
                  <span className="relative mx-auto grid size-16 place-items-center rounded-full border-2 border-orange-500/30 bg-cream text-brand shadow-soft transition-transform duration-300 group-hover:scale-110">
                    <Icon className="size-7 text-[#EA580C]" strokeWidth={1.8} />
                    <span className="absolute -top-1 -end-1 grid size-6 place-items-center rounded-full bg-linear-to-r from-[#FF6B00] to-[#EA580C] text-xs font-black text-white shadow-sm">
                      {index + 1}
                    </span>
                  </span>
                  <h3 className="mt-5 font-display text-lg font-bold group-hover:text-[#EA580C] transition-colors">{step.title}</h3>
                  <p className="mx-auto mt-2 max-w-[16rem] text-sm leading-7 text-ink-soft">{step.text}</p>
                </li>
              </Reveal>
            );
          })}
        </ol>
      </section>

      {/* آراء المتدربين: تظهر فقط عند إضافة آراء حقيقية في config */}
      {siteConfig.testimonials.length > 0 && (
        <section className="bg-cream-2/70 py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-4 md:px-8">
            <Reveal>
              <SectionHeading eyebrow="آراء المتدربين" title="ماذا يقول من تعلّموا معنا" />
            </Reveal>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {siteConfig.testimonials.map((t, index) => (
                <Reveal key={t.name + index} delay={index * 90} className="h-full">
                  <figure className="h-full rounded-3xl border border-line bg-cream p-7 shadow-soft">
                    <div className="flex gap-1 text-gold">
                      {Array.from({ length: Math.round(t.rating) }, (_, i) => (
                        <Star key={i} className="size-4 fill-current" />
                      ))}
                    </div>
                    <blockquote className="mt-4 leading-8 text-ink-soft">{t.text}</blockquote>
                    <figcaption className="mt-5 flex items-center gap-3">
                      <span className="grid size-11 place-items-center rounded-full bg-brand text-base font-bold text-cream">
                        {t.name.charAt(0)}
                      </span>
                      <span className="leading-tight">
                        <span className="block font-semibold">{t.name}</span>
                        <span className="text-xs text-ink-soft">{t.role}</span>
                      </span>
                    </figcaption>
                  </figure>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* الأسئلة الشائعة */}
      <section id="faq" className="mx-auto max-w-3xl scroll-mt-24 px-4 py-20 md:px-8 md:py-28">
        <Reveal>
          <SectionHeading eyebrow="أسئلة شائعة" title="إجابات سريعة قبل أن تبدأ" />
        </Reveal>
        <Reveal className="mt-10">
          <Accordion items={faqs.map((f) => ({ id: f.id, title: f.q, content: f.a }))} defaultOpenId="f1" />
        </Reveal>
      </section>

      {/* دعوة أخيرة */}
      <section className="mx-auto max-w-7xl px-4 md:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2.5rem] bg-linear-to-br from-brand to-brand-dark px-6 py-16 text-center text-cream shadow-lift md:px-16 md:py-20">
            <div className="dots absolute inset-0" />
            <div className="absolute -top-20 -start-20 size-72 rounded-full bg-cream/5" />
            <div className="absolute -bottom-24 -end-16 size-80 rounded-full bg-gold/10" />
            <h2 className="relative mx-auto max-w-2xl font-display text-3xl leading-tight font-extrabold text-balance md:text-5xl">
              جاهز تبدأ رحلتك اليوم؟
            </h2>
            <p className="relative mx-auto mt-5 max-w-xl text-lg leading-8 opacity-90">
              اختر الكورس المناسب لهدفك، أو راسلنا ونساعدك في اختيار الأنسب.
            </p>
            <div className="relative mt-8 flex flex-wrap justify-center gap-3">
              <Link to="/courses" className={btn("gold", "lg")}>
                تصفّح الكورسات <ArrowLeft className="size-5" />
              </Link>
              <a
                href={`https://wa.me/${siteConfig.whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className={btn("ghost", "lg", "border border-cream/30 text-cream! hover:bg-cream/10!")}
              >
                <MessageCircle className="size-5" /> تحدّث معنا
              </a>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
