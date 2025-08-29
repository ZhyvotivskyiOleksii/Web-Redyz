
-- Create a table for public profiles
CREATE TABLE IF NOT EXISTS chats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create a table for messages
CREATE TABLE IF NOT EXISTS messages (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  chat_id uuid REFERENCES chats(id) NOT NULL,
  role text NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Set up Row Level Security (RLS)
-- See https://supabase.com/docs/guides/auth/row-level-security
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to chats" ON chats FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert access to chats" ON chats FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access to messages" ON messages FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert access to messages" ON messages FOR INSERT WITH CHECK (true);


-- Create a bucket for chat uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('chat-uploads', 'chat-uploads', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/gif', 'application/pdf'])
ON CONFLICT (id) DO NOTHING;

-- Create policies for chat-uploads bucket
CREATE POLICY "Allow anonymous read access to chat uploads" ON storage.objects
FOR SELECT USING (bucket_id = 'chat-uploads');

CREATE POLICY "Allow anonymous insert access to chat uploads" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'chat-uploads');
