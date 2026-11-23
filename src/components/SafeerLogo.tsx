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
    lg: "size-12",
    xl: "size-16",
  };

  const textSizes = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-xl",
    xl: "text-2xl",
  };

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* Icon Mark: The Ascent S-Ribbon (Concept 1) */}
      <div className={`relative flex items-center justify-center ${iconSizes[size]}`}>
        <svg
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="size-full drop-shadow-[0_4px_12px_rgba(255,107,0,0.25)]"
        >
          <defs>
            {/* Main Linear Gradient: Electric Violet to Neon Sunset Orange */}
            <linearGradient id="safeerAscentGradient" x1="15%" y1="90%" x2="90%" y2="10%">
              <stop offset="0%" stopColor="#7C3AED" />
              <stop offset="35%" stopColor="#9333EA" />
              <stop offset="70%" stopColor="#EA580C" />
              <stop offset="100%" stopColor="#FF6B00" />
            </linearGradient>

            <linearGradient id="safeerGlow" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#FF6B00" stopOpacity="0.9" />
            </linearGradient>

            {/* Depth filter for clean modern look */}
            <filter id="safeerSoftShadow" x="-10%" y="-10%" width="130%" height="130%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#0F0E17" floodOpacity="0.25" />
            </filter>
          </defs>

          {/* S-Ribbon Loop (Seen + S + Ascent Trajectory) */}
          {/* Lower Loop (Violet Foundation) */}
          <path
            d="M 32 68 C 24 68 20 62 20 54 C 20 44 28 38 38 38 C 48 38 52 46 54 54 C 56 64 62 76 74 76 C 84 76 90 68 90 58 C 90 48 82 40 70 40"
            stroke="url(#safeerAscentGradient)"
            strokeWidth="11"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#safeerSoftShadow)"
          />

          {/* Central Connecting Flow Loop */}
          <path
            d="M 38 38 C 50 38 58 48 62 58 C 66 68 74 80 88 78 C 96 76 100 68 98 56 C 96 42 84 32 72 32 C 60 32 50 42 48 56 C 46 70 54 84 68 84 C 78 84 86 78 90 70"
            stroke="url(#safeerAscentGradient)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.4"
          />

          {/* Dynamic Ascent Arrow Head at Upper Right */}
          <path
            d="M 68 40 L 98 22 M 98 22 L 78 20 M 98 22 L 96 42"
            stroke="#FF6B00"
            strokeWidth="10"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Energy Core / Spark Accent */}
          <circle cx="98" cy="22" r="4.5" fill="#FFAA00" />
          <circle cx="32" cy="68" r="3.5" fill="#A855F7" />
        </svg>
      </div>

      {/* Typography: Bilingual Brand Name */}
      {variant === "full" && (
        <div className="flex flex-col text-start">
          <span className={`font-display font-black leading-tight tracking-tight text-ink ${textSizes[size]}`}>
            سفير
          </span>
          <span className="text-[10px] font-bold tracking-[0.22em] uppercase text-brand">
            SAFEER ACADEMY
          </span>
        </div>
      )}
    </div>
  );
}
