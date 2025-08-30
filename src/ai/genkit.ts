import { config } from 'dotenv';
config();

import {genkit} from 'genkit';
// Fallback: якщо GOOGLE_API_KEY відсутній, але задано GEMINI_API_KEY — використовуємо його
if (!process.env.GOOGLE_API_KEY && process.env.GEMINI_API_KEY) {
  process.env.GOOGLE_API_KEY = process.env.GEMINI_API_KEY;
}
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.0-flash',
});
