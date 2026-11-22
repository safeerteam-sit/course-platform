import { useEffect, useState, type AnchorHTMLAttributes } from "react";

/** راوتر بسيط يعتمد على الـ hash، يعمل على أي استضافة بدون إعدادات إضافية. */

function currentPath(): string {
  const hash = window.location.hash.replace(/^#/, "");
  return hash.startsWith("/") ? hash : "/";
}

export function useRoute(): string {
  const [path, setPath] = useState(currentPath);
  useEffect(() => {
    const onChange = () => setPath(currentPath());
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return path;
}

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { to: string };

export function Link({ to, ...rest }: LinkProps) {
  return <a href={`#${to}`} {...rest} />;
}

/** ينتقل لقسم داخل الصفحة الرئيسية (ويعود لها أولاً إن لزم). */
export function goToSection(id: string): void {
  const scroll = () => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  if (currentPath() !== "/") {
    window.location.hash = "#/";
    window.setTimeout(scroll, 300);
  } else {
    scroll();
  }
}
