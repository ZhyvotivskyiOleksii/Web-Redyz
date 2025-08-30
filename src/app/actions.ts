
'use server';

import { cookies } from 'next/headers';
import { webImpulsChat, type WebImpulsChatInput } from '@/ai/flows/web-impuls-chat';
import { getSupabaseClient } from '@/lib/supabase';
import { translations } from '@/lib/translations';

async function getOrCreateChatId() {
  const cookieStore = cookies();
  const supabase = getSupabaseClient();

  const existing = cookieStore.get('chat_id')?.value;
  if (existing) {
    try {
      // Validate that the chat exists; if not, create a new one
      const { data: chatRow, error: selErr } = await supabase
        .from('chats')
        .select('id')
        .eq('id', existing)
        .maybeSingle();
      if (!selErr && chatRow?.id) return chatRow.id as string;
    } catch {}
  }

  const { data, error } = await supabase
    .from('chats')
    .insert({})
    .select('id')
    .single();

  if (error || !data?.id) {
    throw new Error(`Failed to create chat: ${error?.message || 'unknown error'}`);
  }

  cookieStore.set('chat_id', data.id, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    // 30 days
    maxAge: 60 * 60 * 24 * 30,
  });
  return data.id as string;
}

export async function generateSuggestion(input: WebImpulsChatInput) {
  try {
    const supabase = getSupabaseClient();
    const chatId = await getOrCreateChatId();

    // Save user message
    const { error: insertUserErr } = await supabase
      .from('messages')
      .insert({ chat_id: chatId, role: 'user', content: input.query });
    if (insertUserErr) {
      console.error('Supabase insert user message error:', insertUserErr);
    }

    // Try to capture contact (email/phone) from the user's message
    try {
      const contact = extractContact(input.query);
      if (contact) {
        await upsertLead({ chatId, locale: input.locale, firstMessage: input.query, ...contact });
      }
    } catch (e) {
      console.error('Lead capture error:', e);
    }

    // Get AI response
    const result = await webImpulsChat(input);
    if (!result?.response) {
      return { success: false, error: 'AI returned an empty response.' };
    }

    // Save assistant message
    const { error: insertAiErr } = await supabase
      .from('messages')
      .insert({ chat_id: chatId, role: 'assistant', content: result.response });
    if (insertAiErr) {
      console.error('Supabase insert assistant message error:', insertAiErr);
    }

    // Heuristic: suggest leaving contact if user intent is clear enough
    let askContact = false;
    try {
      const { data: lead } = await supabase
        .from('leads')
        .select('id')
        .eq('chat_id', chatId)
        .maybeSingle();
      const userMsgs = (input.chatHistory || []).filter((m) => m.role === 'user').length + 1; // include current
      const q = (input.query || '').toLowerCase();
      const priceIntent = /(цена|вартість|скільки|бюджет|стоимость|срок|термін|price|budget|cost|timeline|how long)/i.test(q);
      const contactIntent = /(контакт|email|e-mail|почта|пошта|телефон|phone|номер|contact)/i.test(q);
      const readyIntent = /(заказать|замовити|готов|готовий|start|начать|почати|купить|оплатить|order)/i.test(q);
      // Be less pushy: only suggest contact after more context
      // - immediately if user asks to be contacted or ready to start
      // - or after 3+ user turns AND price/timeline intent observed
      if (!lead && (contactIntent || readyIntent || (userMsgs >= 3 && priceIntent))) askContact = true;
    } catch (e) {
      console.error('askContact heuristic error:', e);
    }

    return { success: true, data: { ...result, askContact } };
  } catch (e) {
    const error = e instanceof Error ? e : new Error(String(e));
    console.error('Error in generateSuggestion:', error);
    return { success: false, error: error.message || 'An unknown error occurred.' };
  }
}

export async function getChatHistory(locale?: string) {
  try {
    const supabase = getSupabaseClient();
    const chatId = await getOrCreateChatId();

    // If chat has no messages yet, insert localized greeting
    const { data: firstPage, error: firstErr } = await supabase
      .from('messages')
      .select('id')
      .eq('chat_id', chatId)
      .limit(1);
    if (firstErr) console.error('Supabase initial check error:', firstErr);
    if (!firstErr && (firstPage?.length ?? 0) === 0) {
      const t = (translations as any)[locale || 'ua'] || translations.ua;
      const greeting = t.chatWelcome || 'Привіт! 👋 Я ваш AI‑помічник. Чим можу допомогти сьогодні?';
      const { error: greetErr } = await supabase
        .from('messages')
        .insert({ chat_id: chatId, role: 'assistant', content: greeting });
      if (greetErr) console.error('Supabase insert greeting error:', greetErr);
    }

    const { data, error } = await supabase
      .from('messages')
      .select('role, content, created_at')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Supabase fetch messages error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: { chatId, messages: data ?? [] } };
  } catch (e) {
    const error = e instanceof Error ? e : new Error(String(e));
    console.error('Error in getChatHistory:', error);
    return { success: false, error: error.message || 'An unknown error occurred.' };
  }
}

