interface SafeerLogoProps {
  className?: string;
  variant?: "full" | "icon" | "mark";
  size?: "sm" | "md" | "lg" | "xl";
}

export function SafeerLogo({
  className = "",
  variant = "full",
  size = "md",
}: SafeerLogoProps) {
  const iconSizes = {
    sm: "size-8",
    md: "size-10",
    lg: "size-14",
    xl: "size-20",
  };

  const textSizes = {
    sm: "text-base",
    md: "text-xl",
    lg: "text-2xl",
    xl: "text-3xl",
  };

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {/* Real Extracted Logo Emblem (Concept 1: The Ascent S-Ribbon) */}
      <div className={`relative flex items-center justify-center shrink-0 ${iconSizes[size]}`}>
        <img
          src="/safeer-emblem.png"
          alt="شعار أكاديمية سفير"
          className="size-full object-contain filter drop-shadow-[0_4px_12px_rgba(255,107,0,0.35)] transition-transform duration-300 hover:scale-105"
        />
      </div>

      {/* Typography: Bilingual Brand Name */}
      {variant === "full" && (
        <div className="flex flex-col text-start leading-none">
          <span className={`font-display font-black tracking-tight text-ink ${textSizes[size]}`}>
            سفير
          </span>
          <span className="text-[10px] font-extrabold tracking-[0.2em] uppercase text-transparent bg-clip-text bg-gradient-to-r from-[#7C3AED] to-[#EA580C] mt-0.5">
            SAFEER ACADEMY
          </span>
        </div>
      )}
    </div>
  );
}
