import { MessageCircle, Sparkles } from "lucide-react";
import { siteConfig } from "../config";
import { Link, goToSection } from "../lib/router";

export function Footer() {
  const socials = [
    { label: "فيسبوك", href: siteConfig.social.facebook },
    { label: "إنستجرام", href: siteConfig.social.instagram },
    { label: "تيك توك", href: siteConfig.social.tiktok },
    { label: "يوتيوب", href: siteConfig.social.youtube },
  ].filter((s) => s.href);

  return (
    <footer className="mt-24 border-t border-line bg-cream-2/60">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-[1.4fr_1fr_1fr] md:px-8">
        <div>
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-2xl bg-brand text-cream">
              <Sparkles className="size-5" />
            </span>
            <span className="font-display text-lg font-extrabold">{siteConfig.name}</span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-7 text-ink-soft">{siteConfig.tagline}</p>
        </div>

        <div>
          <h4 className="font-display font-bold">روابط سريعة</h4>
          <ul className="mt-4 space-y-3 text-sm text-ink-soft">
            <li>
              <Link to="/" className="hover:text-brand">
                الرئيسية
              </Link>
            </li>
            <li>
              <Link to="/courses" className="hover:text-brand">
                كل الكورسات
              </Link>
            </li>
            <li>
              <Link to="/instructor" className="hover:text-brand">
                عن المحاضر
              </Link>
            </li>
            <li>
              <button type="button" onClick={() => goToSection("faq")} className="hover:text-brand">
                الأسئلة الشائعة
              </button>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-display font-bold">تواصل معنا</h4>
          <a
            href={`https://wa.me/${siteConfig.whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-brand-dark"
          >
            <MessageCircle className="size-4" /> راسلنا على واتساب
          </a>
          {socials.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-line px-4 py-1.5 text-sm text-ink-soft transition-colors hover:bg-cream-3"
                >
                  {s.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-line py-5 text-center text-xs text-ink-soft">
        © {new Date().getFullYear()} {siteConfig.name}. جميع الحقوق محفوظة.
        <Link to="/admin" className="ms-3 opacity-60 hover:opacity-100">
          دخول الإدارة
        </Link>
      </div>
    </footer>
  );
}
