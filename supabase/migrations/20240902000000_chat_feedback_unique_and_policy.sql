-- Ensure one feedback per chat and allow update for upsert
-- 1) Deduplicate existing rows: keep the newest per chat_id
--    (this makes it possible to add a UNIQUE constraint on chat_id)
delete from public.chat_feedback a
using public.chat_feedback b
where a.chat_id = b.chat_id and a.id < b.id;

-- 2) Add UNIQUE constraint (idempotent)
do $$ begin
  alter table public.chat_feedback add constraint chat_feedback_chat_id_unique unique (chat_id);
exception when duplicate_object then null; end $$;

-- RLS: allow anonymous update (required for upsert)
drop policy if exists "anon update feedback" on public.chat_feedback;
create policy "anon update feedback" on public.chat_feedback for update to anon using (true) with check (true);
