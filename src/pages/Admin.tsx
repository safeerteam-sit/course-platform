import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import {
  CircleCheck,
  CircleX,
  Clock,
  ExternalLink,
  LoaderCircle,
  LogOut,
  MessageCircle,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  TriangleAlert,
  X,
} from "lucide-react";
import { Badge, btn } from "../components/ui";
import { siteConfig } from "../config";
import { useEscape, useLockBodyScroll } from "../hooks/overlay";
import {
  adminSignIn,
  adminSignOut,
  deleteDemoOrders,
  getAdminState,
  getReceiptUrl,
  listOrders,
  setOrderStatus,
  toWhatsappNumber,
  type AdminState,
} from "../lib/orders";
import { Link } from "../lib/router";
import type { Order, OrderStatus } from "../types";

const inputClass =
  "w-full rounded-2xl border border-line bg-cream px-4 py-3 text-[15px] placeholder:text-ink-soft/60 focus:border-brand focus:outline-none";

const statusMeta: Record<OrderStatus, { label: string; chip: string }> = {
  pending: { label: "قيد المراجعة", chip: "bg-gold-tint text-gold-ink" },
  confirmed: { label: "مؤكَّد", chip: "bg-brand-tint text-brand" },
  rejected: { label: "مرفوض", chip: "bg-[#f6e0da] text-[#8a3523]" },
};

const methodLabel = { vodafone_cash: "فودافون كاش", instapay: "إنستاباي" } as const;

