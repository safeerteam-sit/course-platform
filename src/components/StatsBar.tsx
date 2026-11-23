import { siteConfig } from "../config";
import { useStore } from "../context/StoreContext";
import { countLessons } from "../lib/format";
import { CountUp } from "./motion";

/** شريط أرقام: الأرقام المحسوبة من بياناتك + أرقام اختيارية من config */
export function StatsBar() {
  const { courses } = useStore();
  const lessons = courses.reduce((sum, course) => sum + countLessons(course), 0);

  const items: { value: number; label: string; decimals?: number; suffix?: string }[] = [
    { value: courses.length, label: "كورس احترافي" },
    { value: lessons, label: "درس تطبيقي" },
  ];
  if (siteConfig.stats.students) items.push({ value: siteConfig.stats.students, label: "متدرب", suffix: "+" });
  if (siteConfig.stats.rating) items.push({ value: siteConfig.stats.rating, label: "تقييم المتدربين", decimals: 1 });

  return (
    <section className="mx-auto max-w-7xl px-4 md:px-8">
      <div
        className={`grid gap-6 rounded-[2rem] border border-orange-500/20 bg-cream-2/80 backdrop-blur-md p-8 shadow-[0_16px_40px_-12px_rgba(234,88,12,0.18)] ${items.length > 2 ? "grid-cols-2 md:grid-cols-4" : "grid-cols-2"}`}
      >
        {items.map((item) => (
          <div key={item.label} className="text-center">
            <div className="font-display text-4xl font-black text-transparent bg-clip-text bg-linear-to-r from-[#7C3AED] via-[#9333EA] to-[#EA580C] md:text-5xl">
              <CountUp to={item.value} decimals={item.decimals} suffix={item.suffix} />
            </div>
            <div className="mt-2 text-sm font-semibold text-ink-soft">{item.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
