-- Ensure user_credits table exists with unique user_id and timestamps
create table if not exists public.user_credits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  credits_balance integer not null default 0,
  updated_at timestamptz default now()
);

-- Ensure usage_records table exists
create table if not exists public.usage_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  service text not null,
  credits_used integer not null,
  created_at timestamptz default now()
);

-- Ensure column exists in case usage_records pre-existed
alter table public.usage_records
  add column if not exists credits_used integer;
alter table public.usage_records
  add column if not exists service text;
-- Month-year partitioning column (text 'YYYY-MM')
alter table public.usage_records
  add column if not exists month_year text;
-- Backfill default for existing rows if needed
update public.usage_records set credits_used = coalesce(credits_used, 1) where credits_used is null;
update public.usage_records set service = coalesce(service, 'api') where service is null;
update public.usage_records set month_year = coalesce(month_year, to_char(now(), 'YYYY-MM')) where month_year is null;
alter table public.usage_records alter column credits_used set not null;
alter table public.usage_records alter column service set not null;
alter table public.usage_records alter column month_year set not null;

-- Enable RLS
alter table public.user_credits enable row level security;
alter table public.usage_records enable row level security;

-- Policies: users can view their own rows
do $$
begin
  if not exists (
    select 1 from pg_policies 
    where policyname = 'Users can view own credits'
      and schemaname = 'public'
      and tablename = 'user_credits'
  ) then
    create policy "Users can view own credits" on public.user_credits
      for select to authenticated using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies 
    where policyname = 'Users can view own usage records'
      and schemaname = 'public'
      and tablename = 'usage_records'
  ) then
    create policy "Users can view own usage records" on public.usage_records
      for select to authenticated using (auth.uid() = user_id);
  end if;
end $$;

-- Indexes
create index if not exists idx_user_credits_user_id on public.user_credits(user_id);
create index if not exists idx_usage_records_user_id on public.usage_records(user_id);
create index if not exists idx_usage_records_created_at on public.usage_records(created_at desc);


