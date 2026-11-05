-- Cafe Menu: public read, ONLY the admin e-mail can write.
-- 1) Create the admin user in Dashboard > Authentication > Users first.
-- 2) Replace admin@example.com below with that exact e-mail BEFORE running this file
--    (it must equal VITE_SUPABASE_ADMIN_EMAIL). If you forget, nobody can write (fails closed).
-- 3) Also turn OFF "Allow new users to sign up" in Authentication > Sign In / Providers.
--    The anon key is public, so any signed-up user would otherwise count as "authenticated".

create or replace function public.is_cafe_admin()
returns boolean
language sql
stable
as $$
  select lower(coalesce(auth.jwt() ->> 'email', '')) = lower('admin@example.com');
$$;

create table if not exists public.menu_doc (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.cafe_doc (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.menu_doc enable row level security;
alter table public.cafe_doc enable row level security;

grant select on public.menu_doc to anon, authenticated;
grant insert, update, delete on public.menu_doc to authenticated;
grant select on public.cafe_doc to anon, authenticated;
grant insert, update, delete on public.cafe_doc to authenticated;

drop policy if exists "menu is readable by visitors" on public.menu_doc;
create policy "menu is readable by visitors"
  on public.menu_doc for select to anon, authenticated using (true);
drop policy if exists "admins manage menu" on public.menu_doc;
create policy "admins manage menu"
  on public.menu_doc for all to authenticated
  using (public.is_cafe_admin()) with check (public.is_cafe_admin());

drop policy if exists "cafe profile is readable by visitors" on public.cafe_doc;
create policy "cafe profile is readable by visitors"
  on public.cafe_doc for select to anon, authenticated using (true);
drop policy if exists "admins manage cafe profile" on public.cafe_doc;
create policy "admins manage cafe profile"
  on public.cafe_doc for all to authenticated
  using (public.is_cafe_admin()) with check (public.is_cafe_admin());

-- Enable live updates for the visitor menu and cafe profile.
do $$
begin
  alter publication supabase_realtime add table public.menu_doc;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.cafe_doc;
exception when duplicate_object then null;
end $$;
