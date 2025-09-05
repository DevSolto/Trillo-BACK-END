-- Creates an idempotent trigger to sync Supabase Auth users to public.user
-- Behavior:
--  - On INSERT into auth.users: upsert into public."user" with id=new.id, email=new.email,
--    name from raw_user_meta_data->>'name' (or ''), role default 'editor'.
--  - On UPDATE of email in auth.users: updates public."user" email accordingly.
-- Notes:
--  - Requires that public."user" exists with columns (id uuid PK, email unique, name text/varchar, role enum).
--  - SECURITY DEFINER lets this function write regardless of RLS on public."user".

create or replace function public.handle_auth_user_upsert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Upsert the profile row
  insert into public."user" (id, email, name, role)
  values (
    new.id,
    new.email,
    coalesce((new.raw_user_meta_data->>'name'), ''),
    'editor'
  )
  on conflict (id) do update set
    email = excluded.email;

  return new;
end;
$$;

-- Drop and recreate a single trigger that handles INSERT and email UPDATEs
drop trigger if exists on_auth_user_upsert on auth.users;
create trigger on_auth_user_upsert
after insert or update of email on auth.users
for each row execute procedure public.handle_auth_user_upsert();

