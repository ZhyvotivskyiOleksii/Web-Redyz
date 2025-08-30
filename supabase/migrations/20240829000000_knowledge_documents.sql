-- Knowledge documents to extend AI context (optional RAG-lite)
create table if not exists public.knowledge_documents (
  id bigserial primary key,
  locale text not null default 'ua',
  title text not null,
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.knowledge_documents enable row level security;

-- Allow public read (anon) and admin insert/update via service key if needed
drop policy if exists "Allow anonymous select" on public.knowledge_documents;
create policy "Allow anonymous select" on public.knowledge_documents
  for select to anon
  using (true);

-- If you want to allow anon inserts (optional), uncomment:
-- drop policy if exists "Allow anonymous insert" on public.knowledge_documents;
-- create policy "Allow anonymous insert" on public.knowledge_documents
--   for insert to anon
--   with check (true);

-- Helpful index for locale and updated sorting
create index if not exists knowledge_documents_locale_updated_idx
  on public.knowledge_documents (locale, updated_at desc);

