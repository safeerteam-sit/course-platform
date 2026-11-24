import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import {
  CircleCheck,
  CircleX,
  Clock,
  CreditCard,
  ExternalLink,
  GraduationCap,
  HelpCircle,
  LayoutDashboard,
  LoaderCircle,
  LogOut,
  MessageCircle,
  MessageSquareQuote,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  Trash2,
  TriangleAlert,
  UserCheck,
  X,
} from "lucide-react";
import { Badge, btn } from "../components/ui";
import { siteConfig } from "../config";
import { useEscape, useLockBodyScroll } from "../hooks/overlay";
import {
  fetchCourses,
  fetchFaqs,
  fetchSiteConfig,
  fetchTestimonials,
  saveCoursesToDB,
  saveFaqsToDB,
  saveSiteConfigToDB,
  saveTestimonialsToDB,
  type FAQItem,
  type SiteConfigType,
} from "../lib/content";
import {
  adminSignIn,
  adminSignOut,
  getAdminState,
  getReceiptUrl,
  listOrders,
  setOrderStatus,
  toWhatsappNumber,
  type AdminState,
} from "../lib/orders";
import { Link } from "../lib/router";
import type { CategoryId, Course, CoverIcon, Order, OrderStatus, Testimonial, Unit } from "../types";

const inputClass =
  "w-full rounded-2xl border border-line bg-cream px-4 py-3 text-[15px] placeholder:text-ink-soft/60 focus:border-brand focus:outline-none transition-colors";

const labelClass = "block text-xs font-bold text-ink-soft mb-1.5";

const statusMeta: Record<OrderStatus, { label: string; chip: string }> = {
  pending: { label: "قيد المراجعة", chip: "bg-gold-tint text-gold-ink" },
  confirmed: { label: "مؤكَّد", chip: "bg-brand-tint text-brand" },
  rejected: { label: "مرفوض", chip: "bg-[#f6e0da] text-[#8a3523]" },
};

const methodLabel = { vodafone_cash: "فودافون كاش", instapay: "إنستاباي" } as const;

function StatusChip({ status }: { status: OrderStatus }) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusMeta[status].chip}`}>
      {statusMeta[status].label}
    </span>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("ar-EG", { dateStyle: "medium", timeStyle: "short" });
}

function money(n: number): string {
  return `${n.toLocaleString("en-US")} ج.م`;
}

type AdminTab = "orders" | "courses" | "site" | "payment" | "instructor" | "testimonials" | "faqs";

/* ═════════════════════════ الصفحة الرئيسية ═════════════════════════ */

export function Admin() {
  const [state, setState] = useState<AdminState | null>(null);

  const refreshState = useCallback(async () => {
    setState(await getAdminState());
  }, []);

  useEffect(() => {
    document.title = `لوحة التحكم الإدارية | شركة سفير`;
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
        <h1 className="mt-5 font-display text-2xl font-black">لوحة تحكم شركة سفير</h1>
        <p className="mt-2 text-sm text-ink-soft">دخول مخصص لإدارة محتوى المنصة والطلبات.</p>

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

/* ═════════════════════════ لوحة التحكم الكاملة ═════════════════════════ */

function Dashboard({ demo, email, onSignOut }: { demo: boolean; email: string; onSignOut: () => void }) {
  const [activeTab, setActiveTab] = useState<AdminTab>("orders");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // الطلبات
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState("");

  // الكورسات
  const [courses, setCourses] = useState<Course[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);

  // إعدادات الموقع
  const [config, setConfig] = useState<SiteConfigType>(siteConfig);
  const [configLoading, setConfigLoading] = useState(true);

  // الآراء والأسئلة
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [faqs, setFaqs] = useState<FAQItem[]>([]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // تحميل الطلبات
  const loadOrders = useCallback(async () => {
    setOrdersLoading(true);
    setOrdersError("");
    try {
      setOrders(await listOrders());
    } catch (e) {
      setOrdersError(e instanceof Error ? e.message : "تعذّر تحميل الطلبات.");
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  // تحميل الكورسات وباقي المحتوى
  const loadAllContent = useCallback(async () => {
    setCoursesLoading(true);
    setConfigLoading(true);
    try {
      const [fetchedCourses, fetchedConfig, fetchedTestimonials, fetchedFaqs] = await Promise.all([
        fetchCourses(),
        fetchSiteConfig(),
        fetchTestimonials(),
        fetchFaqs(),
      ]);
      setCourses(fetchedCourses);
      setConfig(fetchedConfig);
      setTestimonials(fetchedTestimonials);
      setFaqs(fetchedFaqs);
    } catch (e) {
      console.error("Error loading content:", e);
    } finally {
      setCoursesLoading(false);
      setConfigLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadOrders();
    void loadAllContent();
  }, [loadOrders, loadAllContent]);

  const pendingCount = orders.filter((o) => o.status === "pending").length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:py-12">
      {/* التنبيه المنبثق */}
      {toastMsg && (
        <div className="fixed bottom-6 start-6 z-50 flex items-center gap-3 rounded-2xl bg-brand px-5 py-3.5 text-white shadow-2xl transition-all animate-in fade-in slide-in-from-bottom-5">
          <CircleCheck className="size-5 shrink-0 text-emerald-300" />
          <span className="text-sm font-bold">{toastMsg}</span>
        </div>
      )}

      {/* الترويسة الرئيسية */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-line bg-cream-2/80 p-6 shadow-soft backdrop-blur-md">
        <div>
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-2xl bg-brand text-white shadow-md">
              <ShieldCheck className="size-6" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-2xl font-black text-ink">لوحة التحكم الشاملة</h1>
                {demo ? (
                  <Badge tone="neutral" className="bg-amber-100 text-amber-800 border-amber-300">
                    وضع تجريبي
                  </Badge>
                ) : (
                  <Badge tone="orange" className="bg-emerald-100 text-emerald-800 border-emerald-300">
                    متصل بقاعدة البيانات
                  </Badge>
                )}
              </div>
              <p className="text-xs text-ink-soft mt-0.5">
                مسجل كـ: <span dir="ltr" className="font-mono font-semibold text-brand">{email || "أدمن المنصة"}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link to="/" className={btn("ghost", "sm", "gap-1.5")}>
            <ExternalLink className="size-4" />
            معاينة الموقع
          </Link>
          <button
            type="button"
            onClick={() => {
              void loadOrders();
              void loadAllContent();
              showToast("تم تحديث البيانات");
            }}
            className={btn("secondary", "sm", "gap-1.5")}
            title="تحديث البيانات"
          >
            <RefreshCw className="size-4" />
            تحديث
          </button>
          <button type="button" onClick={onSignOut} className={btn("ghost", "sm", "gap-1.5 text-red-600 hover:bg-red-50")}>
            <LogOut className="size-4" />
            خروج
          </button>
        </div>
      </div>

      {/* شريط التبويبات التفاعلي */}
      <div className="mt-8 overflow-x-auto pb-2">
        <div className="flex min-w-max gap-2 rounded-2xl border border-line bg-cream-2/50 p-1.5 shadow-sm">
          <TabButton
            active={activeTab === "orders"}
            onClick={() => setActiveTab("orders")}
            icon={<LayoutDashboard className="size-4" />}
            label="الطلبات والمبيعات"
            badge={pendingCount > 0 ? String(pendingCount) : undefined}
          />
          <TabButton
            active={activeTab === "courses"}
            onClick={() => setActiveTab("courses")}
            icon={<GraduationCap className="size-4" />}
            label={`إدارة الكورسات (${courses.length})`}
          />
          <TabButton
            active={activeTab === "site"}
            onClick={() => setActiveTab("site")}
            icon={<Settings className="size-4" />}
            label="هوية وإعدادات المنصة"
          />
          <TabButton
            active={activeTab === "payment"}
            onClick={() => setActiveTab("payment")}
            icon={<CreditCard className="size-4" />}
            label="طرق وبيانات الدفع"
          />
          <TabButton
            active={activeTab === "instructor"}
            onClick={() => setActiveTab("instructor")}
            icon={<UserCheck className="size-4" />}
            label="بيانات المحاضر"
          />
          <TabButton
            active={activeTab === "testimonials"}
            onClick={() => setActiveTab("testimonials")}
            icon={<MessageSquareQuote className="size-4" />}
            label="آراء الطلاب"
          />
          <TabButton
            active={activeTab === "faqs"}
            onClick={() => setActiveTab("faqs")}
            icon={<HelpCircle className="size-4" />}
            label="الأسئلة الشائعة"
          />
        </div>
      </div>

      {/* محتوى التبويبات */}
      <div className="mt-6">
        {activeTab === "orders" && (
          <OrdersTab
            orders={orders}
            loading={ordersLoading}
            error={ordersError}
            demo={demo}
            onReload={loadOrders}
            showToast={showToast}
          />
        )}

        {activeTab === "courses" && (
          <CoursesTab
            courses={courses}
            loading={coursesLoading}
            onUpdate={async (updated) => {
              setCourses(updated);
              await saveCoursesToDB(updated);
              showToast("تم حفظ الكورسات بنجاح!");
            }}
          />
        )}

        {activeTab === "site" && (
          <SiteConfigTab
            config={config}
            loading={configLoading}
            onSave={async (updated) => {
              setConfig(updated);
              await saveSiteConfigToDB(updated);
              showToast("تم حفظ إعدادات المنصة والهوية بنجاح!");
            }}
          />
        )}

        {activeTab === "payment" && (
          <PaymentTab
            config={config}
            onSave={async (updated) => {
              setConfig(updated);
              await saveSiteConfigToDB(updated);
              showToast("تم تحديث بيانات الدفع بنجاح!");
            }}
          />
        )}

        {activeTab === "instructor" && (
          <InstructorTab
            config={config}
            onSave={async (updated) => {
              setConfig(updated);
              await saveSiteConfigToDB(updated);
              showToast("تم حفظ بيانات المحاضر بنجاح!");
            }}
          />
        )}

        {activeTab === "testimonials" && (
          <TestimonialsTab
            testimonials={testimonials}
            onSave={async (updated) => {
              setTestimonials(updated);
              await saveTestimonialsToDB(updated);
              showToast("تم حفظ آراء الطلاب بنجاح!");
            }}
          />
        )}

        {activeTab === "faqs" && (
          <FaqsTab
            faqs={faqs}
            onSave={async (updated) => {
              setFaqs(updated);
              await saveFaqsToDB(updated);
              showToast("تم حفظ الأسئلة الشائعة بنجاح!");
            }}
          />
        )}
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
  badge,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  badge?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${
        active
          ? "bg-brand text-white shadow-md shadow-brand/20"
          : "text-ink-soft hover:bg-cream-2 hover:text-ink"
      }`}
    >
      {icon}
      <span>{label}</span>
      {badge && (
        <span
          className={`rounded-full px-2 py-0.5 text-[11px] font-black ${
            active ? "bg-white text-brand" : "bg-red-500 text-white"
          }`}
        >
          {badge}
        </span>
      )}
    </button>
  );
}

