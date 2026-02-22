-- Critiqo v0.2.0 — Initial Schema

-- ============================================================
-- PROFILES
-- ============================================================
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  username text unique not null,
  avatar_url text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Anyone can read profiles"
  on public.profiles for select using (true);

create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, username, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1)),
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- CRITIQUES
-- ============================================================
create table public.critiques (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles on delete cascade,
  media_id int not null,
  media_type text not null check (media_type in ('movie', 'tv')),
  title text not null,
  poster_path text,
  release_year text,
  genres text[] not null default '{}',
  ratings jsonb not null,
  score int not null check (score >= 0 and score <= 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, media_id, media_type)
);

alter table public.critiques enable row level security;

create policy "Users can read own critiques"
  on public.critiques for select using (auth.uid() = user_id);

create policy "Users can insert own critiques"
  on public.critiques for insert with check (auth.uid() = user_id);

create policy "Users can update own critiques"
  on public.critiques for update using (auth.uid() = user_id);

create policy "Users can delete own critiques"
  on public.critiques for delete using (auth.uid() = user_id);

create index idx_critiques_user on public.critiques (user_id);
create index idx_critiques_media on public.critiques (media_id, media_type);

-- ============================================================
-- WATCHLIST
-- ============================================================
create table public.watchlist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles on delete cascade,
  media_id int not null,
  media_type text not null check (media_type in ('movie', 'tv')),
  title text not null,
  poster_path text,
  added_at timestamptz not null default now(),
  unique (user_id, media_id, media_type)
);

alter table public.watchlist enable row level security;

create policy "Users can read own watchlist"
  on public.watchlist for select using (auth.uid() = user_id);

create policy "Users can insert into own watchlist"
  on public.watchlist for insert with check (auth.uid() = user_id);

create policy "Users can delete from own watchlist"
  on public.watchlist for delete using (auth.uid() = user_id);

create index idx_watchlist_user on public.watchlist (user_id);

-- ============================================================
-- UNINTERESTED
-- ============================================================
create table public.uninterested (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles on delete cascade,
  media_id int not null,
  media_type text not null check (media_type in ('movie', 'tv')),
  created_at timestamptz not null default now(),
  unique (user_id, media_id, media_type)
);

alter table public.uninterested enable row level security;

create policy "Users can read own uninterested"
  on public.uninterested for select using (auth.uid() = user_id);

create policy "Users can insert into own uninterested"
  on public.uninterested for insert with check (auth.uid() = user_id);

create policy "Users can delete from own uninterested"
  on public.uninterested for delete using (auth.uid() = user_id);

create index idx_uninterested_user on public.uninterested (user_id);

-- ============================================================
-- REVIEWS
-- ============================================================
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles on delete cascade,
  media_id int not null,
  media_type text not null check (media_type in ('movie', 'tv')),
  content text not null,
  sentiment text not null check (sentiment in ('positive', 'neutral', 'negative')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, media_id, media_type)
);

alter table public.reviews enable row level security;

create policy "Anyone can read reviews"
  on public.reviews for select using (true);

create policy "Users can insert own reviews"
  on public.reviews for insert with check (auth.uid() = user_id);

create policy "Users can update own reviews"
  on public.reviews for update using (auth.uid() = user_id);

create policy "Users can delete own reviews"
  on public.reviews for delete using (auth.uid() = user_id);

create index idx_reviews_media on public.reviews (media_id, media_type);
create index idx_reviews_user on public.reviews (user_id);

-- ============================================================
-- REVIEW VOTES
-- ============================================================
create table public.review_votes (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null references public.reviews on delete cascade,
  user_id uuid not null references public.profiles on delete cascade,
  vote smallint not null check (vote in (1, -1)),
  created_at timestamptz not null default now(),
  unique (review_id, user_id)
);

alter table public.review_votes enable row level security;

create policy "Anyone authenticated can read votes"
  on public.review_votes for select using (auth.uid() is not null);

create policy "Users can insert own votes"
  on public.review_votes for insert with check (auth.uid() = user_id);

create policy "Users can update own votes"
  on public.review_votes for update using (auth.uid() = user_id);

create policy "Users can delete own votes"
  on public.review_votes for delete using (auth.uid() = user_id);

create index idx_review_votes_review on public.review_votes (review_id);
create index idx_review_votes_user on public.review_votes (user_id);
