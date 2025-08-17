create table if not exists usage_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id),
  service text not null,
  credits_used integer not null,
  created_at timestamp with time zone default now()
); 