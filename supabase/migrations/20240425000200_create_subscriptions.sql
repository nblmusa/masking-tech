create table if not exists subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) unique,
  plan_id text not null,
  credits_per_month integer not null,
  renewal_date date,
  status text not null,
  stripe_subscription_id text,
  updated_at timestamp with time zone default now()
); 