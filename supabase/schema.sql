create extension if not exists pgcrypto;

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  phone text not null default '',
  role text not null default 'customer' check (role in ('customer', 'manager', 'staff')),
  assigned_branches text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.branches (
  name text primary key,
  city text not null default 'Kigali',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

insert into public.branches (name)
values
  ('Remera'),
  ('Kimironko'),
  ('Kacyiru'),
  ('Nyamirambo'),
  ('Gikondo'),
  ('Kanombe'),
  ('Kinyinya'),
  ('Kibagabaga'),
  ('Nyanza')
on conflict (name) do nothing;

create table if not exists public.products (
  id bigint primary key,
  name text not null,
  price numeric(12, 2) not null default 0,
  category text not null default '',
  subcategory_id bigint not null default 0,
  in_stock boolean not null default true,
  image text not null default '',
  unit text not null default 'Pcs',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.branch_inventory (
  branch_name text not null references public.branches(name) on delete cascade,
  product_id bigint not null references public.products(id) on delete cascade,
  stock integer not null default 0 check (stock >= 0),
  updated_at timestamptz not null default now(),
  primary key (branch_name, product_id)
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique default upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10)),
  customer_id uuid not null references auth.users(id) on delete cascade,
  customer_name text not null default '',
  customer_email text not null default '',
  branch_name text not null references public.branches(name),
  pickup_date date not null,
  pickup_slot text not null,
  payment_method text not null check (payment_method in ('momo', 'pay-on-pickup')),
  payment_phone text,
  customer_phone text not null default '',
  notes text,
  subtotal numeric(12, 2) not null default 0,
  total numeric(12, 2) not null default 0,
  status text not null default 'placed' check (status in ('placed', 'preparing', 'ready', 'collected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id bigint not null,
  product_name text not null,
  unit_price numeric(12, 2) not null,
  quantity integer not null check (quantity > 0),
  line_total numeric(12, 2) not null
);

create table if not exists public.branch_reviews (
  id uuid primary key default gen_random_uuid(),
  branch_name text not null references public.branches(name) on delete cascade,
  author_user_id uuid references auth.users(id) on delete set null,
  author_name text not null,
  rating integer not null check (rating between 1 and 5),
  title text not null,
  comment text not null,
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
before update on public.products
for each row execute function public.set_updated_at();

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, full_name, phone, role, assigned_branches)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name', split_part(coalesce(new.email, ''), '@', 1), 'Simba Customer'),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    'customer',
    '{}'
  )
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();

create or replace function public.current_app_role()
returns text
language sql
stable
as $$
  select coalesce((select role from public.profiles where user_id = auth.uid()), 'customer');
$$;

create or replace function public.current_assigned_branches()
returns text[]
language sql
stable
as $$
  select coalesce((select assigned_branches from public.profiles where user_id = auth.uid()), '{}');
$$;

alter table public.profiles enable row level security;
alter table public.branches enable row level security;
alter table public.products enable row level security;
alter table public.branch_inventory enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.branch_reviews enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "branches_read_all" on public.branches;
create policy "branches_read_all"
on public.branches
for select
to anon, authenticated
using (true);

drop policy if exists "products_read_all" on public.products;
create policy "products_read_all"
on public.products
for select
to anon, authenticated
using (true);

drop policy if exists "inventory_read_all" on public.branch_inventory;
create policy "inventory_read_all"
on public.branch_inventory
for select
to anon, authenticated
using (true);

drop policy if exists "inventory_manage_assigned" on public.branch_inventory;
create policy "inventory_manage_assigned"
on public.branch_inventory
for all
to authenticated
using (
  public.current_app_role() in ('manager', 'staff')
  and branch_name = any(public.current_assigned_branches())
)
with check (
  public.current_app_role() in ('manager', 'staff')
  and branch_name = any(public.current_assigned_branches())
);

drop policy if exists "orders_insert_own" on public.orders;
create policy "orders_insert_own"
on public.orders
for insert
to authenticated
with check (customer_id = auth.uid());

drop policy if exists "orders_select_own_or_assigned" on public.orders;
create policy "orders_select_own_or_assigned"
on public.orders
for select
to authenticated
using (
  customer_id = auth.uid()
  or (
    public.current_app_role() in ('manager', 'staff')
    and branch_name = any(public.current_assigned_branches())
  )
);

drop policy if exists "orders_update_assigned" on public.orders;
create policy "orders_update_assigned"
on public.orders
for update
to authenticated
using (
  public.current_app_role() in ('manager', 'staff')
  and branch_name = any(public.current_assigned_branches())
)
with check (
  public.current_app_role() in ('manager', 'staff')
  and branch_name = any(public.current_assigned_branches())
);

drop policy if exists "order_items_read_own_or_assigned" on public.order_items;
create policy "order_items_read_own_or_assigned"
on public.order_items
for select
to authenticated
using (
  exists (
    select 1
    from public.orders
    where orders.id = order_items.order_id
      and (
        orders.customer_id = auth.uid()
        or (
          public.current_app_role() in ('manager', 'staff')
          and orders.branch_name = any(public.current_assigned_branches())
        )
      )
  )
);

drop policy if exists "order_items_insert_for_own_order" on public.order_items;
create policy "order_items_insert_for_own_order"
on public.order_items
for insert
to authenticated
with check (
  exists (
    select 1
    from public.orders
    where orders.id = order_items.order_id
      and orders.customer_id = auth.uid()
  )
);

drop policy if exists "reviews_read_all" on public.branch_reviews;
create policy "reviews_read_all"
on public.branch_reviews
for select
to anon, authenticated
using (true);

drop policy if exists "reviews_insert_authenticated" on public.branch_reviews;
create policy "reviews_insert_authenticated"
on public.branch_reviews
for insert
to authenticated
with check (author_user_id = auth.uid() or author_user_id is null);
