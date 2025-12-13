-- Add service role policy for user_credits table
-- This allows webhooks and server-side operations to insert/update user credits

do $$
begin
  if not exists (
    select 1 from pg_policies 
    where policyname = 'Service role can manage all user credits'
      and schemaname = 'public'
      and tablename = 'user_credits'
  ) then
    create policy "Service role can manage all user credits" on public.user_credits
      for all
      to service_role
      using (true)
      with check (true);
  end if;
end $$;

