
-- Create chats table
CREATE TABLE IF NOT EXISTS public.chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  chat_id UUID NOT NULL REFERENCES public.chats(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security for chats
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
-- Enable Row Level Security for messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow anonymous insert access" ON public.chats;
DROP POLICY IF EXISTS "Allow anonymous read access" ON public.chats;
DROP POLICY IF EXISTS "Allow anonymous insert access" ON public.messages;
DROP POLICY IF EXISTS "Allow anonymous read access" ON public.messages;

-- Create policies for chats table
CREATE POLICY "Allow anonymous insert access" ON public.chats
  FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anonymous read access" ON public.chats
  FOR SELECT TO anon
  USING (true);

-- Create policies for messages table
CREATE POLICY "Allow anonymous insert access" ON public.messages
  FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anonymous read access" ON public.messages
  FOR SELECT TO anon
  USING (true);

    