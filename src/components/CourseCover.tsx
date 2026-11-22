import { Briefcase, Megaphone, Search, Sparkles, Video, type LucideIcon } from "lucide-react";
import type { Course, CoverIcon } from "../types";

const icons: Record<CoverIcon, LucideIcon> = {
  sparkles: Sparkles,
  megaphone: Megaphone,
  video: Video,
  search: Search,
  briefcase: Briefcase,
};

const categoryLabels = { ai: "الذكاء الاصطناعي", marketing: "التسويق الإلكتروني", business: "إدارة الأعمال" } as const;

/**
 * غلاف الكورس: تدرّج لوني بدل صورة خارجية.
 * عند وضع الكاردين داخل عنصر له class="group" تحصل على تكبير ناعم عند التمرير.
 */
export function CourseCover({ course, className = "", compact = false }: { course: Course; className?: string; compact?: boolean }) {
  const Icon = icons[course.theme.icon];
  return (
    <div
      className={`relative isolate overflow-hidden ${className}`}
      style={{ background: `linear-gradient(135deg, ${course.theme.from}, ${course.theme.to})` }}
    >
      <div className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-110">
        <div className="dots absolute inset-0" />
        <div className="absolute -top-12 -start-12 size-48 rounded-full bg-cream/10" />
        <div className="absolute -bottom-16 -end-10 size-56 rounded-full bg-cream/10" />
        <div className="absolute inset-0 grid place-items-center">
          <div
            className={`grid place-items-center bg-cream/15 ring-1 ring-cream/30 backdrop-blur-sm ${compact ? "size-9 rounded-xl" : "size-20 rounded-3xl md:size-24"}`}
          >
            <Icon className={compact ? "size-5 text-cream" : "size-9 text-cream md:size-11"} strokeWidth={1.6} />
          </div>
        </div>
      </div>
      {!compact && (
        <span className="absolute bottom-3 start-4 rounded-full bg-ink/25 px-3 py-1 text-xs font-medium text-cream backdrop-blur-sm">
          {categoryLabels[course.category]}
        </span>
      )}
    </div>
  );
}
