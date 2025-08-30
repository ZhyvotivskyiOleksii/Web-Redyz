-- Leads table to capture contacts from chat
create table if not exists public.leads (
  id bigserial primary key,
  chat_id uuid not null references public.chats(id) on delete cascade,
  email text,
  phone text,
  locale text default 'ua',
  first_message text,
  consent boolean default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint leads_email_or_phone check (coalesce(email, '') <> '' or coalesce(phone, '') <> '')
);

create unique index if not exists leads_chat_id_key on public.leads(chat_id);
create index if not exists leads_email_idx on public.leads(email);
create index if not exists leads_phone_idx on public.leads(phone);

alter table public.leads enable row level security;

-- Basic policies for anon (can be tightened later)
drop policy if exists "anon select leads" on public.leads;
create policy "anon select leads" on public.leads for select to anon using (true);

drop policy if exists "anon insert leads" on public.leads;
create policy "anon insert leads" on public.leads for insert to anon with check (true);

drop policy if exists "anon update leads" on public.leads;
create policy "anon update leads" on public.leads for update to anon using (true) with check (true);

-- Trigger to keep updated_at fresh
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists leads_set_updated_at on public.leads;
create trigger leads_set_updated_at before update on public.leads
for each row execute function public.set_updated_at();

