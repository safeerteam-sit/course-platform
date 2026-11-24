import { useState, type FormEvent } from "react";
import { AlertCircle, ArrowLeft, Lock, Mail, ShieldCheck, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { SafeerLogo } from "./SafeerLogo";

export function AuthModal() {
  const { authModalOpen, closeAuthModal, signInWithGoogle, signInWithFacebook, signInWithPassword } = useAuth();
  const [loadingProvider, setLoadingProvider] = useState<"google" | "facebook" | "password" | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showEmailForm, setShowEmailForm] = useState(false);

  if (!authModalOpen) return null;

  const handleGoogle = async () => {
    try {
      setLoadingProvider("google");
      setErrorMsg(null);
      const { error } = await signInWithGoogle();
      if (error) {
        setErrorMsg(error.message || "حدث خطأ أثناء الاتصال بجوجل.");
      }
    } catch {
      setErrorMsg("تعذر فتح تسجيل الدخول عبر Google.");
    } finally {
      setLoadingProvider(null);
    }
  };

  const handleFacebook = async () => {
    try {
      setLoadingProvider("facebook");
      setErrorMsg(null);
      const { error } = await signInWithFacebook();
      if (error) {
        setErrorMsg("تسجيل الدخول عبر فيسبوك سيكون متاحاً قريباً بعد ربط التطبيق.");
      }
    } catch {
      setErrorMsg("ميزة الدخول عبر فيسبوك قيد التفعيل.");
    } finally {
      setLoadingProvider(null);
    }
  };

  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("يرجى إدخال البريد الإلكتروني وكلمة المرور.");
      return;
    }
    try {
      setLoadingProvider("password");
      setErrorMsg(null);
      const { error } = await signInWithPassword(email, password);
      if (error) {
        setErrorMsg("بيانات الدخول غير صحيحة. يرجى التأكد من البريد وكلمة المرور.");
      } else {
        closeAuthModal();
        // If it's the admin, redirect directly to admin page
        if (email.toLowerCase().includes("safeer.team")) {
          window.location.hash = "#/admin";
        }
      }
    } catch {
      setErrorMsg("تعذر تسجيل الدخول. يرجى المحاولة مرة أخرى.");
    } finally {
      setLoadingProvider(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#0F0E17]/65 backdrop-blur-md transition-opacity duration-300"
        onClick={closeAuthModal}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl border border-white/60 bg-cream p-7 shadow-[0_25px_60px_-15px_rgba(124,58,237,0.35),0_15px_30px_-10px_rgba(234,88,12,0.3)] animate-in fade-in zoom-in-95 duration-200">
        {/* Glow ambient background */}
        <div className="pointer-events-none absolute -top-20 -end-20 size-48 rounded-full bg-gradient-to-br from-[#7C3AED]/25 to-[#EA580C]/20 blur-2xl" />

        {/* Close Button */}
        <button
          type="button"
          onClick={closeAuthModal}
          className="absolute top-5 end-5 grid size-9 place-items-center rounded-full bg-cream-2 text-ink-soft hover:bg-cream-3 hover:text-ink transition-colors cursor-pointer"
        >
          <X className="size-5" />
        </button>

        {/* Header */}
        <div className="text-center pt-2">
          <div className="inline-block">
            <SafeerLogo size="lg" variant="mark" />
          </div>
          <h2 className="mt-4 font-display text-2xl font-black text-ink">
            تسجيل الدخول إلى <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7C3AED] to-[#EA580C]">شركة سفير</span>
          </h2>
          <p className="mt-2 text-sm text-ink-soft">
            سجّل دخولك لمتابعة تدريبك أو الوصول للوحة التحكم
          </p>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="mt-5 flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            <AlertCircle className="size-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* OAuth Buttons */}
        <div className="mt-6 space-y-3">
          {/* Google Button */}
          <button
            type="button"
            onClick={handleGoogle}
            disabled={loadingProvider !== null}
            className="group relative flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-line bg-white px-5 py-3.5 text-sm font-bold text-ink shadow-sm transition-all duration-300 hover:border-purple-400 hover:shadow-[0_8px_25px_-5px_rgba(124,58,237,0.25)] hover:-translate-y-0.5 active:scale-[0.99] cursor-pointer disabled:opacity-60"
          >
            <svg className="size-5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>
              {loadingProvider === "google" ? "جاري الاتصال بجوجل..." : "المتابعة باستخدام Google"}
            </span>
          </button>

          {/* Facebook Button */}
          <button
            type="button"
            onClick={handleFacebook}
            disabled={loadingProvider !== null}
            className="group relative flex w-full items-center justify-center gap-3 rounded-2xl border border-blue-200/60 bg-[#1877F2]/5 px-5 py-3 text-sm font-bold text-[#1877F2] shadow-sm transition-all duration-300 hover:bg-[#1877F2]/10 hover:border-[#1877F2] cursor-pointer disabled:opacity-60"
          >
            <svg className="size-4 shrink-0 fill-[#1877F2]" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            <span>
              {loadingProvider === "facebook" ? "جاري الاتصال..." : "المتابعة باستخدام Facebook"}
            </span>
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-extrabold text-[#1877F2]">
              قريباً
            </span>
          </button>
        </div>

        {/* Divider */}
        <div className="relative my-5 flex items-center justify-center">
          <div className="w-full border-t border-line" />
          <button
            type="button"
            onClick={() => setShowEmailForm((v) => !v)}
            className="absolute bg-cream px-3 text-xs font-bold text-ink-soft hover:text-brand transition-colors cursor-pointer"
          >
            {showEmailForm ? "إخفاء الدخول بالبريد" : "أو الدخول بالبريد وكلمة المرور ▼"}
          </button>
        </div>

        {/* Email & Password Form */}
        {showEmailForm && (
          <form onSubmit={handlePasswordSubmit} className="space-y-3 animate-in fade-in duration-200">
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="البريد الإلكتروني (مثال: safeer.team@gmail.com)"
                dir="ltr"
                required
                className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-start placeholder:text-ink-soft/60 focus:border-[#7C3AED] focus:outline-none"
              />
              <Mail className="pointer-events-none absolute end-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-soft" />
            </div>

            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="كلمة المرور"
                dir="ltr"
                required
                className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-start placeholder:text-ink-soft/60 focus:border-[#7C3AED] focus:outline-none"
              />
              <Lock className="pointer-events-none absolute end-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-soft" />
            </div>

            <button
              type="submit"
              disabled={loadingProvider !== null}
              className="w-full rounded-2xl bg-gradient-to-r from-[#7C3AED] to-[#EA580C] px-5 py-3 text-sm font-bold text-white shadow-md hover:opacity-95 transition-all cursor-pointer disabled:opacity-60"
            >
              {loadingProvider === "password" ? "جاري التحقق والدخول..." : "تسجيل الدخول"}
            </button>
          </form>
        )}

        {/* Direct Admin Link */}
        <div className="mt-5 text-center border-t border-line/60 pt-4">
          <a
            href="#/admin"
            onClick={closeAuthModal}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#EA580C] hover:underline cursor-pointer"
          >
            <span>دخول لوحة تحكم الإدارة (Admin Panel)</span>
            <ArrowLeft className="size-3.5" />
          </a>
        </div>

        {/* Security badge */}
        <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-ink-soft">
          <ShieldCheck className="size-3.5 text-brand" />
          <span>بياناتك مشفرة ومحمية بالكامل</span>
        </div>
      </div>
    </div>
  );
}
