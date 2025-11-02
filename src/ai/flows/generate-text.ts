'use server';
/**
 * @fileOverview An AI agent that functions as a writing assistant to improve user-written text.
 *
 * - generateText - A function that handles the text improvement process.
 * - GenerateTextInput - The input type for the generateText function.
 * - GenerateTextOutput - The return type for the generateText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateTextInputSchema = z.object({
  text: z.string().describe('The text to be improved.'),
  instructions: z.string().optional().describe('Specific instructions for the AI on how to improve the text (e.g., "Make it more concise," "Adopt a formal academic tone").'),
});
export type GenerateTextInput = z.infer<typeof GenerateTextInputSchema>;

const GenerateTextOutputSchema = z.object({
  generatedText: z.string().describe('The improved, rewritten version of the text.'),
  feedback: z.string().describe('A bulleted list of the key changes made and the reasoning behind them, explaining how they align with high academic standards.'),
});
export type GenerateTextOutput = z.infer<typeof GenerateTextOutputSchema>;


export async function generateText(input: GenerateTextInput): Promise<GenerateTextOutput> {
  return generateTextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateTextPrompt',
  input: {schema: GenerateTextInputSchema},
  output: {schema: GenerateTextOutputSchema},
  prompt: `You are an expert academic writing assistant with the rigor of a Harvard editor. Your task is to take the user's text and rewrite it to meet the highest academic standards.

### Your Mandate:
1.  **Rewrite the Text:** Thoroughly rewrite the provided text to improve its clarity, conciseness, structure, and academic tone. Correct any grammatical errors, awkward phrasing, or stylistic inconsistencies.
2.  **Provide Actionable Feedback:** After rewriting, you must provide a bulleted list of the most important changes you made and explain *why* you made them. Connect your feedback to principles of good academic writing (e.g., "I replaced 'a lot of' with 'numerous' to maintain a formal tone," or "I restructured the paragraph to lead with a clear topic sentence").

### User-Provided Instructions (if any):
{{#if instructions}}
The user has provided the following specific instructions: {{{instructions}}}
Incorporate these instructions into your rewrite and feedback.
{{else}}
No specific instructions were provided. Rely on general principles of excellent academic writing.
{{/if}}

### Text to Improve:
{{{text}}}

The final output must be a single JSON object containing the rewritten text and the detailed feedback.
`,
});

const generateTextFlow = ai.defineFlow(
  {
    name: 'generateTextFlow',
    inputSchema: GenerateTextInputSchema,
    outputSchema: GenerateTextOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error("The AI failed to generate a response.");
    }
    return output;
  }
);