/* ═════════════════════════ تبويب الطلبات والمبيعات ═════════════════════════ */

type OrderFilter = OrderStatus | "all";

function OrdersTab({
  orders,
  loading,
  error,
  demo: _demo,
  onReload,
  showToast,
}: {
  orders: Order[];
  loading: boolean;
  error: string;
  demo: boolean;
  onReload: () => void;
  showToast: (m: string) => void;
}) {
  const [filter, setFilter] = useState<OrderFilter>("pending");
  const [query, setQuery] = useState("");
  const [reviewing, setReviewing] = useState<Order | null>(null);

  const stats = useMemo(() => {
    const sum = (s: OrderStatus) => orders.filter((o) => o.status === s).reduce((t, o) => t + o.total_egp, 0);
    const count = (s: OrderStatus) => orders.filter((o) => o.status === s).length;
    return {
      pending: { n: count("pending"), sum: sum("pending") },
      confirmed: { n: count("confirmed"), sum: sum("confirmed") },
      rejected: { n: count("rejected"), sum: sum("rejected") },
      totalRevenue: sum("confirmed"),
    };
  }, [orders]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((o) => {
      if (filter !== "all" && o.status !== filter) return false;
      if (!q) return true;
      return (
        o.code.toLowerCase().includes(q) ||
        o.customer_name.toLowerCase().includes(q) ||
        o.phone.includes(q) ||
        (o.email && o.email.toLowerCase().includes(q)) ||
        (o.sender_ref && o.sender_ref.toLowerCase().includes(q))
      );
    });
  }, [orders, filter, query]);

  return (
    <div className="space-y-6">
      {/* بطاقات الإحصائيات */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:gap-4">
        <StatCard label="إجمالي المبيعات المؤكدة" value={money(stats.totalRevenue)} accent="text-emerald-600" />
        <StatCard label="طلبات قيد المراجعة" value={`${stats.pending.n} طلب`} sub={money(stats.pending.sum)} accent="text-amber-600" />
        <StatCard label="طلبات مؤكَّدة" value={`${stats.confirmed.n} طلب`} sub={money(stats.confirmed.sum)} accent="text-brand" />
        <StatCard label="طلبات مرفوضة" value={`${stats.rejected.n} طلب`} sub={money(stats.rejected.sum)} accent="text-red-500" />
      </div>

      {error && (
        <div className="rounded-2xl bg-[#f6e0da] p-4 text-sm text-[#8a3523]">
          {error}
        </div>
      )}

      {/* شريط الفلاتر والبحث */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-cream-2/70 p-3">
        <div className="flex flex-wrap gap-1">
          {(
            [
              { id: "pending", label: "قيد المراجعة", n: stats.pending.n },
              { id: "confirmed", label: "مؤكَّد", n: stats.confirmed.n },
              { id: "rejected", label: "مرفوض", n: stats.rejected.n },
              { id: "all", label: "الكل", n: orders.length },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setFilter(t.id)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                filter === t.id ? "bg-brand text-white shadow-sm" : "text-ink-soft hover:bg-cream hover:text-ink"
              }`}
            >
              {t.label} ({t.n})
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-ink-soft/60" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث بالاسم، الهاتف، الرمز..."
            className="w-full rounded-xl border border-line bg-cream py-2 pe-3 ps-9 text-xs focus:border-brand focus:outline-none"
          />
        </div>
      </div>

      {/* جدول الطلبات */}
      {loading ? (
        <div className="grid min-h-[30vh] place-items-center rounded-3xl border border-line bg-cream-2/40 p-12">
          <LoaderCircle className="size-8 animate-spin text-brand" />
        </div>
      ) : visible.length === 0 ? (
        <div className="rounded-3xl border border-line bg-cream-2/40 p-12 text-center">
          <Clock className="mx-auto size-12 text-ink-soft/40" />
          <p className="mt-4 font-bold text-ink">لا توجد طلبات تطابق الفلتر الحالي</p>
          <p className="mt-1 text-xs text-ink-soft">عندما يقوم عميل بإتمام طلب على المنصة سيظهر هنا فوراً.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-line bg-cream-2/70 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-end text-sm">
              <thead className="border-b border-line bg-cream text-xs font-bold text-ink-soft">
                <tr>
                  <th className="px-4 py-3.5">الرمز والعميل</th>
                  <th className="px-4 py-3.5">الكورسات</th>
                  <th className="px-4 py-3.5">المبلغ وطريقة التحويل</th>
                  <th className="px-4 py-3.5">التاريخ</th>
                  <th className="px-4 py-3.5">الحالة</th>
                  <th className="px-4 py-3.5 text-center">إجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/60">
                {visible.map((order) => (
                  <tr key={order.id} className="hover:bg-cream/50 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="font-mono font-bold text-brand">{order.code}</div>
                      <div className="font-bold text-ink mt-0.5">{order.customer_name}</div>
                      <div dir="ltr" className="text-xs text-ink-soft mt-0.5">{order.phone}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="space-y-1">
                        {order.items.map((it) => (
                          <div key={it.id} className="text-xs font-semibold text-ink line-clamp-1">
                            • {it.title}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-extrabold text-ink">{money(order.total_egp)}</div>
                      <div className="text-xs text-ink-soft mt-0.5">{methodLabel[order.method]}</div>
                      {order.sender_ref && (
                        <div className="text-[11px] text-ink-soft/80 mt-0.5 font-mono">مرجع: {order.sender_ref}</div>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-ink-soft whitespace-nowrap">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <StatusChip status={order.status} />
                    </td>
                    <td className="px-4 py-3.5 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setReviewing(order)}
                        className={btn("primary", "sm", "text-xs px-3 py-1.5")}
                      >
                        مراجعة الإيصال
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {reviewing && (
        <OrderReviewModal
          order={reviewing}
          onClose={() => setReviewing(null)}
          onUpdateStatus={async (newStatus, note) => {
            await setOrderStatus(reviewing.id, newStatus, note);
            onReload();
            setReviewing(null);
            showToast("تم تحديث حالة الطلب بنجاح");
          }}
        />
      )}
    </div>
  );
}

function StatCard({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: string }) {
  return (
    <div className="rounded-2xl border border-line bg-cream-2/70 p-4 shadow-sm">
      <div className="text-xs text-ink-soft">{label}</div>
      <div className={`mt-1 font-display text-xl font-black ${accent ?? "text-ink"}`}>{value}</div>
      {sub && <div className="mt-0.5 text-[11px] text-ink-soft">{sub}</div>}
    </div>
  );
}

/* ═════════════════════════ نافذة مراجعة الطلب ═════════════════════════ */

function OrderReviewModal({
  order,
  onClose,
  onUpdateStatus,
}: {
  order: Order;
  onClose: () => void;
  onUpdateStatus: (s: OrderStatus, note: string) => Promise<void>;
}) {
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [loadingImg, setLoadingImg] = useState(true);
  const [note, setNote] = useState(order.admin_note ?? "");
  const [busy, setBusy] = useState(false);

  useEscape(true, onClose);
  useLockBodyScroll(true);

  useEffect(() => {
    void getReceiptUrl(order)
      .then((url) => setReceiptUrl(url))
      .catch(() => setReceiptUrl(null))
      .finally(() => setLoadingImg(false));
  }, [order]);

  const handleStatus = async (s: OrderStatus) => {
    setBusy(true);
    try {
      await onUpdateStatus(s, note);
    } finally {
      setBusy(false);
    }
  };

  const whatsappLink = `https://wa.me/${toWhatsappNumber(order.phone)}?text=${encodeURIComponent(
    `أهلاً بك أستاذ ${order.customer_name} في شركة سفير للتسويق والتدريب.\nبخصوص طلبك رقم (${order.code}) لكورسات: ${order.items
      .map((i) => i.title)
      .join("، ")}...`
  )}`;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl rounded-3xl border border-line bg-cream p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 end-5 grid size-9 place-items-center rounded-full bg-cream-2 text-ink-soft hover:bg-cream-3 hover:text-ink"
        >
          <X className="size-5" />
        </button>

        <div className="flex items-center gap-3">
          <StatusChip status={order.status} />
          <h2 className="font-display text-xl font-black">طلب: {order.code}</h2>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* بيانات العميل والطلب */}
          <div className="space-y-3 text-sm">
            <div className="rounded-2xl border border-line bg-cream-2/60 p-4 space-y-2">
              <div>
                <span className="text-xs text-ink-soft">الاسم:</span>{" "}
                <span className="font-bold text-ink">{order.customer_name}</span>
              </div>
              <div>
                <span className="text-xs text-ink-soft">الهاتف:</span>{" "}
                <span dir="ltr" className="font-mono font-bold text-brand">{order.phone}</span>
              </div>
              {order.email && (
                <div>
                  <span className="text-xs text-ink-soft">البريد:</span>{" "}
                  <span className="text-ink">{order.email}</span>
                </div>
              )}
              <div>
                <span className="text-xs text-ink-soft">طريقة التحويل:</span>{" "}
                <span className="font-bold text-ink">{methodLabel[order.method]}</span>
              </div>
              {order.sender_ref && (
                <div>
                  <span className="text-xs text-ink-soft">المرجع / المحوِّل:</span>{" "}
                  <span className="font-mono font-bold text-ink">{order.sender_ref}</span>
                </div>
              )}
              <div className="pt-2 border-t border-line flex justify-between items-center">
                <span className="font-bold text-ink">إجمالي المطلوب:</span>
                <span className="font-display text-lg font-black text-brand">{money(order.total_egp)}</span>
              </div>
            </div>

            {/* الكورسات المطلوبة */}
            <div className="rounded-2xl border border-line bg-cream-2/60 p-4">
              <div className="text-xs font-bold text-ink-soft mb-2">الكورسات المحجوزة:</div>
              <ul className="space-y-1.5 text-xs font-semibold">
                {order.items.map((i) => (
                  <li key={i.id} className="flex justify-between items-center text-ink">
                    <span>• {i.title}</span>
                    <span className="text-ink-soft">{money(i.price)}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* زر محادثة الواتساب */}
            <a
              href={whatsappLink}
              target="_blank"
              rel="noreferrer"
              className={btn("secondary", "sm", "w-full gap-2 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200")}
            >
              <MessageCircle className="size-4" />
              مراسلة العميل عبر واتساب
            </a>
          </div>

          {/* صورة الإيصال وملاحظات الإدارة */}
          <div className="space-y-4">
            <div className="overflow-hidden rounded-2xl border border-line bg-black/5 flex items-center justify-center min-h-[220px]">
              {loadingImg ? (
                <LoaderCircle className="size-6 animate-spin text-brand" />
              ) : receiptUrl ? (
                <a href={receiptUrl} target="_blank" rel="noreferrer" title="اضغط لفتح الصورة مكبرة">
                  <img src={receiptUrl} alt="إيصال التحويل" className="max-h-[240px] object-contain hover:scale-105 transition-transform" />
                </a>
              ) : (
                <span className="text-xs text-ink-soft">تعذر تحميل صورة الإيصال</span>
              )}
            </div>

            <div>
              <label className={labelClass}>ملاحظة الإدارة (اختياري تظهر لك):</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="أضف ملاحظة خاصة بهذا الطلب..."
                rows={2}
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* أزرار اتخاذ القرار */}
        <div className="mt-6 pt-4 border-t border-line flex flex-wrap justify-end gap-3">
          <button
            type="button"
            disabled={busy}
            onClick={() => void handleStatus("rejected")}
            className={btn("ghost", "md", "text-red-600 hover:bg-red-50 gap-1.5")}
          >
            <CircleX className="size-4" />
            رفض الطلب
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => void handleStatus("confirmed")}
            className={btn("primary", "md", "gap-1.5 bg-emerald-600 hover:bg-emerald-700")}
          >
            <CircleCheck className="size-4" />
            تأكيد الدفع والطلب
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═════════════════════════ تبويب إدارة الكورسات ═════════════════════════ */

function CoursesTab({
  courses,
  loading,
  onUpdate,
}: {
  courses: Course[];
  loading: boolean;
  onUpdate: (updated: Course[]) => Promise<void>;
}) {
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const startNewCourse = () => {
    const newCourse: Course = {
      id: `course-${Date.now()}`,
      slug: `new-course-${Date.now()}`,
      title: "",
      shortDescription: "",
      longDescription: [""],
      category: "marketing",
      price: 1999,
      oldPrice: 3499,
      duration: "10 ساعات",
      level: "جميع المستويات",
      featured: false,
      features: ["تطبيق عملي خطوة بخطوة", "متابعة دورية عبر واتساب"],
      outcomes: ["احتراف أدوات التسويق الحديث", "زيادة المبيعات والعائد المالي"],
      curriculum: [
        {
          title: "الوحدة الأولى: الأساسيات والمدخل العملي",
          lessons: ["مقدمة في المسار التدريبي", "تهيئة الأدوات وإعداد خطة العمل"],
        },
      ],
      theme: { from: "#7C3AED", to: "#FF6B00", icon: "sparkles" },
    };
    setEditingCourse(newCourse);
    setIsNew(true);
  };

  const handleDelete = async (id: string) => {
    const updated = courses.filter((c) => c.id !== id);
    await onUpdate(updated);
    setDeleteConfirmId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-black text-ink">الكورسات المتاحة على المنصة</h2>
          <p className="text-xs text-ink-soft mt-1">
            أضف أو عدّل أي كورس، المناهج والوحدات، والأسعار. التعديل ينعكس مباشرة على المتجر وصفحات الكورسات.
          </p>
        </div>
        <button type="button" onClick={startNewCourse} className={btn("primary", "md", "gap-2")}>
          <Plus className="size-4" />
          إضافة كورس جديد
        </button>
      </div>

      {loading ? (
        <div className="grid min-h-[30vh] place-items-center">
          <LoaderCircle className="size-8 animate-spin text-brand" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <div
              key={course.id}
              className="group relative flex flex-col justify-between rounded-3xl border border-line bg-cream-2/70 p-5 shadow-soft transition-all hover:border-brand/40"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <Badge tone="brand" className="text-xs">
                    {course.category === "ai"
                      ? "ذكاء اصطناعي"
                      : course.category === "marketing"
                      ? "تسويق رقمي"
                      : "إدارة أعمال"}
                  </Badge>
                  {course.featured && (
                    <Badge tone="orange" className="text-xs bg-amber-100 text-amber-800">
                      مميز ★
                    </Badge>
                  )}
                </div>

                <h3 className="mt-3 font-display text-lg font-black text-ink">{course.title}</h3>
                <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-ink-soft">
                  {course.shortDescription}
                </p>

                <div className="mt-4 flex items-center justify-between text-xs text-ink-soft border-t border-line/60 pt-3">
                  <span>المدة: {course.duration}</span>
                  <span>{course.curriculum.length} وحدات تدريبية</span>
                </div>

                <div className="mt-2 flex items-baseline gap-2">
                  <span className="font-display text-lg font-black text-brand">{money(course.price)}</span>
                  {course.oldPrice && (
                    <span className="text-xs text-ink-soft line-through">{money(course.oldPrice)}</span>
                  )}
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between gap-2 border-t border-line pt-3">
                <Link to={`/course/${course.slug}`} className={btn("ghost", "sm", "text-xs gap-1")}>
                  <ExternalLink className="size-3.5" />
                  معاينة
                </Link>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCourse({ ...course });
                      setIsNew(false);
                    }}
                    className={btn("secondary", "sm", "text-xs gap-1")}
                  >
                    <Pencil className="size-3.5" />
                    تعديل
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteConfirmId(course.id)}
                    className="grid size-8 place-items-center rounded-xl text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors"
                    title="حذف الكورس"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* نافذة إنشاء / تعديل كورس */}
      {editingCourse && (
        <CourseEditModal
          course={editingCourse}
          isNew={isNew}
          onClose={() => setEditingCourse(null)}
          onSave={async (savedCourse) => {
            let updated: Course[];
            if (isNew) {
              updated = [...courses, savedCourse];
            } else {
              updated = courses.map((c) => (c.id === savedCourse.id ? savedCourse : c));
            }
            await onUpdate(updated);
            setEditingCourse(null);
          }}
        />
      )}

      {/* تأكيد الحذف */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl border border-line bg-cream p-6 text-center shadow-xl">
            <TriangleAlert className="mx-auto size-12 text-red-500" />
            <h3 className="mt-3 font-display text-lg font-black text-ink">هل تريد بالتأكيد حذف هذا الكورس؟</h3>
            <p className="mt-1 text-xs text-ink-soft">لا يمكن التراجع عن هذه الخطوة وسيختفي الكورس من المتجر.</p>
            <div className="mt-5 flex justify-center gap-3">
              <button type="button" onClick={() => setDeleteConfirmId(null)} className={btn("ghost", "md")}>
                إلغاء
              </button>
              <button
                type="button"
                onClick={() => void handleDelete(deleteConfirmId)}
                className={btn("primary", "md", "bg-red-600 hover:bg-red-700")}
              >
                تأكيد الحذف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═════════════════════════ نافذة تعديل بيانات الكورس والمنهج ═════════════════════════ */

function CourseEditModal({
  course,
  isNew,
  onClose,
  onSave,
}: {
  course: Course;
  isNew: boolean;
  onClose: () => void;
  onSave: (c: Course) => Promise<void>;
}) {
  const [data, setData] = useState<Course>({ ...course });
  const [saving, setSaving] = useState(false);

  useEscape(true, onClose);
  useLockBodyScroll(true);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!data.title.trim()) return;
    setSaving(true);
    try {
      await onSave(data);
    } finally {
      setSaving(false);
    }
  };

  // معالجة الوحدات التدريبية
  const addUnit = () => {
    const updated: Unit[] = [
      ...data.curriculum,
      { title: `الوحدة الجديدة ${data.curriculum.length + 1}`, lessons: ["الدرس الأول"] },
    ];
    setData({ ...data, curriculum: updated });
  };

  const removeUnit = (index: number) => {
    const updated = data.curriculum.filter((_, i) => i !== index);
    setData({ ...data, curriculum: updated });
  };

  const updateUnitTitle = (index: number, title: string) => {
    const updated = [...data.curriculum];
    updated[index].title = title;
    setData({ ...data, curriculum: updated });
  };

  const addLesson = (unitIndex: number) => {
    const updated = [...data.curriculum];
    updated[unitIndex].lessons.push(`درس جديد ${updated[unitIndex].lessons.length + 1}`);
    setData({ ...data, curriculum: updated });
  };

  const removeLesson = (unitIndex: number, lessonIndex: number) => {
    const updated = [...data.curriculum];
    updated[unitIndex].lessons = updated[unitIndex].lessons.filter((_, li) => li !== lessonIndex);
    setData({ ...data, curriculum: updated });
  };

  const updateLessonTitle = (unitIndex: number, lessonIndex: number, text: string) => {
    const updated = [...data.curriculum];
    updated[unitIndex].lessons[lessonIndex] = text;
    setData({ ...data, curriculum: updated });
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border border-line bg-cream p-6 md:p-8 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 end-5 grid size-9 place-items-center rounded-full bg-cream-2 text-ink-soft hover:bg-cream-3 hover:text-ink"
        >
          <X className="size-5" />
        </button>

        <h2 className="font-display text-2xl font-black text-ink">
          {isNew ? "إضافة كورس جديد للمنصة" : `تعديل كورس: ${course.title}`}
        </h2>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          {/* البيانات الأساسية */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className={labelClass}>عنوان الكورس (العربي):</label>
              <input
                type="text"
                required
                value={data.title}
                onChange={(e) => setData({ ...data, title: e.target.value })}
                className={inputClass}
                placeholder="مثال: احتراف إعلانات Meta والذكاء الاصطناعي 2026"
              />
            </div>
            <div>
              <label className={labelClass}>الرابط اللطيف (Slug بالإنجليزية):</label>
              <input
                type="text"
                required
                value={data.slug}
                onChange={(e) => setData({ ...data, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
                dir="ltr"
                className={inputClass}
                placeholder="meta-ads-mastery"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div>
              <label className={labelClass}>التصنيف / المسار:</label>
              <select
                value={data.category}
                onChange={(e) => setData({ ...data, category: e.target.value as CategoryId })}
                className={inputClass}
              >
                <option value="marketing">تسويق رقمي</option>
                <option value="ai">ذكاء اصطناعي</option>
                <option value="business">إدارة أعمال</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>السعر الحالي (ج.م):</label>
              <input
                type="number"
                required
                min={0}
                value={data.price}
                onChange={(e) => setData({ ...data, price: Number(e.target.value) })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>السعر قبل الخصم (اختياري):</label>
              <input
                type="number"
                min={0}
                value={data.oldPrice ?? ""}
                onChange={(e) => setData({ ...data, oldPrice: e.target.value ? Number(e.target.value) : undefined })}
                className={inputClass}
                placeholder="مثال: 3500"
              />
            </div>
            <div>
              <label className={labelClass}>مدة الكورس:</label>
              <input
                type="text"
                value={data.duration}
                onChange={(e) => setData({ ...data, duration: e.target.value })}
                className={inputClass}
                placeholder="12 ساعة"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>المستوى التدريبي:</label>
              <input
                type="text"
                value={data.level}
                onChange={(e) => setData({ ...data, level: e.target.value })}
                className={inputClass}
                placeholder="من المبتدئ إلى المحترف"
              />
            </div>
            <div className="flex items-center gap-3 pt-6">
              <input
                type="checkbox"
                id="featured_cb"
                checked={data.featured ?? false}
                onChange={(e) => setData({ ...data, featured: e.target.checked })}
                className="size-5 rounded border-line text-brand focus:ring-brand"
              />
              <label htmlFor="featured_cb" className="text-sm font-bold text-ink cursor-pointer">
                تمييز الكورس كـ (كورس مميز / الأكثر طلباً) في الصفحة الرئيسية
              </label>
            </div>
          </div>

          {/* الوصف */}
          <div>
            <label className={labelClass}>الوصف المختصر (يظهر في البطاقة):</label>
            <textarea
              rows={2}
              required
              value={data.shortDescription}
              onChange={(e) => setData({ ...data, shortDescription: e.target.value })}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>الوصف المفصل (فقرات تظهر في صفحة الكورس):</label>
            <textarea
              rows={3}
              value={data.longDescription.join("\n\n")}
              onChange={(e) =>
                setData({
                  ...data,
                  longDescription: e.target.value.split("\n\n").filter((p) => p.trim()),
                })
              }
              className={inputClass}
              placeholder="اكتب كل فقرة تفصل بينها بسطر فارغ..."
            />
          </div>

          {/* مميزات ومخرجات الكورس */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-line bg-cream-2/50 p-4">
              <label className={labelClass}>مميزات الكورس (ميزة في كل سطر):</label>
              <textarea
                rows={4}
                value={data.features.join("\n")}
                onChange={(e) =>
                  setData({
                    ...data,
                    features: e.target.value.split("\n").filter((f) => f.trim()),
                  })
                }
                className={inputClass}
                placeholder="تطبيق عملي خطوة بخطوة&#10;متابعة أسبوعية عبر واتساب..."
              />
            </div>
            <div className="rounded-2xl border border-line bg-cream-2/50 p-4">
              <label className={labelClass}>ما ستتعلمه في الكورس (مخرج في كل سطر):</label>
              <textarea
                rows={4}
                value={data.outcomes.join("\n")}
                onChange={(e) =>
                  setData({
                    ...data,
                    outcomes: e.target.value.split("\n").filter((o) => o.trim()),
                  })
                }
                className={inputClass}
                placeholder="إطلاق حملات تسويقية ناجحة&#10;تحقيق أعلى عائد مادي..."
              />
            </div>
          </div>

          {/* بناء المنهج والوحدات التدريبية */}
          <div className="rounded-3xl border border-line bg-cream-2/70 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-base font-black text-ink">المنهج والوحدات التدريبية (Curriculum)</h3>
                <p className="text-xs text-ink-soft">قسّم الكورس إلى وحدات وأضف الدروس بداخل كل وحدة.</p>
              </div>
              <button type="button" onClick={addUnit} className={btn("secondary", "sm", "text-xs gap-1")}>
                <Plus className="size-3.5" />
                إضافة وحدة
              </button>
            </div>

            <div className="space-y-4">
              {data.curriculum.map((unit, uIdx) => (
                <div key={uIdx} className="rounded-2xl border border-line bg-cream p-4 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between gap-2">
                    <input
                      type="text"
                      value={unit.title}
                      onChange={(e) => updateUnitTitle(uIdx, e.target.value)}
                      className="w-full font-bold text-sm bg-transparent border-b border-line pb-1 focus:border-brand focus:outline-none"
                      placeholder={`عنوان الوحدة ${uIdx + 1}`}
                    />
                    <button
                      type="button"
                      onClick={() => removeUnit(uIdx)}
                      className="text-red-500 hover:text-red-700 text-xs px-2 py-1"
                      title="حذف الوحدة"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>

                  {/* الدروس التابعة للوحدة */}
                  <div className="space-y-2 ps-3 border-s-2 border-brand/30">
                    {unit.lessons.map((lesson, lIdx) => (
                      <div key={lIdx} className="flex items-center gap-2">
                        <span className="text-xs text-ink-soft/80">{lIdx + 1}.</span>
                        <input
                          type="text"
                          value={lesson}
                          onChange={(e) => updateLessonTitle(uIdx, lIdx, e.target.value)}
                          className="w-full text-xs bg-cream-2 rounded-lg px-2.5 py-1.5 border border-line/60 focus:border-brand focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => removeLesson(uIdx, lIdx)}
                          className="text-ink-soft hover:text-red-500 p-1"
                        >
                          <X className="size-3.5" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addLesson(uIdx)}
                      className="text-xs text-brand font-bold hover:underline inline-flex items-center gap-1 mt-1"
                    >
                      <Plus className="size-3" />
                      إضافة درس لهذه الوحدة
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* مظهر الغلاف والألوان */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className={labelClass}>أيقونة الغلاف:</label>
              <select
                value={data.theme.icon}
                onChange={(e) => setData({ ...data, theme: { ...data.theme, icon: e.target.value as CoverIcon } })}
                className={inputClass}
              >
                <option value="sparkles">بريق وذكاء اصطناعي (Sparkles)</option>
                <option value="megaphone">تسويق ومكبر صوت (Megaphone)</option>
                <option value="video">ميديا وفيديو (Video)</option>
                <option value="briefcase">أعمال وإدارة (Briefcase)</option>
                <option value="search">بحث وتحليل (Search)</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>لون البداية (HEX):</label>
              <input
                type="text"
                value={data.theme.from}
                onChange={(e) => setData({ ...data, theme: { ...data.theme, from: e.target.value } })}
                className={inputClass}
                dir="ltr"
              />
            </div>
            <div>
              <label className={labelClass}>لون النهاية (HEX):</label>
              <input
                type="text"
                value={data.theme.to}
                onChange={(e) => setData({ ...data, theme: { ...data.theme, to: e.target.value } })}
                className={inputClass}
                dir="ltr"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-line">
            <button type="button" onClick={onClose} className={btn("ghost", "md")}>
              إلغاء
            </button>
            <button type="submit" disabled={saving} className={btn("primary", "md", "min-w-[120px]")}>
              {saving ? <LoaderCircle className="size-4 animate-spin" /> : "حفظ الكورس"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ═════════════════════════ تبويب هوية وإعدادات المنصة ═════════════════════════ */

function SiteConfigTab({
  config,
  loading,
  onSave,
}: {
  config: SiteConfigType;
  loading: boolean;
  onSave: (c: SiteConfigType) => Promise<void>;
}) {
  const [data, setData] = useState<SiteConfigType>({ ...config });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setData({ ...config });
  }, [config]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(data);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="grid min-h-[30vh] place-items-center">
        <LoaderCircle className="size-8 animate-spin text-brand" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* هوية المنصة والاسم */}
      <div className="rounded-3xl border border-line bg-cream-2/70 p-6 space-y-4">
        <h3 className="font-display text-lg font-black text-ink">هوية المنصة والاسم الرسمي</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className={labelClass}>اسم المنصة / الشركة:</label>
            <input
              type="text"
              required
              value={data.name}
              onChange={(e) => setData({ ...data, name: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>رقم الواتساب الرسمي (بالصيغة الدولية بدون +):</label>
            <input
              type="text"
              required
              dir="ltr"
              value={data.whatsappNumber}
              onChange={(e) => setData({ ...data, whatsappNumber: e.target.value.replace(/\D/g, "") })}
              className={inputClass}
              placeholder="201000000000"
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>السلوجان والشعار اللفظي (Tagline):</label>
          <input
            type="text"
            required
            value={data.tagline}
            onChange={(e) => setData({ ...data, tagline: e.target.value })}
            className={inputClass}
          />
        </div>
      </div>

      {/* روابط السوشيال ميديا */}
      <div className="rounded-3xl border border-line bg-cream-2/70 p-6 space-y-4">
        <h3 className="font-display text-lg font-black text-ink">روابط منصات التواصل الاجتماعي</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className={labelClass}>صفحة الفيسبوك:</label>
            <input
              type="url"
              dir="ltr"
              value={data.social.facebook}
              onChange={(e) => setData({ ...data, social: { ...data.social, facebook: e.target.value } })}
              className={inputClass}
              placeholder="https://facebook.com/..."
            />
          </div>
          <div>
            <label className={labelClass}>حساب إنستغرام:</label>
            <input
              type="url"
              dir="ltr"
              value={data.social.instagram}
              onChange={(e) => setData({ ...data, social: { ...data.social, instagram: e.target.value } })}
              className={inputClass}
              placeholder="https://instagram.com/..."
            />
          </div>
          <div>
            <label className={labelClass}>حساب تيك توك:</label>
            <input
              type="url"
              dir="ltr"
              value={data.social.tiktok}
              onChange={(e) => setData({ ...data, social: { ...data.social, tiktok: e.target.value } })}
              className={inputClass}
              placeholder="https://tiktok.com/@..."
            />
          </div>
          <div>
            <label className={labelClass}>قناة يوتيوب:</label>
            <input
              type="url"
              dir="ltr"
              value={data.social.youtube}
              onChange={(e) => setData({ ...data, social: { ...data.social, youtube: e.target.value } })}
              className={inputClass}
              placeholder="https://youtube.com/@..."
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button type="submit" disabled={saving} className={btn("primary", "lg", "min-w-[150px]")}>
          {saving ? <LoaderCircle className="size-5 animate-spin" /> : "حفظ إعدادات الهوية"}
        </button>
      </div>
    </form>
  );
}

/* ═════════════════════════ تبويب بيانات وطرق الدفع ═════════════════════════ */

function PaymentTab({
  config,
  onSave,
}: {
  config: SiteConfigType;
  onSave: (c: SiteConfigType) => Promise<void>;
}) {
  const [data, setData] = useState<SiteConfigType>({ ...config });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setData({ ...config });
  }, [config]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(data);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-3xl border border-line bg-cream-2/70 p-6 space-y-4">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-red-600 text-white font-bold text-xs">
            VF
          </span>
          <div>
            <h3 className="font-display text-lg font-black text-ink">محفظة فودافون كاش (Vodafone Cash)</h3>
            <p className="text-xs text-ink-soft">البيانات التي تظهر للعميل عند اختيار الدفع عبر المحفظة.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className={labelClass}>رقم محفظة التحويل:</label>
            <input
              type="text"
              dir="ltr"
              value={data.payment.vodafoneCash.number}
              onChange={(e) =>
                setData({
                  ...data,
                  payment: {
                    ...data.payment,
                    vodafoneCash: { ...data.payment.vodafoneCash, number: e.target.value },
                  },
                })
              }
              className={inputClass}
              placeholder="010XXXXXXXX"
            />
          </div>
          <div>
            <label className={labelClass}>اسم صاحب المحفظة (للتأكد):</label>
            <input
              type="text"
              value={data.payment.vodafoneCash.holder}
              onChange={(e) =>
                setData({
                  ...data,
                  payment: {
                    ...data.payment,
                    vodafoneCash: { ...data.payment.vodafoneCash, holder: e.target.value },
                  },
                })
              }
              className={inputClass}
              placeholder="أحمد حسين"
            />
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-line bg-cream-2/70 p-6 space-y-4">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-purple-700 text-white font-bold text-xs">
            IP
          </span>
          <div>
            <h3 className="font-display text-lg font-black text-ink">حساب إنستاباي (InstaPay)</h3>
            <p className="text-xs text-ink-soft">البيانات التي تظهر للعميل عند اختيار التحويل اللحظي عبر إنستاباي.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className={labelClass}>عنوان الدفع اللحظي (IPA):</label>
            <input
              type="text"
              dir="ltr"
              value={data.payment.instapay.address}
              onChange={(e) =>
                setData({
                  ...data,
                  payment: {
                    ...data.payment,
                    instapay: { ...data.payment.instapay, address: e.target.value },
                  },
                })
              }
              className={inputClass}
              placeholder="username@instapay"
            />
          </div>
          <div>
            <label className={labelClass}>رقم الهاتف المرتبط (اختياري):</label>
            <input
              type="text"
              dir="ltr"
              value={data.payment.instapay.phone}
              onChange={(e) =>
                setData({
                  ...data,
                  payment: {
                    ...data.payment,
                    instapay: { ...data.payment.instapay, phone: e.target.value },
                  },
                })
              }
              className={inputClass}
              placeholder="010XXXXXXXX"
            />
          </div>
          <div>
            <label className={labelClass}>اسم الحساب المسجل في إنستاباي:</label>
            <input
              type="text"
              value={data.payment.instapay.holder}
              onChange={(e) =>
                setData({
                  ...data,
                  payment: {
                    ...data.payment,
                    instapay: { ...data.payment.instapay, holder: e.target.value },
                  },
                })
              }
              className={inputClass}
              placeholder="د. أحمد حسين"
            />
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-line bg-cream-2/70 p-6 space-y-3">
        <label className={labelClass}>تعليمات وملاحظات التحويل للعملاء (سطر لكل ملاحظة):</label>
        <textarea
          rows={3}
          value={data.payment.notes.join("\n")}
          onChange={(e) =>
            setData({
              ...data,
              payment: {
                ...data.payment,
                notes: e.target.value.split("\n").filter((n) => n.trim()),
              },
            })
          }
          className={inputClass}
        />
      </div>

      <div className="flex justify-end">
        <button type="submit" disabled={saving} className={btn("primary", "lg", "min-w-[150px]")}>
          {saving ? <LoaderCircle className="size-5 animate-spin" /> : "حفظ بيانات الدفع"}
        </button>
      </div>
    </form>
  );
}

/* ═════════════════════════ تبويب بيانات المحاضر ═════════════════════════ */

function InstructorTab({
  config,
  onSave,
}: {
  config: SiteConfigType;
  onSave: (c: SiteConfigType) => Promise<void>;
}) {
  const [data, setData] = useState<SiteConfigType>({ ...config });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setData({ ...config });
  }, [config]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(data);
    } finally {
      setSaving(false);
    }
  };

  const inst = data.instructor;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-3xl border border-line bg-cream-2/70 p-6 space-y-4">
        <h3 className="font-display text-lg font-black text-ink">الملف التعريفي للمحاضر (د. أحمد حسين)</h3>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className={labelClass}>اسم المحاضر الكامل:</label>
            <input
              type="text"
              required
              value={inst.name}
              onChange={(e) =>
                setData({
                  ...data,
                  instructor: { ...inst, name: e.target.value },
                })
              }
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>المسمى الوظيفي والصفة المهنية:</label>
            <input
              type="text"
              required
              value={inst.title}
              onChange={(e) =>
                setData({
                  ...data,
                  instructor: { ...inst, title: e.target.value },
                })
              }
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>النبذة التعريفية المختصرة (تظهر في بطاقات الكورسات):</label>
          <textarea
            rows={2}
            value={inst.bio}
            onChange={(e) =>
              setData({
                ...data,
                instructor: { ...inst, bio: e.target.value },
              })
            }
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>صفحة «عن المحاضر» وقصة النجاح (فقرة في كل سطر متباعد):</label>
          <textarea
            rows={5}
            value={inst.about.join("\n\n")}
            onChange={(e) =>
              setData({
                ...data,
                instructor: {
                  ...inst,
                  about: e.target.value.split("\n\n").filter((p) => p.trim()),
                },
              })
            }
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>مجالات التخصص والخبرة (مجال في كل سطر):</label>
          <textarea
            rows={4}
            value={inst.expertise.join("\n")}
            onChange={(e) =>
              setData({
                ...data,
                instructor: {
                  ...inst,
                  expertise: e.target.value.split("\n").filter((p) => p.trim()),
                },
              })
            }
            className={inputClass}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button type="submit" disabled={saving} className={btn("primary", "lg", "min-w-[150px]")}>
          {saving ? <LoaderCircle className="size-5 animate-spin" /> : "حفظ بيانات المحاضر"}
        </button>
      </div>
    </form>
  );
}

/* ═════════════════════════ تبويب آراء الطلاب ═════════════════════════ */

function TestimonialsTab({
  testimonials,
  onSave,
}: {
  testimonials: Testimonial[];
  onSave: (t: Testimonial[]) => Promise<void>;
}) {
  const [items, setItems] = useState<Testimonial[]>([...testimonials]);
  const [editing, setEditing] = useState<{ index: number | null; item: Testimonial } | null>(null);

  useEffect(() => {
    setItems([...testimonials]);
  }, [testimonials]);

  const saveItem = async (item: Testimonial) => {
    let updated: Testimonial[];
    if (editing && editing.index !== null) {
      updated = [...items];
      updated[editing.index] = item;
    } else {
      updated = [...items, item];
    }
    setItems(updated);
    await onSave(updated);
    setEditing(null);
  };

  const deleteItem = async (index: number) => {
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
    await onSave(updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-black text-ink">آراء وتقييمات المتدربين (Testimonials)</h2>
          <p className="text-xs text-ink-soft mt-1">تظهر هذه التقييمات في الصفحة الرئيسية لتعزيز المصداقية وثقة العملاء الجدد.</p>
        </div>
        <button
          type="button"
          onClick={() =>
            setEditing({
              index: null,
              item: { name: "", role: "متدرب", text: "", rating: 5 },
            })
          }
          className={btn("primary", "md", "gap-1.5")}
        >
          <Plus className="size-4" />
          إضافة تقييم جديد
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map((t, i) => (
          <div key={i} className="flex flex-col justify-between rounded-3xl border border-line bg-cream-2/70 p-5 shadow-soft">
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-display text-base font-bold text-ink">{t.name}</h4>
                  <span className="text-xs text-ink-soft">{t.role}</span>
                </div>
                <div className="text-amber-500 text-sm">{"★".repeat(t.rating)}</div>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-ink line-clamp-3">"{t.text}"</p>
            </div>

            <div className="mt-4 flex justify-end gap-2 border-t border-line pt-3">
              <button
                type="button"
                onClick={() => setEditing({ index: i, item: { ...t } })}
                className={btn("ghost", "sm", "text-xs gap-1")}
              >
                <Pencil className="size-3.5" />
                تعديل
              </button>
              <button
                type="button"
                onClick={() => void deleteItem(i)}
                className="grid size-8 place-items-center rounded-xl text-red-500 hover:bg-red-50"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-line bg-cream p-6 shadow-2xl">
            <h3 className="font-display text-lg font-black text-ink mb-4">
              {editing.index === null ? "إضافة تقييم جديد" : "تعديل التقييم"}
            </h3>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>اسم المتدرب / العميل:</label>
                <input
                  type="text"
                  required
                  value={editing.item.name}
                  onChange={(e) => setEditing({ ...editing, item: { ...editing.item, name: e.target.value } })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>الصفة أو العمل:</label>
                <input
                  type="text"
                  value={editing.item.role}
                  onChange={(e) => setEditing({ ...editing, item: { ...editing.item, role: e.target.value } })}
                  className={inputClass}
                  placeholder="صاحب متجر إلكتروني / مسوق"
                />
              </div>
              <div>
                <label className={labelClass}>التقييم من 5 نجوم:</label>
                <select
                  value={editing.item.rating}
                  onChange={(e) => setEditing({ ...editing, item: { ...editing.item, rating: Number(e.target.value) } })}
                  className={inputClass}
                >
                  <option value={5}>★★★★★ (5 من 5)</option>
                  <option value={4}>★★★★☆ (4 من 5)</option>
                  <option value={3}>★★★☆☆ (3 من 5)</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>نص الرأي والتجربة:</label>
                <textarea
                  rows={3}
                  required
                  value={editing.item.text}
                  onChange={(e) => setEditing({ ...editing, item: { ...editing.item, text: e.target.value } })}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 pt-3 border-t border-line">
              <button type="button" onClick={() => setEditing(null)} className={btn("ghost", "md")}>
                إلغاء
              </button>
              <button
                type="button"
                onClick={() => void saveItem(editing.item)}
                className={btn("primary", "md")}
              >
                حفظ التقييم
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═════════════════════════ تبويب الأسئلة الشائعة ═════════════════════════ */

function FaqsTab({
  faqs,
  onSave,
}: {
  faqs: FAQItem[];
  onSave: (f: FAQItem[]) => Promise<void>;
}) {
  const [items, setItems] = useState<FAQItem[]>([...faqs]);
  const [editing, setEditing] = useState<{ index: number | null; item: FAQItem } | null>(null);

  useEffect(() => {
    setItems([...faqs]);
  }, [faqs]);

  const saveItem = async (item: FAQItem) => {
    let updated: FAQItem[];
    if (editing && editing.index !== null) {
      updated = [...items];
      updated[editing.index] = item;
    } else {
      updated = [...items, item];
    }
    setItems(updated);
    await onSave(updated);
    setEditing(null);
  };

  const deleteItem = async (index: number) => {
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
    await onSave(updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-black text-ink">الأسئلة الشائعة (FAQ Management)</h2>
          <p className="text-xs text-ink-soft mt-1">تساعد في إزالة أي تردد لدى الزوار وتسهيل عملية اتخاذ قرار التسجيل.</p>
        </div>
        <button
          type="button"
          onClick={() => setEditing({ index: null, item: { q: "", a: "" } })}
          className={btn("primary", "md", "gap-1.5")}
        >
          <Plus className="size-4" />
          إضافة سؤال جديد
        </button>
      </div>

      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="flex items-start justify-between gap-4 rounded-2xl border border-line bg-cream-2/70 p-4 shadow-xs">
            <div className="space-y-1">
              <h4 className="font-bold text-sm text-ink">{item.q}</h4>
              <p className="text-xs text-ink-soft leading-relaxed">{item.a}</p>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => setEditing({ index: i, item: { ...item } })}
                className="grid size-8 place-items-center rounded-lg text-ink-soft hover:bg-cream hover:text-ink"
                title="تعديل"
              >
                <Pencil className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => void deleteItem(i)}
                className="grid size-8 place-items-center rounded-lg text-red-500 hover:bg-red-50"
                title="حذف"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl border border-line bg-cream p-6 shadow-2xl">
            <h3 className="font-display text-lg font-black text-ink mb-4">
              {editing.index === null ? "إضافة سؤال شائع" : "تعديل السؤال"}
            </h3>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>السؤال:</label>
                <input
                  type="text"
                  required
                  value={editing.item.q}
                  onChange={(e) => setEditing({ ...editing, item: { ...editing.item, q: e.target.value } })}
                  className={inputClass}
                  placeholder="مثال: هل الكورس مناسب للمبتدئين بدون خبرة سابقة؟"
                />
              </div>
              <div>
                <label className={labelClass}>الإجابة والتوضيح:</label>
                <textarea
                  rows={4}
                  required
                  value={editing.item.a}
                  onChange={(e) => setEditing({ ...editing, item: { ...editing.item, a: e.target.value } })}
                  className={inputClass}
                  placeholder="نعم، نبدأ معك من الصفر تماماً خطوة بخطوة..."
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 pt-3 border-t border-line">
              <button type="button" onClick={() => setEditing(null)} className={btn("ghost", "md")}>
                إلغاء
              </button>
              <button
                type="button"
                onClick={() => void saveItem(editing.item)}
                className={btn("primary", "md")}
              >
                حفظ السؤال
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
