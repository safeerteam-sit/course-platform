import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

export interface AccordionItem {
  id: string;
  title: string;
  meta?: string;
  content: ReactNode;
}

export function Accordion({ items, defaultOpenId = null }: { items: AccordionItem[]; defaultOpenId?: string | null }) {
  const [openId, setOpenId] = useState<string | null>(defaultOpenId);

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const open = item.id === openId;
        return (
          <div
            key={item.id}
            className={`rounded-3xl border transition-colors duration-300 ${open ? "border-brand/30 bg-cream-2" : "border-line bg-cream-2/50"}`}
          >
            <button
              type="button"
              onClick={() => setOpenId(open ? null : item.id)}
              aria-expanded={open}
              aria-controls={`acc-${item.id}`}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-start md:px-6 md:py-5"
            >
              <span className="font-display text-base font-bold md:text-lg">{item.title}</span>
              <span className="flex shrink-0 items-center gap-3">
                {item.meta && <span className="hidden text-sm text-ink-soft sm:inline">{item.meta}</span>}
                <span
                  className={`grid size-8 place-items-center rounded-full transition-all duration-300 ${open ? "rotate-180 bg-brand text-cream" : "bg-cream-3 text-ink"}`}
                >
                  <ChevronDown className="size-4" />
                </span>
              </span>
            </button>
            <div
              id={`acc-${item.id}`}
              className={`grid transition-[grid-template-rows] duration-300 ease-out ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
            >
              <div className="overflow-hidden">
                <div className="px-5 pb-5 text-[15px] leading-8 text-ink-soft md:px-6">{item.content}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
