create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.saved_papers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  article_id text not null,
  article_payload jsonb not null default '{}'::jsonb,
  title text not null,
  authors text[] not null default '{}',
  year int,
  journal text,
  article_url text not null,
  citation_apa text not null,
  citation_mla text not null,
  why_relevant text not null,
  summary text not null,
  difficulty text not null,
  tags text[] not null default '{}',
  created_at timestamptz not null default timezone('utc', now()),
  unique (user_id, article_id)
);

alter table public.saved_papers
add column if not exists article_payload jsonb not null default '{}'::jsonb;

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  saved_paper_id uuid not null unique references public.saved_papers(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do update
  set email = excluded.email,
      full_name = coalesce(excluded.full_name, public.users.full_name),
      avatar_url = coalesce(excluded.avatar_url, public.users.avatar_url);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists notes_set_updated_at on public.notes;
create trigger notes_set_updated_at
before update on public.notes
for each row execute procedure public.set_updated_at();

alter table public.users enable row level security;
alter table public.saved_papers enable row level security;
alter table public.notes enable row level security;

create policy "Users can view own profile"
on public.users
for select
using (auth.uid() = id);

create policy "Users can update own profile"
on public.users
for update
using (auth.uid() = id);

create policy "Users can insert own profile"
on public.users
for insert
with check (auth.uid() = id);

create policy "Users can manage own saved papers"
on public.saved_papers
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can manage own notes"
on public.notes
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
