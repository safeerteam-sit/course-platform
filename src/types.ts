export type CategoryId = "ai" | "marketing" | "business";

export type CoverIcon = "sparkles" | "megaphone" | "video" | "search" | "briefcase";

export interface Unit {
  title: string;
  lessons: string[];
}

export interface Course {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  /** فقرات الوصف التفصيلي */
  longDescription: string[];
  category: CategoryId;
  /** السعر بالجنيه المصري (العملة الأساسية) */
  price: number;
  oldPrice?: number;
  duration: string;
  level: string;
  featured?: boolean;
  /** مميزات تظهر على البطاقة */
  features: string[];
  /** ما سيتعلمه المتدرب */
  outcomes: string[];
  curriculum: Unit[];
  theme: { from: string; to: string; icon: CoverIcon };
}

export interface Currency {
  code: string;
  label: string;
  symbol: string;
  /** سعر التحويل من الجنيه المصري */
  rate: number;
}

export interface Testimonial {
  name: string;
  role: string;
  text: string;
  rating: number;
}

/* ───────────── الطلبات والدفع ───────────── */

export type PaymentMethod = "vodafone_cash" | "instapay";
export type OrderStatus = "pending" | "confirmed" | "rejected";

/** لقطة من الكورس وقت الطلب (حتى لا يتأثر الطلب بتغيّر السعر لاحقاً) */
export interface OrderItem {
  id: string;
  title: string;
  /** بالجنيه المصري */
  price: number;
}

export interface Order {
  id: string;
  /** رمز الطلب الذي يراه العميل، مثل ORD-7K3F9Q */
  code: string;
  customer_name: string;
  phone: string;
  email: string | null;
  method: PaymentMethod;
  /** رقم المحوِّل أو مرجع العملية (اختياري) */
  sender_ref: string | null;
  items: OrderItem[];
  total_egp: number;
  /** مسار الإيصال في التخزين */
  receipt_path: string;
  status: OrderStatus;
  admin_note: string | null;
  created_at: string;
  reviewed_at: string | null;
}

export interface NewOrderInput {
  customer_name: string;
  phone: string;
  email: string;
  method: PaymentMethod;
  sender_ref: string;
  items: OrderItem[];
  total_egp: number;
}