// --- Lead capture helpers ---

function extractContact(text: string): { email?: string; phone?: string } | null {
  if (!text) return null;
  const emailMatch = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  // phone: allow +, spaces, dashes, parentheses; require at least 8 digits
  const phoneDigits = (text.match(/[+()\d][\d\s().-]{6,}/g) || [])
    .map(s => s.replace(/[^\d+]/g, ''))
    .filter(s => (s.replace(/\D/g, '').length >= 8));
  const phone = phoneDigits[0];
  const email = emailMatch ? emailMatch[0] : undefined;
  if (!email && !phone) return null;
  return { email, phone };
}

async function upsertLead({ chatId, email, phone, locale, firstMessage }: { chatId: string; email?: string; phone?: string; locale?: string; firstMessage?: string }) {
  const supabase = getSupabaseClient();
  // Check if lead exists for this chat
  const { data: existing, error: selErr } = await supabase
    .from('leads')
    .select('id, email, phone')
    .eq('chat_id', chatId)
    .maybeSingle();
  if (selErr) {
    console.error('Select lead error:', selErr);
    return;
  }
  if (!existing) {
    const { error } = await supabase.from('leads').insert({ chat_id: chatId, email, phone, locale: locale || 'ua', first_message: firstMessage || null });
    if (error) console.error('Insert lead error:', error);
    return;
  }
  // Update only if new info present
  const next: any = {};
  if (email && !existing.email) next.email = email;
  if (phone && !existing.phone) next.phone = phone;
  if (Object.keys(next).length === 0) return;
  const { error: updErr } = await supabase.from('leads').update(next).eq('id', existing.id);
  if (updErr) console.error('Update lead error:', updErr);
}

export async function saveContact(value: string, locale?: string) {
  try {
    const chatId = await getOrCreateChatId();
    const detected = extractContact(value);
    if (!detected) {
      return { success: false, error: 'Введите корректный e-mail или телефон.' };
    }
    await upsertLead({ chatId, locale, firstMessage: value, ...detected });
    return { success: true };
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e));
    console.error('saveContact error:', err);
    return { success: false, error: err.message };
  }
}

// saveLeadForm was removed in revert

export async function getLeadStatus() {
  try {
    const chatId = await getOrCreateChatId();
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('leads')
      .select('id, email, phone')
      .eq('chat_id', chatId)
      .maybeSingle();
    if (error) {
      console.error('getLeadStatus error:', error);
      return { success: false, error: error.message };
    }
    return { success: true, data: { hasLead: !!data, email: data?.email || null, phone: data?.phone || null } };
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e));
    return { success: false, error: err.message };
  }
}

export async function insertAssistantMessage(content: string) {
  try {
    const supabase = getSupabaseClient();
    const chatId = await getOrCreateChatId();
    const { error } = await supabase
      .from('messages')
      .insert({ chat_id: chatId, role: 'assistant', content });
    if (error) {
      console.error('insertAssistantMessage error:', error);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e));
    return { success: false, error: err.message };
  }
}

export async function getChatSession() {
  try {
    const chatId = await getOrCreateChatId();
    return { success: true, data: { chatId } };
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e));
    return { success: false, error: err.message };
  }
}

export async function getChatMeta() {
  try {
    const supabase = getSupabaseClient();
    const chatId = await getOrCreateChatId();

    const [{ data: lead }, { data: lastMsg, error: lastErr }] = await Promise.all([
      supabase.from('leads').select('id').eq('chat_id', chatId).maybeSingle(),
      supabase
        .from('messages')
        .select('created_at, role')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: false })
        .limit(1)
    ]);

    if (lastErr) {
      // not critical
      console.error('getChatMeta last message error:', lastErr);
    }

    return {
      success: true,
      data: {
        chatId,
        hasLead: !!lead,
        lastMessageAt: lastMsg?.[0]?.created_at || null,
        lastMessageRole: lastMsg?.[0]?.role || null,
      },
    };
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e));
    return { success: false, error: err.message };
  }
}
