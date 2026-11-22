-- ═══════════════════════════════════════════════════════════════
--  مخطط قاعدة البيانات: الطلبات والإيصالات ولوحة الأدمن
--  الصقه كاملاً في: Supabase → SQL Editor → New query → Run
-- ═══════════════════════════════════════════════════════════════

-- ───── جدول الطلبات ─────
create table if not exists public.orders (
  id             uuid primary key,
  code           text not null unique,
  customer_name  text not null check (char_length(customer_name) between 2 and 100),
  phone          text not null check (char_length(phone) between 8 and 20),
  email          text check (email is null or char_length(email) <= 150),
  method         text not null check (method in ('vodafone_cash', 'instapay')),
  sender_ref     text check (sender_ref is null or char_length(sender_ref) <= 100),
  items          jsonb not null check (jsonb_typeof(items) = 'array' and jsonb_array_length(items) between 1 and 20),
  total_egp      integer not null check (total_egp > 0),
  receipt_path   text not null,
  status         text not null default 'pending' check (status in ('pending', 'confirmed', 'rejected')),
  admin_note     text check (admin_note is null or char_length(admin_note) <= 500),
  created_at     timestamptz not null default now(),
  reviewed_at    timestamptz
);

create index if not exists orders_status_created_idx on public.orders (status, created_at desc);

-- ───── جدول الأدمن: من يوجد هنا يستطيع إدارة الطلبات ─────
create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade
);

-- دالة تتحقق هل المستخدم الحالي أدمن (security definer كي لا تحتاج سياسة على جدول admins)
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

grant execute on function public.is_admin() to anon, authenticated;

-- ───── الأمان (RLS) ─────
alter table public.orders enable row level security;
alter table public.admins enable row level security;
-- admins: لا توجد سياسات عمداً، فلا أحد يقرؤه أو يعدّله من الموقع.

-- أي زائر يستطيع إنشاء طلب جديد بحالة "قيد المراجعة" فقط (لا يستطيع قراءة أي طلب)
drop policy if exists "anyone can create a pending order" on public.orders;
create policy "anyone can create a pending order"
  on public.orders for insert
  to anon, authenticated
  with check (status = 'pending' and admin_note is null and reviewed_at is null);

-- الأدمن فقط يقرأ ويعدّل
drop policy if exists "admins can read orders" on public.orders;
create policy "admins can read orders"
  on public.orders for select
  to authenticated
  using (public.is_admin());

drop policy if exists "admins can update orders" on public.orders;
create policy "admins can update orders"
  on public.orders for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "admins can delete orders" on public.orders;
create policy "admins can delete orders"
  on public.orders for delete
  to authenticated
  using (public.is_admin());

-- ───── مخزن صور الإيصالات (خاص، صور فقط، حتى 5 ميجابايت) ─────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('receipts', 'receipts', false, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = false,
      file_size_limit = 5242880,
      allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];

drop policy if exists "anyone can upload a receipt" on storage.objects;
create policy "anyone can upload a receipt"
  on storage.objects for insert
  to anon, authenticated
  with check (bucket_id = 'receipts');

drop policy if exists "admins can view receipts" on storage.objects;
create policy "admins can view receipts"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'receipts' and public.is_admin());

drop policy if exists "admins can delete receipts" on storage.objects;
create policy "admins can delete receipts"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'receipts' and public.is_admin());

-- ═══════════════════════════════════════════════════════════════
--  بعد التشغيل: أنشئ حساب الأدمن ثم فعّله
--  1) Supabase → Authentication → Users → Add user (بريدك وكلمة سر قوية)
--  2) شغّل هذا الاستعلام مع بريدك:
--
--     insert into public.admins (user_id)
--     select id from auth.users where email = 'your-email@example.com';
--
--  3) من Authentication → Providers → Email: عطّل "Allow new users to sign up"
--     حتى لا يستطيع أحد إنشاء حساب غيرك.
-- ═══════════════════════════════════════════════════════════════
