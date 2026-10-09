create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'user' check (role in ('user', 'admin')),
  email text
);

alter table public.profiles add column if not exists email text;

create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null check (type in ('sale', 'rent')),
  price numeric(12, 2) not null check (price >= 0),
  stock integer check (stock >= 0),
  status text check (status in ('available', 'rented')),
  image_url text,
  constraint items_type_inventory_check check (
    (type = 'sale' and stock is not null and status is null)
    or (type = 'rent' and stock is null and status is not null)
  ),
  constraint items_name_key unique (name)
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id),
  total numeric(12, 2) not null check (total >= 0),
  status text not null default 'pending' check (status in ('pending', 'paid')),
  created_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  item_id uuid not null references public.items(id),
  qty integer not null check (qty > 0),
  price numeric(12, 2) not null check (price >= 0)
);

create table if not exists public.courts (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  price_per_hour numeric(12, 2) not null check (price_per_hour >= 0),
  is_active boolean not null default true
);

create table if not exists public.court_settings (
  id boolean primary key default true check (id),
  open_time time not null default '08:00',
  close_time time not null default '22:00',
  constraint court_settings_hours_check check (open_time < close_time)
);

create table if not exists public.court_bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id),
  court_id uuid not null references public.courts(id),
  booking_date date not null,
  start_time time not null,
  end_time time not null,
  price numeric(12, 2) not null check (price >= 0),
  status text not null default 'booked' check (status in ('booked', 'cancelled')),
  created_at timestamptz not null default now(),
  constraint court_bookings_one_hour_check check (
    end_time = start_time + interval '1 hour'
  )
);

create unique index if not exists court_bookings_active_slot_key
  on public.court_bookings (court_id, booking_date, start_time)
  where status = 'booked';

insert into public.court_settings (id, open_time, close_time)
values (true, '08:00', '22:00')
on conflict (id) do nothing;

create or replace function public.create_profile_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, role, email)
  values (new.id, 'user', new.email)
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

insert into public.profiles (id, role, email)
select id, 'user', email
from auth.users
on conflict (id) do update set email = excluded.email;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.create_profile_for_new_user();

alter table public.profiles enable row level security;
alter table public.items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.courts enable row level security;
alter table public.court_settings enable row level security;
alter table public.court_bookings enable row level security;

drop policy if exists "Users and admins can read profiles" on public.profiles;
create policy "Users and admins can read profiles"
  on public.profiles for select to authenticated
  using (
    id = (select auth.uid())
    or (select public.is_admin())
  );

drop policy if exists "Anyone can read items" on public.items;
create policy "Anyone can read items"
  on public.items for select to anon, authenticated
  using (true);

drop policy if exists "Admins can manage items" on public.items;
create policy "Admins can manage items"
  on public.items for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists "Users can read own orders and admins can read all" on public.orders;
create policy "Users can read own orders and admins can read all"
  on public.orders for select to authenticated
  using (
    user_id = (select auth.uid())
    or (select public.is_admin())
  );

drop policy if exists "Users can create own pending orders" on public.orders;
create policy "Users can create own pending orders"
  on public.orders for insert to authenticated
  with check (user_id = (select auth.uid()) and status = 'pending');

drop policy if exists "Admins can manage orders" on public.orders;
create policy "Admins can manage orders"
  on public.orders for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists "Users can read their order items and admins can read all" on public.order_items;
create policy "Users can read their order items and admins can read all"
  on public.order_items for select to authenticated
  using (
    exists (
      select 1 from public.orders
      where id = order_id
        and (
          user_id = (select auth.uid())
          or (select public.is_admin())
        )
    )
  );

drop policy if exists "Users can add items to own pending orders" on public.order_items;
create policy "Users can add items to own pending orders"
  on public.order_items for insert to authenticated
  with check (
    exists (
      select 1 from public.orders
      where id = order_id
        and user_id = (select auth.uid())
        and status = 'pending'
    )
  );

drop policy if exists "Admins can manage order items" on public.order_items;
create policy "Admins can manage order items"
  on public.order_items for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists "Anyone can read active courts" on public.courts;
create policy "Anyone can read active courts"
  on public.courts for select to anon, authenticated
  using (is_active or (select public.is_admin()));

drop policy if exists "Admins can manage courts" on public.courts;
create policy "Admins can manage courts"
  on public.courts for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists "Anyone can read court settings" on public.court_settings;
create policy "Anyone can read court settings"
  on public.court_settings for select to anon, authenticated
  using (true);

drop policy if exists "Admins can manage court settings" on public.court_settings;
create policy "Admins can manage court settings"
  on public.court_settings for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists "Users can read own bookings and admins can read all" on public.court_bookings;
create policy "Users can read own bookings and admins can read all"
  on public.court_bookings for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));

