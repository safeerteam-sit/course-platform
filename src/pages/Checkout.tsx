import { useEffect, useMemo, useState, type FormEvent } from "react";
import { ArrowRight, CircleCheck, ImagePlus, LoaderCircle, MessageCircle, Smartphone, TriangleAlert, Wallet, X } from "lucide-react";
import { CopyButton } from "../components/CopyButton";
import { CourseCover } from "../components/CourseCover";
import { Badge, btn } from "../components/ui";
import { siteConfig } from "../config";
import { useStore } from "../context/StoreContext";
import { compressImage, validateReceipt } from "../lib/image";
import { submitOrder } from "../lib/orders";
import { Link } from "../lib/router";
import { isDemoMode } from "../lib/supabase";
import type { PaymentMethod } from "../types";

interface MethodInfo {
  id: PaymentMethod;
  label: string;
  hint: string;
  icon: typeof Wallet;
  fields: { label: string; value: string }[];
  holder: string;
  sample: boolean;
}

/** طرق الدفع المضبوطة في config. وفي الوضع التجريبي فقط نعرض بيانات توضيحية إن كانت فارغة. */
function getMethods(): MethodInfo[] {
  const { vodafoneCash, instapay } = siteConfig.payment;
  const list: MethodInfo[] = [];

  const vf = vodafoneCash.number.trim();
  if (vf || isDemoMode) {
    list.push({
      id: "vodafone_cash",
      label: "فودافون كاش",
      hint: "تحويل إلى محفظة",
      icon: Smartphone,
      fields: [{ label: "رقم المحفظة", value: vf || "01XXXXXXXXX" }],
      holder: vodafoneCash.holder,
      sample: !vf,
    });
  }

  const ip = instapay.address.trim();
  if (ip || isDemoMode) {
    const fields = [{ label: "عنوان الدفع (IPA)", value: ip || "name@instapay" }];
    if (instapay.phone.trim()) fields.push({ label: "أو رقم الهاتف", value: instapay.phone.trim() });
    list.push({
      id: "instapay",
      label: "إنستاباي",
      hint: "تحويل لحظي من البنك",
      icon: Wallet,
      fields,
      holder: instapay.holder,
      sample: !ip,
    });
  }
  return list;
}

const inputClass =
  "w-full rounded-2xl border border-line bg-cream px-4 py-3.5 text-[15px] placeholder:text-ink-soft/60 focus:border-brand focus:outline-none";

function StepHeading({ n, title }: { n: number; title: string }) {
  return (
    <h2 className="flex items-center gap-3 font-display text-xl font-extrabold">
      <span className="grid size-9 place-items-center rounded-full bg-brand text-base text-cream">{n}</span>
      {title}
    </h2>
  );
}

