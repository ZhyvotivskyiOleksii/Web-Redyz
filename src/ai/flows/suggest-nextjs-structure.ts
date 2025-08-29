
'use server';
/**
 * @fileOverview AI-powered suggestion for optimized Next.js component structure and styling based on HTML/CSS screenshots.
 *
 * - suggestNextJSStructure - A function that handles the suggestion process.
 * - SuggestNextJSStructureInput - The input type for the suggestNextJSStructure function.
 * - SuggestNextJSStructureOutput - The return type for the suggestNextJSStructure function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestNextJSStructureInputSchema = z.object({
  screenshotDataUri: z
    .string()
    .describe(
      "A screenshot of the HTML/CSS section, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  htmlCode: z.string().describe('The HTML code of the section.'),
  cssCode: z.string().describe('The CSS code of the section.'),
});
export type SuggestNextJSStructureInput = z.infer<typeof SuggestNextJSStructureInputSchema>;

const SuggestNextJSStructureOutputSchema = z.object({
  suggestedStructure: z.string().describe('The suggested Next.js component structure and styling.'),
});
export type SuggestNextJSStructureOutput = z.infer<typeof SuggestNextJSStructureOutputSchema>;

export async function suggestNextJSStructure(input: SuggestNextJSStructureInput): Promise<SuggestNextJSStructureOutput> {
  return suggestNextJSStructureFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestNextJSStructurePrompt',
  input: {schema: SuggestNextJSStructureInputSchema},
  output: {schema: SuggestNextJSStructureOutputSchema},
  prompt: `You are an expert Next.js developer, skilled in creating optimized and well-structured components.

You will receive a screenshot, HTML code, and CSS code of a section from a website.
Your task is to analyze these inputs and suggest an optimized Next.js component structure and styling.
Consider best practices for performance, maintainability, and scalability.

Here's the information about the section:

Screenshot: {{media url=screenshotDataUri}}
HTML Code: {{{htmlCode}}}
CSS Code: {{{cssCode}}}

Based on the above information, provide a detailed suggestion for the Next.js component structure and styling, including file structure, component organization, and styling approach.`,
});

const suggestNextJSStructureFlow = ai.defineFlow(
  {
    name: 'suggestNextJSStructureFlow',
    inputSchema: SuggestNextJSStructureInputSchema,
    outputSchema: SuggestNextJSStructureOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
