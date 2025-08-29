
'use server';

import { webImpulsChat, type WebImpulsChatInput } from '@/ai/flows/web-impuls-chat';

export async function generateSuggestion(input: WebImpulsChatInput) {
  try {
    const result = await webImpulsChat(input);
    if (!result?.response) {
      return { success: false, error: 'AI returned an empty response.' };
    }
    return { success: true, data: result };
  } catch (e) {
    const error = e instanceof Error ? e : new Error(String(e));
    console.error("Error in generateSuggestion:", error);
    return { success: false, error: error.message || 'An unknown error occurred.' };
  }
}
