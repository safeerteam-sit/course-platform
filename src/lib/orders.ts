import { blobToDataUrl } from "./image";
import { readJSON, writeJSON } from "./storage";
import { isDemoMode, supabase } from "./supabase";
import type { NewOrderInput, Order, OrderStatus } from "../types";

/**
 * طبقة الطلبات والدفع.
 * - مع ضبط Supabase: تُحفظ الطلبات في جدول orders والإيصالات في مخزن receipts الخاص.
 * - بدون ضبطه: «وضع تجريبي» يحفظ كل شيء في متصفح الزائر فقط (للتجربة، لا للإنتاج).
 */

const BUCKET = "receipts";
const DEMO_KEY = "cp.demo.orders";

/* ───────────── أدوات ───────────── */

function randomBytes(n: number): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(n));
}

function uuid(): string {
  const b = randomBytes(16);
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // بدون الحروف المتشابهة (O/0 و I/1)

function makeCode(): string {
  return "ORD-" + Array.from(randomBytes(6), (x) => ALPHABET[x % ALPHABET.length]).join("");
}

function extFor(type: string): string {
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  return "jpg";
}

/** يحوّل رقماً مصرياً مثل 01012345678 إلى صيغة واتساب الدولية */
export function toWhatsappNumber(phone: string): string {
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  else if (digits.startsWith("0")) digits = "20" + digits.slice(1);
  return digits;
}

/* ───────────── العميل: إرسال طلب ───────────── */

export async function submitOrder(input: NewOrderInput, receipt: Blob): Promise<{ code: string }> {
  const id = uuid();
  const base = {
    id,
    customer_name: input.customer_name.trim(),
    phone: input.phone.trim(),
    email: input.email.trim() || null,
    method: input.method,
    sender_ref: input.sender_ref.trim() || null,
    items: input.items,
    total_egp: input.total_egp,
  };

  if (!supabase) {
    const code = makeCode();
    const order: Order = {
      ...base,
      code,
      receipt_path: await blobToDataUrl(receipt),
      status: "pending",
      admin_note: null,
      created_at: new Date().toISOString(),
      reviewed_at: null,
    };
    const all = readJSON<Order[]>(DEMO_KEY, []);
    try {
      window.localStorage.setItem(DEMO_KEY, JSON.stringify([order, ...all]));
    } catch {
      throw new Error("مساحة التخزين التجريبي ممتلئة. احذف بعض الطلبات التجريبية من لوحة التحكم.");
    }
    return { code };
  }

  const path = `${new Date().toISOString().slice(0, 7)}/${id}.${extFor(receipt.type)}`;
  const upload = await supabase.storage.from(BUCKET).upload(path, receipt, {
    contentType: receipt.type || "image/jpeg",
    upsert: false,
  });
  if (upload.error) throw new Error("تعذّر رفع صورة الإيصال. تأكد من اتصالك بالإنترنت وحاول مرة أخرى.");

  for (let attempt = 0; attempt < 3; attempt++) {
    const code = makeCode();
    const { error } = await supabase.from("orders").insert({ ...base, code, receipt_path: path });
    if (!error) return { code };
    if (error.code !== "23505") throw new Error("تعذّر إرسال الطلب. حاول مرة أخرى، أو تواصل معنا عبر واتساب.");
  }
  throw new Error("تعذّر إنشاء رمز الطلب. حاول مرة أخرى.");
}

/* ───────────── الأدمن: المصادقة ───────────── */

export type AdminState =
  | { kind: "demo" }
  | { kind: "signed-out" }
  | { kind: "not-admin"; email: string }
  | { kind: "admin"; email: string };

export async function getAdminState(): Promise<AdminState> {
  if (!supabase) return { kind: "demo" };
  const { data } = await supabase.auth.getSession();
  const user = data.session?.user;
  if (!user) return { kind: "signed-out" };
  const email = user.email ?? "";
  const { data: isAdmin, error } = await supabase.rpc("is_admin");
  if (error || isAdmin !== true) return { kind: "not-admin", email };
  return { kind: "admin", email };
}

export async function adminSignIn(email: string, password: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
  if (error) throw new Error("البريد الإلكتروني أو كلمة المرور غير صحيحة.");
}

export async function adminSignOut(): Promise<void> {
  if (supabase) await supabase.auth.signOut();
}

/* ───────────── الأدمن: إدارة الطلبات ───────────── */

export async function listOrders(): Promise<Order[]> {
  if (!supabase) return readJSON<Order[]>(DEMO_KEY, []);
  const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(500);
  if (error) throw new Error("تعذّر تحميل الطلبات. تأكد من أنك مسجّل كأدمن.");
  return (data ?? []) as Order[];
}

export async function setOrderStatus(id: string, status: OrderStatus, note: string): Promise<void> {
  const patch = {
    status,
    admin_note: note.trim() || null,
    reviewed_at: status === "pending" ? null : new Date().toISOString(),
  };

  if (!supabase) {
    const all = readJSON<Order[]>(DEMO_KEY, []);
    writeJSON(
      DEMO_KEY,
      all.map((o) => (o.id === id ? { ...o, ...patch } : o)),
    );
    return;
  }

  const { data, error } = await supabase.from("orders").update(patch).eq("id", id).select("id");
  if (error || !data || data.length === 0) throw new Error("لم يتم تحديث الطلب. تأكد من صلاحيات الأدمن.");
}

export async function deleteDemoOrders(): Promise<void> {
  if (!supabase) writeJSON(DEMO_KEY, []);
}

/** رابط عرض صورة الإيصال (رابط مؤقت في Supabase لأن المخزن خاص) */
export async function getReceiptUrl(order: Order): Promise<string> {
  if (!supabase) return order.receipt_path;
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(order.receipt_path, 600);
  if (error || !data) throw new Error("تعذّر تحميل صورة الإيصال.");
  return data.signedUrl;
}

export { isDemoMode };
