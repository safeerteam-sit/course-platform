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
        className={`grid gap-6 rounded-[2rem] border border-line bg-cream-2/70 p-8 shadow-soft ${items.length > 2 ? "grid-cols-2 md:grid-cols-4" : "grid-cols-2"}`}
      >
        {items.map((item) => (
          <div key={item.label} className="text-center">
            <div className="font-display text-4xl font-black text-brand md:text-5xl">
              <CountUp to={item.value} decimals={item.decimals} suffix={item.suffix} />
            </div>
            <div className="mt-2 text-sm text-ink-soft">{item.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