function StatusChip({ status }: { status: OrderStatus }) {
  return <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusMeta[status].chip}`}>{statusMeta[status].label}</span>;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("ar-EG", { dateStyle: "medium", timeStyle: "short" });
}

function money(n: number): string {
  return `${n.toLocaleString("en-US")} ج.م`;
}

/* ═════════════════════════ الصفحة ═════════════════════════ */

export function Admin() {
  const [state, setState] = useState<AdminState | null>(null);

  const refreshState = useCallback(async () => {
    setState(await getAdminState());
  }, []);

  useEffect(() => {
    document.title = `لوحة التحكم | ${siteConfig.name}`;
    void refreshState();
  }, [refreshState]);

  if (!state) {
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <LoaderCircle className="size-8 animate-spin text-brand" />
      </div>
    );
  }

  if (state.kind === "signed-out") return <Login onDone={refreshState} />;

  if (state.kind === "not-admin") {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <TriangleAlert className="mx-auto size-12 text-gold-ink" strokeWidth={1.5} />
        <h1 className="mt-4 font-display text-2xl font-extrabold">ليس لديك صلاحية الأدمن</h1>
        <p className="mt-3 leading-8 text-ink-soft">
          الحساب <span dir="ltr">{state.email}</span> غير مضاف إلى جدول الأدمن في Supabase.
        </p>
        <button
          type="button"
          onClick={async () => {
            await adminSignOut();
            await refreshState();
          }}
          className={btn("secondary", "md", "mt-6")}
        >
          تسجيل الخروج
        </button>
      </div>
    );
  }

  return (
    <Dashboard
      demo={state.kind === "demo"}
      email={state.kind === "admin" ? state.email : ""}
      onSignOut={async () => {
        await adminSignOut();
        await refreshState();
      }}
    />
  );
}

/* ═════════════════════════ تسجيل الدخول ═════════════════════════ */

function Login({ onDone }: { onDone: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await adminSignIn(email, password);
      onDone();
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذّر تسجيل الدخول.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16 md:py-24">
      <form onSubmit={submit} className="rounded-[2rem] border border-line bg-cream-2/70 p-8 shadow-soft">
        <span className="grid size-14 place-items-center rounded-2xl bg-brand text-cream">
          <ShieldCheck className="size-7" />
        </span>
        <h1 className="mt-5 font-display text-2xl font-black">لوحة التحكم</h1>
        <p className="mt-2 text-sm text-ink-soft">دخول مخصص لإدارة الموقع فقط.</p>

        <div className="mt-6 space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="البريد الإلكتروني"
            autoComplete="username"
            dir="ltr"
            required
            className={`${inputClass} text-start`}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="كلمة المرور"
            autoComplete="current-password"
            dir="ltr"
            required
            className={`${inputClass} text-start`}
          />
        </div>

        {error && (
          <p role="alert" className="mt-4 rounded-2xl bg-[#f6e0da] px-4 py-3 text-sm text-[#8a3523]">
            {error}
          </p>
        )}

        <button type="submit" disabled={busy} className={btn("primary", "lg", "mt-5 w-full")}>
          {busy ? <LoaderCircle className="size-5 animate-spin" /> : "دخول"}
        </button>
      </form>
    </div>
  );
}

/* ═════════════════════════ اللوحة ═════════════════════════ */

type Filter = OrderStatus | "all";

function Dashboard({ demo, email, onSignOut }: { demo: boolean; email: string; onSignOut: () => void }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<Filter>("pending");
  const [query, setQuery] = useState("");
  const [reviewing, setReviewing] = useState<Order | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setOrders(await listOrders());
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذّر تحميل الطلبات.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const stats = useMemo(() => {
    const sum = (s: OrderStatus) => orders.filter((o) => o.status === s).reduce((t, o) => t + o.total_egp, 0);
    const count = (s: OrderStatus) => orders.filter((o) => o.status === s).length;
    return {
      pending: { n: count("pending"), sum: sum("pending") },
      confirmed: { n: count("confirmed"), sum: sum("confirmed") },
      rejected: { n: count("rejected"), sum: sum("rejected") },
    };
  }, [orders]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((o) => {
      if (filter !== "all" && o.status !== filter) return false;
      if (!q) return true;
      return `${o.code} ${o.customer_name} ${o.phone} ${o.email ?? ""}`.toLowerCase().includes(q);
    });
  }, [orders, filter, query]);

  const tabs: { id: Filter; label: string; n: number }[] = [
    { id: "pending", label: "قيد المراجعة", n: stats.pending.n },
    { id: "confirmed", label: "مؤكَّدة", n: stats.confirmed.n },
    { id: "rejected", label: "مرفوضة", n: stats.rejected.n },
    { id: "all", label: "الكل", n: orders.length },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-8 md:py-14">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-black md:text-4xl">لوحة التحكم</h1>
          <p className="mt-2 text-ink-soft">مراجعة الإيصالات وتأكيد الدفع يدوياً.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {email && (
            <span dir="ltr" className="rounded-full bg-cream-2 px-4 py-2 text-sm text-ink-soft">
              {email}
            </span>
          )}
          <button type="button" onClick={load} className={btn("secondary", "sm")}>
            <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} /> تحديث
          </button>
          {!demo && (
            <button type="button" onClick={onSignOut} className={btn("secondary", "sm")}>
              <LogOut className="size-4" /> خروج
            </button>
          )}
        </div>
      </div>

      {demo && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-gold-tint px-5 py-4 text-sm leading-7 text-gold-ink">
          <p className="flex items-start gap-3">
            <TriangleAlert className="mt-1 size-5 shrink-0" />
            <span>
              <strong>وضع تجريبي:</strong> هذه الطلبات محفوظة في هذا المتصفح فقط وبدون تسجيل دخول. اربط Supabase لتفعيل الحماية والحفظ الحقيقي.
            </span>
          </p>
          {orders.length > 0 && (
            <button
              type="button"
              onClick={async () => {
                await deleteDemoOrders();
                await load();
              }}
              className={btn("secondary", "sm")}
            >
              <Trash2 className="size-4" /> حذف الطلبات التجريبية
            </button>
          )}
        </div>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <StatCard icon={Clock} tone="gold" label="بانتظار المراجعة" n={stats.pending.n} sum={stats.pending.sum} />
        <StatCard icon={CircleCheck} tone="brand" label="مدفوعات مؤكَّدة" n={stats.confirmed.n} sum={stats.confirmed.sum} />
        <StatCard icon={CircleX} tone="red" label="مرفوضة" n={stats.rejected.n} sum={stats.rejected.sum} />
      </div>

      <div className="mt-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="no-scrollbar flex gap-2 overflow-x-auto" role="tablist">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={filter === tab.id}
              onClick={() => setFilter(tab.id)}
              className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-all ${
                filter === tab.id ? "border-brand bg-brand text-cream shadow-soft" : "border-line bg-cream-2 text-ink-soft"
              }`}
            >
              {tab.label}
              <span className={`rounded-full px-2 text-xs ${filter === tab.id ? "bg-cream/20" : "bg-cream-3"}`}>{tab.n}</span>
            </button>
          ))}
        </div>
        <label className="relative md:w-72">
          <span className="sr-only">بحث</span>
          <Search className="pointer-events-none absolute top-1/2 start-4 size-4 -translate-y-1/2 text-ink-soft" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="بحث بالرمز أو الاسم أو الهاتف"
            className="w-full rounded-full border border-line bg-cream-2 py-2.5 ps-11 pe-4 text-sm focus:border-brand focus:outline-none"
          />
        </label>
      </div>

      {error && (
        <p role="alert" className="mt-6 rounded-2xl bg-[#f6e0da] px-4 py-3 text-sm text-[#8a3523]">
          {error}
        </p>
      )}

      <div className="mt-6 space-y-3">
        {!loading && visible.length === 0 && !error && (
          <div className="rounded-3xl border border-dashed border-line bg-cream-2/50 px-6 py-16 text-center text-ink-soft">
            لا توجد طلبات في هذا القسم.
          </div>
        )}

        {visible.map((order) => (
          <article
            key={order.id}
            className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-line bg-cream-2/60 p-5 shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift"
          >
            <div className="min-w-0 flex-1 basis-64">
              <div className="flex flex-wrap items-center gap-3">
                <span dir="ltr" className="font-display text-lg font-extrabold text-brand">
                  {order.code}
                </span>
                <StatusChip status={order.status} />
              </div>
              <p className="mt-2 font-semibold">{order.customer_name}</p>
              <p className="text-sm text-ink-soft">
                <span dir="ltr">{order.phone}</span> · {methodLabel[order.method]} · {formatDate(order.created_at)}
              </p>
              <p className="mt-1 line-clamp-1 text-sm text-ink-soft">{order.items.map((i) => i.title).join(" + ")}</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-display text-xl font-black">{money(order.total_egp)}</span>
              <button type="button" onClick={() => setReviewing(order)} className={btn(order.status === "pending" ? "primary" : "secondary", "sm")}>
                {order.status === "pending" ? "مراجعة الإيصال" : "عرض"}
              </button>
            </div>
          </article>
        ))}
      </div>

      <p className="mt-10 text-center text-sm text-ink-soft">
        <Link to="/" className="hover:text-brand">
          العودة إلى الموقع
        </Link>
      </p>

      {reviewing && <ReviewModal order={reviewing} onClose={() => setReviewing(null)} onChanged={load} />}
    </div>
  );
}

