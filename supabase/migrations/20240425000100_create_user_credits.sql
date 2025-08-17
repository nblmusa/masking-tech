create table if not exists user_credits (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) unique,
  credits_balance integer not null default 0,
  updated_at timestamp with time zone default now()
); 