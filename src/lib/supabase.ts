import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null = null;

export function getSupabaseClient() {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error('Supabase env vars are missing: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }

  const isServer = typeof window === 'undefined';

  // On the server, disable session persistence and token refresh to avoid
  // accessing localStorage and leaking state across users. In the browser,
  // default behavior is fine for realtime subscriptions.
  client = createClient(url, anonKey, {
    auth: isServer
      ? {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        }
      : undefined,
  });
  return client;
}
