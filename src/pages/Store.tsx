import { useEffect, useMemo, useState } from "react";
import { MessageCircle, Search, SearchX } from "lucide-react";
import { CourseCard } from "../components/CourseCard";
import { Reveal } from "../components/motion";
import { btn } from "../components/ui";
import { siteConfig } from "../config";
import { useStore } from "../context/StoreContext";
import { categories } from "../data/courses";
import { CardsSkeleton } from "./Home";

type Sort = "default" | "price-asc" | "price-desc";

export function Store({ initialCategory = "all" }: { initialCategory?: string }) {
  const { courses, loading } = useStore();
  const [category, setCategory] = useState(initialCategory);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("default");

  useEffect(() => {
    document.title = `الكورسات | ${siteConfig.name}`;
  }, []);

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: courses.length };
    for (const course of courses) map[course.category] = (map[course.category] ?? 0) + 1;
    return map;
  }, [courses]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = courses.filter((course) => category === "all" || course.category === category);
    if (q) list = list.filter((course) => `${course.title} ${course.shortDescription}`.toLowerCase().includes(q));
    if (sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [courses, category, query, sort]);

  return (
    <>
      {/* شريط التصنيفات للموبايل */}
      <div className="glass sticky top-[4.5rem] z-30 border-b border-line/70 lg:hidden">
        <div className="no-scrollbar flex snap-x gap-2 overflow-x-auto px-4 py-3">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategory(cat.id)}
              className={`shrink-0 snap-start rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-300 ${
                category === cat.id ? "border-brand bg-brand text-cream shadow-soft" : "border-line bg-cream-2 text-ink-soft"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
        <div className="mb-10 max-w-2xl">
          <h1 className="font-display text-3xl font-extrabold md:text-5xl">متجر الكورسات</h1>
          <p className="mt-3 text-lg leading-8 text-ink-soft">اختر مجالك، وقارن بين الكورسات، وابدأ رحلتك.</p>
        </div>

        <div className="grid items-start gap-8 lg:grid-cols-[17rem_1fr]">
          {/* القائمة الجانبية الثابتة للديسكتوب */}
          <aside className="sticky top-28 hidden space-y-5 lg:block">
            <div className="rounded-3xl border border-line bg-cream-2/60 p-5 shadow-soft">
              <h2 className="mb-3 font-display font-bold">التصنيفات</h2>
              <ul className="space-y-1.5">
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <button
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-300 ${
                        category === cat.id ? "bg-brand text-cream shadow-soft" : "text-ink-soft hover:bg-cream-3"
                      }`}
                    >
                      {cat.label}
                      <span className={`rounded-full px-2 py-0.5 text-xs ${category === cat.id ? "bg-cream/20" : "bg-cream-3"}`}>
                        {counts[cat.id] ?? 0}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl bg-brand-tint p-5">
              <p className="font-display font-bold text-brand">محتار في الاختيار؟</p>
              <p className="mt-2 text-sm leading-7 text-ink-soft">راسلنا ونرشّح لك الكورس الأنسب لهدفك.</p>
              <a
                href={`https://wa.me/${siteConfig.whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className={btn("primary", "sm", "mt-4")}
              >
                <MessageCircle className="size-4" /> واتساب
              </a>
            </div>
          </aside>

          <div>
            <div className="mb-6 flex flex-col gap-3 sm:flex-row">
              <label className="relative flex-1">
                <span className="sr-only">ابحث عن كورس</span>
                <Search className="pointer-events-none absolute top-1/2 start-4 size-5 -translate-y-1/2 text-ink-soft" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="ابحث عن كورس…"
                  className="w-full rounded-full border border-line bg-cream-2 py-3 ps-12 pe-4 text-[15px] placeholder:text-ink-soft/60 focus:border-brand focus:outline-none"
                />
              </label>
              <label>
                <span className="sr-only">الترتيب</span>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as Sort)}
                  className="w-full rounded-full border border-line bg-cream-2 px-5 py-3 text-[15px] font-medium sm:w-auto"
                >
                  <option value="default">الترتيب الافتراضي</option>
                  <option value="price-asc">السعر: الأقل أولاً</option>
                  <option value="price-desc">السعر: الأعلى أولاً</option>
                </select>
              </label>
            </div>

            {loading ? (
              <CardsSkeleton count={4} />
            ) : visible.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-line bg-cream-2/50 px-6 py-16 text-center">
                <SearchX className="mx-auto size-10 text-ink-soft" strokeWidth={1.5} />
                <p className="mt-4 font-display text-lg font-bold">لا توجد نتائج مطابقة</p>
                <p className="mt-1 text-sm text-ink-soft">جرّب كلمة بحث أخرى أو غيّر التصنيف.</p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {visible.map((course, index) => (
                  <Reveal key={course.id} delay={(index % 3) * 80} className="h-full">
                    <CourseCard course={course} />
                  </Reveal>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
