alter table public.profiles
add column if not exists is_private boolean not null default false;

create table if not exists public.custom_lists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, name)
);

alter table public.custom_lists enable row level security;

create policy "Users can read own custom lists"
  on public.custom_lists for select using (auth.uid() = user_id);

create policy "Users can insert own custom lists"
  on public.custom_lists for insert with check (auth.uid() = user_id);

create policy "Users can update own custom lists"
  on public.custom_lists for update using (auth.uid() = user_id);

create policy "Users can delete own custom lists"
  on public.custom_lists for delete using (auth.uid() = user_id);

create index if not exists idx_custom_lists_user on public.custom_lists (user_id);

create table if not exists public.custom_list_items (
  id uuid primary key default gen_random_uuid(),
  list_id uuid not null references public.custom_lists on delete cascade,
  media_id int not null,
  media_type text not null check (media_type in ('movie', 'tv')),
  title text not null,
  poster_path text,
  added_at timestamptz not null default now(),
  unique (list_id, media_id, media_type)
);

alter table public.custom_list_items enable row level security;

create policy "Users can read own custom list items"
  on public.custom_list_items for select using (
    exists (
      select 1 from public.custom_lists cl
      where cl.id = custom_list_items.list_id
        and cl.user_id = auth.uid()
    )
  );

create policy "Users can insert own custom list items"
  on public.custom_list_items for insert with check (
    exists (
      select 1 from public.custom_lists cl
      where cl.id = custom_list_items.list_id
        and cl.user_id = auth.uid()
    )
  );

create policy "Users can delete own custom list items"
  on public.custom_list_items for delete using (
    exists (
      select 1 from public.custom_lists cl
      where cl.id = custom_list_items.list_id
        and cl.user_id = auth.uid()
    )
  );

create index if not exists idx_custom_list_items_list on public.custom_list_items (list_id);
