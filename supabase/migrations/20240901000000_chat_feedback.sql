-- Table for storing chat feedback (thumbs up/down)
create table if not exists public.chat_feedback (
  id bigserial primary key,
  chat_id uuid not null references public.chats(id) on delete cascade,
  rating smallint not null check (rating in (1,5)), -- 5 = up, 1 = down
  created_at timestamptz not null default now()
);

alter table public.chat_feedback enable row level security;

-- Allow anonymous inserts/selects (can be tightened later)
drop policy if exists "anon insert feedback" on public.chat_feedback;
create policy "anon insert feedback" on public.chat_feedback for insert to anon with check (true);

drop policy if exists "anon select feedback" on public.chat_feedback;
create policy "anon select feedback" on public.chat_feedback for select to anon using (true);