export function Checkout() {
  const { cartCourses, clearCart } = useStore();
  const methods = useMemo(getMethods, []);

  const [method, setMethod] = useState<PaymentMethod | null>(methods.length === 1 ? methods[0].id : null);
  const [form, setForm] = useState({ name: "", phone: "", email: "", ref: "" });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<{ code: string; total: number; name: string } | null>(null);

  useEffect(() => {
    document.title = `إتمام الطلب | ${siteConfig.name}`;
  }, []);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const total = cartCourses.reduce((sum, c) => sum + c.price, 0);
  const selected = methods.find((m) => m.id === method) ?? null;

  const pickFile = (picked: File | undefined) => {
    if (!picked) return;
    const problem = validateReceipt(picked);
    if (problem) {
      setError(problem);
      return;
    }
    setError("");
    setFile(picked);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (submitting) return;

    if (!method) return setError("اختر طريقة الدفع أولاً.");
    if (form.name.trim().length < 2) return setError("من فضلك اكتب اسمك الكامل.");
    if (form.phone.replace(/\D/g, "").length < 10) return setError("من فضلك اكتب رقم هاتف صحيحاً (يفضّل رقم واتساب).");
    if (form.email.trim() && !/^\S+@\S+\.\S+$/.test(form.email.trim())) return setError("البريد الإلكتروني غير صحيح.");
    if (!file) return setError("ارفع صورة إيصال التحويل لإتمام الطلب.");

    setError("");
    setSubmitting(true);
    try {
      const receipt = await compressImage(file);
      const { code } = await submitOrder(
        {
          customer_name: form.name,
          phone: form.phone,
          email: form.email,
          method,
          sender_ref: form.ref,
          items: cartCourses.map((c) => ({ id: c.id, title: c.title, price: c.price })),
          total_egp: total,
        },
        receipt,
      );
      setDone({ code, total, name: form.name.trim() });
      clearCart();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "حدث خطأ غير متوقع. حاول مرة أخرى.");
    } finally {
      setSubmitting(false);
    }
  };

  /* ───────────── شاشة النجاح ───────────── */
  if (done) {
    const message = `مرحباً، أرسلت طلباً برمز ${done.code} وقمت برفع إيصال التحويل. برجاء مراجعته.`;
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center md:py-24">
        <div className="mx-auto grid size-20 place-items-center rounded-full bg-brand-tint text-brand">
          <CircleCheck className="size-10" strokeWidth={1.6} />
        </div>
        <h1 className="mt-6 font-display text-3xl font-black md:text-4xl">تم استلام طلبك</h1>
        <p className="mt-3 text-lg leading-8 text-ink-soft">
          شكراً {done.name}. سنراجع الإيصال ونؤكد الدفع يدوياً، ثم نتواصل معك على رقمك.
        </p>

        <div className="mt-8 rounded-3xl border border-line bg-cream-2/70 p-6 shadow-soft">
          <p className="text-sm text-ink-soft">رمز طلبك (احتفظ به)</p>
          <p dir="ltr" className="mt-1 font-display text-3xl font-black tracking-wider text-brand">
            {done.code}
          </p>
          <div className="mt-3 flex justify-center">
            <CopyButton value={done.code} label="نسخ الرمز" />
          </div>
          <div className="mt-5 flex items-center justify-between border-t border-line pt-4 text-sm">
            <span className="text-ink-soft">الحالة</span>
            <Badge tone="gold">قيد المراجعة</Badge>
          </div>
          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="text-ink-soft">المبلغ المحوَّل</span>
            <span className="font-bold">{done.total.toLocaleString("en-US")} ج.م</span>
          </div>
        </div>

        {isDemoMode && (
          <p className="mt-5 rounded-2xl bg-gold-tint px-4 py-3 text-sm leading-7 text-gold-ink">
            هذا الوضع تجريبي: الطلب محفوظ في متصفحك فقط، ولن يصل لأي أحد قبل ربط Supabase.
          </p>
        )}

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a
            href={`https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(message)}`}
            target="_blank"
            rel="noopener noreferrer"
            className={btn("primary", "lg")}
          >
            <MessageCircle className="size-5" /> أرسل الرمز على واتساب
          </a>
          <Link to="/" className={btn("secondary", "lg")}>
            العودة للرئيسية
          </Link>
        </div>
      </div>
    );
  }

  /* ───────────── السلة فارغة ───────────── */
  if (cartCourses.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="font-display text-3xl font-extrabold">سلتك فارغة</h1>
        <p className="mt-3 text-ink-soft">أضف كورساً واحداً على الأقل لإتمام الطلب.</p>
        <Link to="/courses" className={btn("primary", "lg", "mt-8")}>
          تصفّح الكورسات
        </Link>
      </div>
    );
  }

  /* ───────────── لا توجد طريقة دفع مضبوطة ───────────── */
  if (methods.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <TriangleAlert className="mx-auto size-12 text-gold-ink" strokeWidth={1.5} />
        <h1 className="mt-4 font-display text-3xl font-extrabold">طرق الدفع قيد الإعداد</h1>
        <p className="mt-3 leading-8 text-ink-soft">تواصل معنا عبر واتساب وسنزوّدك ببيانات الدفع لإتمام اشتراكك.</p>
        <a href={`https://wa.me/${siteConfig.whatsappNumber}`} target="_blank" rel="noopener noreferrer" className={btn("primary", "lg", "mt-8")}>
          <MessageCircle className="size-5" /> تواصل عبر واتساب
        </a>
      </div>
    );
  }

  /* ───────────── صفحة الدفع ───────────── */
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
      <Link to="/courses" className="inline-flex items-center gap-2 text-sm text-ink-soft hover:text-brand">
        <ArrowRight className="size-4" /> متابعة التصفح
      </Link>
      <h1 className="mt-4 font-display text-3xl font-black md:text-5xl">إتمام الطلب</h1>
      <p className="mt-3 text-lg text-ink-soft">حوّل المبلغ، ثم ارفع صورة الإيصال، وسنؤكد اشتراكك بعد المراجعة.</p>

      {isDemoMode && (
        <div className="mt-6 flex items-start gap-3 rounded-2xl bg-gold-tint px-5 py-4 text-sm leading-7 text-gold-ink">
          <TriangleAlert className="mt-1 size-5 shrink-0" />
          <p>
            <strong>وضع تجريبي:</strong> لم يُربط Supabase بعد، فالطلبات تُحفظ في متصفحك فقط، وأرقام الدفع الظاهرة أمثلة.
          </p>
        </div>
      )}

      <form onSubmit={submit} className="mt-10 grid items-start gap-8 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-8">
          {/* 1) طريقة الدفع وبياناته */}
          <section className="rounded-[2rem] border border-line bg-cream-2/60 p-6 md:p-8">
            <StepHeading n={1} title="حوّل المبلغ" />

            <div className="mt-6 grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="طريقة الدفع">
              {methods.map((m) => {
                const Icon = m.icon;
                const active = m.id === method;
                return (
                  <button
                    key={m.id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setMethod(m.id)}
                    className={`flex items-center gap-4 rounded-3xl border p-4 text-start transition-all duration-300 ${
                      active ? "border-brand bg-brand-tint shadow-soft" : "border-line bg-cream hover:border-brand/40"
                    }`}
                  >
                    <span className={`grid size-12 place-items-center rounded-2xl ${active ? "bg-brand text-cream" : "bg-cream-3 text-ink"}`}>
                      <Icon className="size-6" strokeWidth={1.7} />
                    </span>
                    <span className="leading-tight">
                      <span className="block font-display text-lg font-bold">{m.label}</span>
                      <span className="text-xs text-ink-soft">{m.hint}</span>
                    </span>
                  </button>
                );
              })}
            </div>

            {selected && (
              <div className="mt-6 animate-pop rounded-3xl border border-brand/20 bg-cream p-5 md:p-6">
                <p className="text-sm text-ink-soft">المبلغ المطلوب تحويله بالضبط</p>
                <p className="mt-1 font-display text-4xl font-black text-brand">{total.toLocaleString("en-US")} ج.م</p>

                <div className="mt-5 space-y-3">
                  {selected.fields.map((field) => (
                    <div key={field.label} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-cream-2 px-4 py-3">
                      <div>
                        <p className="text-xs text-ink-soft">{field.label}</p>
                        <p dir="ltr" className="text-start font-display text-xl font-extrabold tracking-wide">
                          {field.value}
                        </p>
                      </div>
                      <CopyButton value={field.value} />
                    </div>
                  ))}
                  {selected.holder && (
                    <p className="text-sm text-ink-soft">
                      باسم: <strong className="text-ink">{selected.holder}</strong>
                    </p>
                  )}
                </div>

                <ul className="mt-5 space-y-2 border-t border-line pt-4 text-sm leading-7 text-ink-soft">
                  {siteConfig.payment.notes.map((note) => (
                    <li key={note} className="flex gap-2">
                      <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-gold" /> {note}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          {/* 2) بيانات العميل والإيصال */}
          <section className="rounded-[2rem] border border-line bg-cream-2/60 p-6 md:p-8">
            <StepHeading n={2} title="بياناتك وإيصال التحويل" />

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium">الاسم الكامل</span>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  autoComplete="name"
                  className={inputClass}
                  placeholder="كما تحب أن يظهر في الاشتراك"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium">رقم الهاتف (واتساب)</span>
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  dir="ltr"
                  className={`${inputClass} text-start`}
                  placeholder="01XXXXXXXXX"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium">البريد الإلكتروني (اختياري)</span>
                <input
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  type="email"
                  autoComplete="email"
                  dir="ltr"
                  className={`${inputClass} text-start`}
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium">رقمك الذي حوّلت منه (اختياري)</span>
                <input
                  value={form.ref}
                  onChange={(e) => setForm({ ...form, ref: e.target.value })}
                  dir="ltr"
                  className={`${inputClass} text-start`}
                  placeholder="يساعدنا في مطابقة التحويل"
                />
              </label>
            </div>

            <div className="mt-6">
              <span className="mb-1.5 block text-sm font-medium">صورة إيصال التحويل</span>

              {file && preview ? (
                <div className="flex items-center gap-4 rounded-3xl border border-brand/30 bg-cream p-3">
                  <img src={preview} alt="معاينة الإيصال" className="size-24 shrink-0 rounded-2xl object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{file.name}</p>
                    <p className="text-xs text-ink-soft">{(file.size / 1024).toFixed(0)} كيلوبايت</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    aria-label="إزالة الصورة"
                    className="grid size-10 shrink-0 place-items-center rounded-full bg-cream-2 hover:bg-cream-3"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ) : (
                <>
                  <input
                    id="receipt"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => {
                      pickFile(e.target.files?.[0]);
                      e.target.value = "";
                    }}
                    className="peer sr-only"
                  />
                  <label
                    htmlFor="receipt"
                    className="flex cursor-pointer flex-col items-center gap-3 rounded-3xl border-2 border-dashed border-line bg-cream px-6 py-10 text-center transition-colors hover:border-brand/50 hover:bg-brand-tint/40 peer-focus-visible:border-brand"
                  >
                    <span className="grid size-14 place-items-center rounded-2xl bg-brand-tint text-brand">
                      <ImagePlus className="size-7" strokeWidth={1.6} />
                    </span>
                    <span className="font-semibold">اضغط لرفع صورة الإيصال</span>
                    <span className="text-xs text-ink-soft">JPG أو PNG أو WebP، بحد أقصى 10 ميجابايت</span>
                  </label>
                </>
              )}
            </div>

            {error && (
              <p role="alert" className="mt-5 flex items-start gap-2 rounded-2xl bg-[#f6e0da] px-4 py-3 text-sm leading-7 text-[#8a3523]">
                <TriangleAlert className="mt-1 size-4 shrink-0" /> {error}
              </p>
            )}

            <button type="submit" disabled={submitting} className={btn("primary", "lg", "mt-6 w-full")}>
              {submitting ? (
                <>
                  <LoaderCircle className="size-5 animate-spin" /> جاري إرسال الطلب…
                </>
              ) : (
                "إرسال الطلب"
              )}
            </button>
            <p className="mt-3 text-center text-xs text-ink-soft">بالضغط على إرسال تؤكد أنك حوّلت المبلغ المذكور وأن الإيصال صحيح.</p>
          </section>
        </div>

        {/* ملخص الطلب */}
        <aside className="rounded-[2rem] border border-line bg-cream-2/70 p-6 shadow-soft lg:sticky lg:top-28">
          <h2 className="font-display text-xl font-extrabold">ملخص الطلب</h2>
          <ul className="mt-5 space-y-3">
            {cartCourses.map((course) => (
              <li key={course.id} className="flex items-center gap-3">
                <CourseCover course={course} compact className="size-14 shrink-0 rounded-2xl" />
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-sm leading-6 font-semibold">{course.title}</p>
                  <p className="text-sm font-bold text-brand">{course.price.toLocaleString("en-US")} ج.م</p>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
            <span className="text-ink-soft">الإجمالي</span>
            <span className="font-display text-2xl font-black text-brand">{total.toLocaleString("en-US")} ج.م</span>
          </div>
          <p className="mt-3 text-xs leading-6 text-ink-soft">الدفع يتم بالجنيه المصري عبر فودافون كاش أو إنستاباي فقط.</p>
        </aside>
      </form>
    </div>
  );
}
