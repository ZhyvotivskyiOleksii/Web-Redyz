-- Add optional name column to leads
alter table public.leads
  add column if not exists name text;

-- Optional index for searching by name (not unique)
create index if not exists leads_name_idx on public.leads((lower(name)));