create or replace function public.book_court(
  p_court_id uuid,
  p_booking_date date,
  p_start_time time
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_court public.courts%rowtype;
  v_settings public.court_settings%rowtype;
  v_booking_id uuid;
  v_today date := (now() at time zone 'Asia/Jakarta')::date;
  v_end_time time;
begin
  if v_user_id is null then
    raise exception 'Silakan masuk untuk memesan lapangan.';
  end if;

  if p_booking_date is null
    or p_booking_date < v_today
    or p_booking_date > v_today + 7 then
    raise exception 'Tanggal booking harus dalam 7 hari ke depan.';
  end if;

  if p_start_time is null
    or extract(minute from p_start_time) <> 0
    or extract(second from p_start_time) <> 0 then
    raise exception 'Pilih slot mulai pada jam penuh.';
  end if;
  v_end_time := p_start_time + interval '1 hour';

  select * into v_court
  from public.courts
  where id = p_court_id and is_active
  for update;

  if not found then
    raise exception 'Lapangan tidak tersedia.';
  end if;

  select * into v_settings
  from public.court_settings
  where id = true;

  if not found
    or p_start_time < v_settings.open_time
    or v_end_time > v_settings.close_time then
    raise exception 'Slot berada di luar jam operasional.';
  end if;

  if exists (
    select 1 from public.court_bookings
    where court_id = p_court_id
      and booking_date = p_booking_date
      and start_time = p_start_time
      and status = 'booked'
  ) then
    raise exception 'Slot ini sudah dibooking. Silakan pilih jadwal lain.';
  end if;

  insert into public.court_bookings (
    user_id, court_id, booking_date, start_time, end_time, price, status
  )
  values (
    v_user_id, p_court_id, p_booking_date, p_start_time,
    v_end_time, v_court.price_per_hour, 'booked'
  )
  returning id into v_booking_id;

  return v_booking_id;
end;
$$;

revoke all on function public.book_court(uuid, date, time) from public, anon;
grant execute on function public.book_court(uuid, date, time) to authenticated;

create or replace function public.create_checkout_order(p_items jsonb)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_order_id uuid;
  v_line record;
  v_item public.items%rowtype;
  v_total numeric(12, 2) := 0;
begin
  if v_user_id is null then
    raise exception 'Silakan masuk sebelum checkout.';
  end if;

  if p_items is null
    or jsonb_typeof(p_items) is distinct from 'array'
    or jsonb_array_length(p_items) = 0
    or jsonb_array_length(p_items) > 50 then
    raise exception 'Keranjang kosong atau tidak valid.';
  end if;

  if exists (
    select 1 from jsonb_array_elements(p_items) as line(value)
    where jsonb_typeof(line.value) is distinct from 'object'
      or not (line.value ? 'id')
      or not (line.value ? 'qty')
  ) then
    raise exception 'Item keranjang tidak valid.';
  end if;

  if (
    select count(distinct (line.value->>'id')::uuid)
    from jsonb_array_elements(p_items) as line(value)
  ) <> jsonb_array_length(p_items) then
    raise exception 'Item keranjang duplikat.';
  end if;

  for v_line in
    select (line.value->>'id')::uuid as item_id,
      (line.value->>'qty')::integer as qty
    from jsonb_array_elements(p_items) as line(value)
    order by line.value->>'id'
  loop
    if v_line.qty < 1 or v_line.qty > 50 then
      raise exception 'Jumlah item tidak valid.';
    end if;

    select * into v_item
    from public.items
    where id = v_line.item_id
    for update;

    if not found then
      raise exception 'Item tidak ditemukan.';
    end if;

    if v_item.type = 'sale' then
      update public.items
      set stock = stock - v_line.qty
      where id = v_item.id and stock >= v_line.qty;

      if not found then
        raise exception 'Stok % tidak mencukupi.', v_item.name;
      end if;
    else
      if v_line.qty <> 1 or v_item.status <> 'available' then
        raise exception 'Item sewa % sudah tidak tersedia.', v_item.name;
      end if;

      update public.items
      set status = 'rented'
      where id = v_item.id and status = 'available';

      if not found then
        raise exception 'Item sewa % sudah tidak tersedia.', v_item.name;
      end if;
    end if;

    v_total := v_total + (v_item.price * v_line.qty);
  end loop;

  insert into public.orders (user_id, total, status)
  values (v_user_id, v_total, 'pending')
  returning id into v_order_id;

  insert into public.order_items (order_id, item_id, qty, price)
  select v_order_id, item.id, (line.value->>'qty')::integer, item.price
  from jsonb_array_elements(p_items) as line(value)
  join public.items as item on item.id = (line.value->>'id')::uuid;

  return v_order_id;
end;
$$;

create or replace function public.pay_order(p_order_id uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if auth.uid() is null then
    raise exception 'Silakan masuk untuk membayar pesanan.';
  end if;

  update public.orders
  set status = 'paid'
  where id = p_order_id
    and user_id = auth.uid()
    and status = 'pending';

  if not found then
    raise exception 'Pesanan tidak ditemukan atau sudah dibayar.';
  end if;
end;
$$;

revoke all on function public.create_checkout_order(jsonb) from public, anon;
grant execute on function public.create_checkout_order(jsonb) to authenticated;
revoke all on function public.pay_order(uuid) from public, anon;
grant execute on function public.pay_order(uuid) to authenticated;

insert into public.items (name, type, price, stock, status, image_url)
values
  ('Raket Nox AT10 Genius', 'sale', 3499000, 8, null, 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&w=900&q=80'),
  ('Raket Bullpadel Vertex 04', 'sale', 4299000, 5, null, 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&w=900&q=80'),
  ('Raket Adidas Metalbone', 'sale', 3899000, 6, null, 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&w=900&q=80'),
  ('Bola Head Padel Pro S', 'sale', 189000, 24, null, 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&w=900&q=80'),
  ('Tas Padel Wilson Bela', 'sale', 1599000, 9, null, 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&w=900&q=80'),
  ('Raket Nox ML10 Pro Cup', 'rent', 150000, null, 'available', 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&w=900&q=80'),
  ('Raket Bullpadel Hack 03', 'rent', 175000, null, 'available', 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&w=900&q=80'),
  ('Raket Adidas Adipower', 'rent', 160000, null, 'rented', 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&w=900&q=80'),
  ('Raket Head Speed Motion', 'rent', 140000, null, 'available', 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&w=900&q=80'),
  ('Raket Siux Electra ST3', 'rent', 155000, null, 'available', 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&w=900&q=80')
on conflict (name) do nothing;
