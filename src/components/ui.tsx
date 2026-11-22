import type { ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "gold" | "outline" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap transition-all duration-300 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50";

const sizes: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-[15px]",
  lg: "px-8 py-4 text-base",
};

const variants: Record<ButtonVariant, string> = {
  primary: "bg-brand text-cream shadow-soft hover:-translate-y-0.5 hover:bg-brand-dark hover:shadow-lift",
  secondary: "border border-line bg-cream-2 text-ink hover:bg-cream-3",
  gold: "bg-gold text-ink shadow-soft hover:-translate-y-0.5 hover:brightness-95",
  outline: "border border-brand/30 text-brand hover:bg-brand-tint",
  ghost: "text-ink hover:bg-cream-2",
};

/** يرجع كلاسات الزر لاستخدامها على <button> أو <a> */
export function btn(variant: ButtonVariant = "primary", size: ButtonSize = "md", extra = ""): string {
  return [base, sizes[size], variants[variant], extra].filter(Boolean).join(" ");
}

type BadgeTone = "brand" | "gold" | "neutral" | "solid";

const tones: Record<BadgeTone, string> = {
  brand: "bg-brand-tint text-brand",
  gold: "bg-gold-tint text-gold-ink",
  neutral: "bg-cream-3 text-ink-soft",
  solid: "bg-brand text-cream",
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
