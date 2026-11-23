import type { ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "gold" | "gradient" | "outline" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap transition-all duration-300 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 cursor-pointer";

const sizes: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-[15px]",
  lg: "px-8 py-4 text-base",
};

const variants: Record<ButtonVariant, string> = {
  primary: "bg-linear-to-r from-brand via-[#8B5CF6] to-brand-dark text-cream shadow-soft hover:-translate-y-0.5 hover:shadow-lift hover:brightness-110",
  gradient: "bg-linear-to-r from-[#7C3AED] via-[#FF6B00] to-[#EA580C] text-white shadow-[0_12px_28px_-6px_rgba(234,88,12,0.45)] hover:-translate-y-1 hover:shadow-[0_16px_36px_-4px_rgba(234,88,12,0.6)] hover:brightness-110",
  secondary: "border border-line bg-cream-2/90 text-ink hover:bg-cream-3 hover:-translate-y-0.5 transition-transform",
  gold: "bg-linear-to-r from-[#FF6B00] to-[#EA580C] text-white shadow-[0_8px_20px_-4px_rgba(234,88,12,0.4)] hover:-translate-y-0.5 hover:brightness-105 hover:shadow-[0_12px_28px_-4px_rgba(234,88,12,0.55)]",
  outline: "border-2 border-brand/40 text-brand hover:bg-brand-tint hover:border-brand transition-colors",
  ghost: "text-ink hover:bg-cream-2",
};

/** يرجع كلاسات الزر لاستخدامها على <button> أو <a> */
export function btn(variant: ButtonVariant = "primary", size: ButtonSize = "md", extra = ""): string {
  return [base, sizes[size], variants[variant], extra].filter(Boolean).join(" ");
}

type BadgeTone = "brand" | "gold" | "neutral" | "solid" | "orange";

const tones: Record<BadgeTone, string> = {
  brand: "border border-purple-500/30 bg-purple-500/10 text-purple-700 font-bold",
  gold: "border border-orange-500/40 bg-orange-500/15 text-orange-800 font-extrabold shadow-xs",
  orange: "bg-linear-to-r from-[#FF6B00] to-[#EA580C] text-white font-black shadow-[0_4px_14px_rgba(234,88,12,0.4)]",
  neutral: "bg-cream-3 text-ink-soft",
  solid: "bg-linear-to-r from-brand to-[#EA580C] text-cream font-bold",
};

export function Badge({ tone = "brand", children, className = "" }: { tone?: BadgeTone; children: ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${tones[tone]} ${className}`}>
      {children}
    </span>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "center" | "start";
}) {
  return (
    <div className={`mx-auto max-w-2xl ${align === "center" ? "text-center" : "text-start"} ${align === "start" ? "mx-0" : ""}`}>
      {eyebrow && <Badge tone="gold">{eyebrow}</Badge>}
      <h2 className="mt-4 font-display text-3xl leading-tight font-extrabold text-balance md:text-4xl">{title}</h2>
      {subtitle && <p className="mt-4 text-base leading-8 text-ink-soft md:text-lg">{subtitle}</p>}
    </div>
  );
}