function StatCard({
  icon: Icon,
  tone,
  label,
  n,
  sum,
}: {
  icon: typeof Clock;
  tone: "gold" | "brand" | "red";
  label: string;
  n: number;
  sum: number;
}) {
  const tones = { gold: "bg-gold-tint text-gold-ink", brand: "bg-brand-tint text-brand", red: "bg-[#f6e0da] text-[#8a3523]" };
  return (
    <div className="flex items-center gap-4 rounded-3xl border border-line bg-cream-2/60 p-5">
      <span className={`grid size-12 place-items-center rounded-2xl ${tones[tone]}`}>
        <Icon className="size-6" strokeWidth={1.7} />
      </span>
      <div>
        <p className="text-sm text-ink-soft">{label}</p>
        <p className="font-display text-2xl font-black">
          {n} <span className="text-sm font-medium text-ink-soft">طلب · {money(sum)}</span>
        </p>
      </div>
    </div>
  );
}

/* ═════════════════════════ نافذة المراجعة ═════════════════════════ */

function ReviewModal({ order, onClose, onChanged }: { order: Order; onClose: () => void; onChanged: () => Promise<void> }) {
  const [current, setCurrent] = useState(order);
  const [note, setNote] = useState(order.admin_note ?? "");
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [receiptError, setReceiptError] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useLockBodyScroll(true);
  useEscape(true, onClose);

  useEffect(() => {
    let alive = true;
    getReceiptUrl(order)
      .then((url) => alive && setReceiptUrl(url))
      .catch((e: unknown) => alive && setReceiptError(e instanceof Error ? e.message : "تعذّر تحميل الإيصال."));
    return () => {
      alive = false;
    };
  }, [order]);

  const act = async (status: OrderStatus) => {
    if (status === "rejected" && !note.trim()) {
      setError("اكتب سبب الرفض ليصل للعميل.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await setOrderStatus(current.id, status, status === "pending" ? "" : note);
      setCurrent({
        ...current,
        status,
        admin_note: status === "pending" ? null : note.trim() || null,
        reviewed_at: status === "pending" ? null : new Date().toISOString(),
      });
      if (status === "pending") setNote("");
      await onChanged();
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذّر تحديث الطلب.");
    } finally {
      setBusy(false);
    }
  };

  const waText =
    current.status === "confirmed"
      ? `مرحباً ${current.customer_name}، تم تأكيد دفعك للطلب ${current.code} ✅ مرحباً بك معنا!`
      : current.status === "rejected"
        ? `مرحباً ${current.customer_name}، تعذّر تأكيد دفعك للطلب ${current.code}. السبب: ${current.admin_note ?? ""}. برجاء التواصل معنا.`
        : `مرحباً ${current.customer_name}، بخصوص طلبك ${current.code}.`;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4" role="dialog" aria-modal="true" aria-label={`مراجعة الطلب ${current.code}`}>
      <div onClick={onClose} className="absolute inset-0 animate-fade bg-ink/50 backdrop-blur-sm" />

      <div className="relative grid max-h-[92vh] w-full max-w-5xl animate-pop overflow-y-auto rounded-[2rem] border border-line bg-cream shadow-lift md:grid-cols-[1.1fr_1fr] md:overflow-hidden">
        <button
          type="button"
          onClick={onClose}
          aria-label="إغلاق"
          className="absolute top-4 end-4 z-10 grid size-10 place-items-center rounded-full bg-cream/90 shadow-soft hover:bg-cream"
        >
          <X className="size-5" />
        </button>

        {/* الإيصال */}
        <div className="flex min-h-72 items-center justify-center bg-cream-3 p-4 md:max-h-[92vh] md:overflow-auto">
          {receiptUrl ? (
            <div className="w-full text-center">
              <img src={receiptUrl} alt={`إيصال الطلب ${current.code}`} className="mx-auto max-h-[70vh] w-auto rounded-2xl object-contain shadow-soft" />
              <a href={receiptUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-sm text-brand hover:underline">
                <ExternalLink className="size-4" /> فتح الصورة في تبويب جديد
              </a>
            </div>
          ) : receiptError ? (
            <p className="text-sm text-[#8a3523]">{receiptError}</p>
          ) : (
            <LoaderCircle className="size-8 animate-spin text-brand" />
          )}
        </div>

        {/* التفاصيل والقرار */}
        <div className="space-y-5 p-6 md:max-h-[92vh] md:overflow-y-auto md:p-8">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span dir="ltr" className="font-display text-2xl font-black text-brand">
                {current.code}
              </span>
              <StatusChip status={current.status} />
            </div>
            <p className="mt-1 text-sm text-ink-soft">{formatDate(current.created_at)}</p>
          </div>

          <div className="rounded-3xl bg-brand-tint p-4">
            <p className="text-sm text-ink-soft">المبلغ الذي يجب أن يظهر في الإيصال</p>
            <p className="font-display text-3xl font-black text-brand">{money(current.total_egp)}</p>
            <p className="mt-1 text-sm">عبر {methodLabel[current.method]}</p>
          </div>

          <dl className="space-y-2 text-sm">
            <Row label="الاسم" value={current.customer_name} />
            <Row label="الهاتف" value={current.phone} ltr />
            {current.email && <Row label="البريد" value={current.email} ltr />}
            {current.sender_ref && <Row label="حوّل من / مرجع" value={current.sender_ref} ltr />}
          </dl>

          <div>
            <p className="mb-2 text-sm font-semibold">الكورسات</p>
            <ul className="space-y-1.5 text-sm">
              {current.items.map((item) => (
                <li key={item.id} className="flex justify-between gap-3 rounded-xl bg-cream-2 px-3 py-2">
                  <span>{item.title}</span>
                  <span className="shrink-0 font-semibold">{money(item.price)}</span>
                </li>
              ))}
            </ul>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold">ملاحظة (سبب الرفض يظهر في رسالة العميل)</span>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              maxLength={500}
              className={inputClass}
              placeholder="مثال: المبلغ في الإيصال أقل من المطلوب"
            />
          </label>

          {error && (
            <p role="alert" className="rounded-2xl bg-[#f6e0da] px-4 py-3 text-sm text-[#8a3523]">
              {error}
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            {current.status === "pending" ? (
              <>
                <button type="button" disabled={busy} onClick={() => act("confirmed")} className={btn("primary", "md")}>
                  <CircleCheck className="size-5" /> تأكيد الدفع
                </button>
                <button type="button" disabled={busy} onClick={() => act("rejected")} className={btn("secondary", "md", "text-[#8a3523]!")}>
                  <CircleX className="size-5" /> رفض
                </button>
              </>
            ) : (
              <button type="button" disabled={busy} onClick={() => act("pending")} className={btn("secondary", "md")}>
                إعادة للمراجعة
              </button>
            )}
            <a
              href={`https://wa.me/${toWhatsappNumber(current.phone)}?text=${encodeURIComponent(waText)}`}
              target="_blank"
              rel="noopener noreferrer"
              className={btn("outline", "md")}
            >
              <MessageCircle className="size-5" /> راسل العميل
            </a>
          </div>

          {current.status !== "pending" && current.reviewed_at && (
            <p className="text-xs text-ink-soft">
              <Badge tone="neutral">آخر قرار</Badge> {formatDate(current.reviewed_at)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, ltr = false }: { label: string; value: string; ltr?: boolean }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-ink-soft">{label}</dt>
      <dd dir={ltr ? "ltr" : undefined} className="font-medium">
        {value}
      </dd>
    </div>
  );
}
