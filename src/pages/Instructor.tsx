import { useEffect } from "react";
import { ArrowLeft, Check, MessageCircle, UserRound } from "lucide-react";
import { CourseCard } from "../components/CourseCard";
import { Reveal } from "../components/motion";
import { Badge, SectionHeading, btn } from "../components/ui";
import { siteConfig } from "../config";
import { useStore } from "../context/StoreContext";
import { Link } from "../lib/router";

export function Instructor() {
  const { instructor } = siteConfig;
  const { courses } = useStore();

  useEffect(() => {
    document.title = `${instructor.name} | ${siteConfig.name}`;
  }, [instructor.name]);

  return (
    <>
      <section className="relative isolate overflow-x-clip">
        <div className="absolute -top-20 -start-20 -z-10 size-[26rem] rounded-full bg-gold-tint blur-3xl" />
        <div className="absolute -bottom-10 -end-20 -z-10 size-[24rem] rounded-full bg-brand-tint blur-3xl" />

        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-14 md:px-8 md:py-24 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="relative mx-auto w-full max-w-sm">
            <div className="absolute inset-0 -translate-x-4 translate-y-4 -rotate-3 rounded-[2.5rem] bg-gold-tint" />
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
            </div>
          </div>

          <div>
            <Badge tone="gold">تعرّف على المحاضر</Badge>
            <h1 className="mt-5 font-display text-4xl leading-tight font-black text-balance md:text-6xl">{instructor.name}</h1>
            <p className="mt-3 text-xl font-semibold text-brand">{instructor.title}</p>

            <div className="mt-6 space-y-4 text-lg leading-9 text-ink-soft">
              {instructor.about.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/courses" className={btn("primary", "lg")}>
                شاهد الكورسات <ArrowLeft className="size-5" />
              </Link>
              <a
                href={`https://wa.me/${siteConfig.whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className={btn("secondary", "lg")}
              >
                <MessageCircle className="size-5 text-brand" /> تواصل معي
              </a>
            </div>
          </div>
        </div>
      </section>

      {instructor.achievements.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 md:px-8">
          <Reveal>
            <div className="grid grid-cols-2 gap-6 rounded-[2rem] border border-line bg-cream-2/70 p-8 shadow-soft md:grid-cols-4">
              {instructor.achievements.map((item) => (
                <div key={item.label} className="text-center">
                  <div className="font-display text-4xl font-black text-brand md:text-5xl">{item.value}</div>
                  <div className="mt-2 text-sm text-ink-soft">{item.label}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </section>
      )}

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-20 md:px-8 lg:grid-cols-2">
        <Reveal>
          <div className="h-full rounded-[2rem] border border-line bg-cream-2/60 p-8 md:p-10">
            <h2 className="font-display text-2xl font-extrabold">مجالات الخبرة</h2>
            <ul className="mt-6 flex flex-wrap gap-3">
              {instructor.expertise.map((item) => (
                <li key={item} className="rounded-full border border-line bg-cream px-4 py-2 text-sm font-medium">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
        <Reveal delay={100}>
          <div className="h-full rounded-[2rem] bg-brand-tint p-8 md:p-10">
            <h2 className="font-display text-2xl font-extrabold text-brand">ماذا ستجد معي؟</h2>
            <ul className="mt-6 space-y-4">
              {instructor.promises.map((item) => (
                <li key={item} className="flex items-start gap-3 leading-7">
                  <span className="mt-1 grid size-5 shrink-0 place-items-center rounded-full bg-brand text-cream">
                    <Check className="size-3" strokeWidth={3} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-8 md:px-8">
        <SectionHeading eyebrow="كورساتي" title="الكورسات التي أقدّمها" />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </section>
    </>
  );
}
