import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null = null;

// Ініціалізує єдиний інстанс Supabase клієнта.
// На сервері вимикаємо збереження сесій/refresh токенів (щоб не лізти в localStorage).
export function getSupabaseClient() {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error('Supabase env vars are missing: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }

  const isServer = typeof window === 'undefined';

  // На сервері: вимикаємо persistSession/autoRefreshToken, щоб уникнути проблем із server actions.
  // У браузері: стандартні налаштування для Realtime.
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
