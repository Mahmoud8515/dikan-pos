-- ============================================================
--  Hesabên Dikanê  —  Barbershop POS  —  Supabase schema
--  لصق هذا كله مرة واحدة في:  Supabase  →  SQL Editor  →  New query  →  Run
--  آمن لإعادة التشغيل (idempotent): يمكن تشغيله أكثر من مرة بلا أخطاء
-- ============================================================

-- ----------  1) جدول المحل (shop) — صف واحد لكل صاحب حساب  ----------
create table if not exists public.shops (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null references auth.users(id) on delete cascade,
  name        text not null default 'Dikan',
  currency    text not null default 'USD',   -- USD / EUR / TRY / IQD ...
  created_at  timestamptz not null default now(),
  unique (owner_id)                          -- حساب واحد = محل واحد
);

-- ----------  2) العمّال (workers)  ----------
create table if not exists public.workers (
  id          uuid primary key default gen_random_uuid(),
  shop_id     uuid not null references public.shops(id) on delete cascade,
  name        text not null,
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);
create index if not exists workers_shop_idx on public.workers(shop_id);

-- ----------  3) الخدمات (services)  ----------
create table if not exists public.services (
  id          uuid primary key default gen_random_uuid(),
  shop_id     uuid not null references public.shops(id) on delete cascade,
  name_kmr    text not null,
  name_ckb    text not null,
  price       numeric(10,2) not null default 0,
  sort_order  int not null default 0,
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);
create index if not exists services_shop_idx on public.services(shop_id);

-- ----------  4) المبيعات (sales) — كل عملية دفع  ----------
create table if not exists public.sales (
  id          uuid primary key default gen_random_uuid(),
  shop_id     uuid not null references public.shops(id) on delete cascade,
  worker_id   uuid references public.workers(id) on delete set null,
  items       jsonb not null default '[]'::jsonb,  -- [{serviceId,name,price,qty}]
  subtotal    numeric(10,2) not null default 0,
  tip         numeric(10,2) not null default 0,
  sold_at     date not null default current_date,
  created_at  timestamptz not null default now()
);
create index if not exists sales_shop_idx   on public.sales(shop_id);
create index if not exists sales_date_idx    on public.sales(shop_id, sold_at);
create index if not exists sales_worker_idx  on public.sales(worker_id);

-- ----------  5) البخشيش اليدوي (tips) — الإدخال من صفحة البخشيش  ----------
create table if not exists public.tips (
  id          uuid primary key default gen_random_uuid(),
  shop_id     uuid not null references public.shops(id) on delete cascade,
  worker_id   uuid not null references public.workers(id) on delete cascade,
  amount      numeric(10,2) not null default 0,
  from_sale   boolean not null default false,     -- true لو جاي من الكاشير
  tip_date    date not null default current_date,
  created_at  timestamptz not null default now()
);
create index if not exists tips_shop_idx   on public.tips(shop_id);
create index if not exists tips_worker_idx on public.tips(worker_id);

-- ============================================================
--  دالة مساعدة: ترجع shop_id للمستخدم الحالي (security definer للأداء)
-- ============================================================
create or replace function public.current_shop_id()
returns uuid
language sql
security definer
set search_path = public
stable
as $$
  select id from public.shops where owner_id = auth.uid() limit 1;
$$;

-- ============================================================
--  تفعيل RLS على كل الجداول
-- ============================================================
alter table public.shops    enable row level security;
alter table public.workers  enable row level security;
alter table public.services enable row level security;
alter table public.sales    enable row level security;
alter table public.tips     enable row level security;

-- ----------  سياسات جدول shops  ----------
drop policy if exists shops_select on public.shops;
create policy shops_select on public.shops for select to authenticated
  using ( (select auth.uid()) = owner_id );

drop policy if exists shops_insert on public.shops;
create policy shops_insert on public.shops for insert to authenticated
  with check ( (select auth.uid()) = owner_id );

drop policy if exists shops_update on public.shops;
create policy shops_update on public.shops for update to authenticated
  using ( (select auth.uid()) = owner_id )
  with check ( (select auth.uid()) = owner_id );

drop policy if exists shops_delete on public.shops;
create policy shops_delete on public.shops for delete to authenticated
  using ( (select auth.uid()) = owner_id );

-- ----------  سياسات عامة لباقي الجداول (تعتمد على current_shop_id)  ----------
-- workers
drop policy if exists workers_all on public.workers;
create policy workers_all on public.workers for all to authenticated
  using ( shop_id = (select public.current_shop_id()) )
  with check ( shop_id = (select public.current_shop_id()) );

-- services
drop policy if exists services_all on public.services;
create policy services_all on public.services for all to authenticated
  using ( shop_id = (select public.current_shop_id()) )
  with check ( shop_id = (select public.current_shop_id()) );

-- sales
drop policy if exists sales_all on public.sales;
create policy sales_all on public.sales for all to authenticated
  using ( shop_id = (select public.current_shop_id()) )
  with check ( shop_id = (select public.current_shop_id()) );

-- tips
drop policy if exists tips_all on public.tips;
create policy tips_all on public.tips for all to authenticated
  using ( shop_id = (select public.current_shop_id()) )
  with check ( shop_id = (select public.current_shop_id()) );

-- ============================================================
--  Trigger: عند تسجيل مستخدم جديد، أنشئ محل تلقائياً مع خدمات افتراضية
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_shop_id uuid;
begin
  insert into public.shops (owner_id, name)
  values (new.id, 'Dikan')
  returning id into new_shop_id;

  insert into public.services (shop_id, name_kmr, name_ckb, price, sort_order) values
    (new_shop_id, 'Skin Fade',      'Skin Fade',     15, 1),
    (new_shop_id, 'Por (Normal)',   'Qij (Asayî)',   12, 2),
    (new_shop_id, 'Rî (Beard)',     'Rîş (Beard)',    7, 3),
    (new_shop_id, 'Por + Rî',       'Qij + Rîş',     18, 4);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
--  تم. الآن كل صاحب حساب يرى بيانات محله فقط.
-- ============================================================
