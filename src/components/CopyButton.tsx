import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";

export function CopyButton({ value, label = "نسخ" }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 1800);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // نسخة احتياطية للمتصفحات التي تمنع الحافظة
      const area = document.createElement("textarea");
      area.value = value;
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      try {
        document.execCommand("copy");
      } catch {
        /* لا شيء */
      }
      area.remove();
    }
    setCopied(true);
  };

  return (
    <button
      type="button"
      onClick={copy}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all duration-300 ${
        copied ? "border-brand bg-brand text-cream" : "border-line bg-cream hover:bg-cream-3"
      }`}
    >
      {copied ? <Check className="size-3.5" strokeWidth={3} /> : <Copy className="size-3.5" />}
      {copied ? "تم النسخ" : label}
    </button>
  );
}
