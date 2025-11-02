'use server';
/**
 * @fileOverview An AI agent that analyzes text to extract vocabulary and key phrases.
 *
 * - analyzeArticleText - A function that handles the text analysis process.
 * - AnalyzeArticleTextInput - The input type for the analyzeArticleText function.
 * - AnalyzeArticleTextOutput - The return type for the analyzeArticleText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeArticleTextInputSchema = z.object({
  text: z.string().describe('The article text to analyze.'),
});
export type AnalyzeArticleTextInput = z.infer<typeof AnalyzeArticleTextInputSchema>;

const AnalyzeArticleTextOutputSchema = z.object({
  vocabularyAndPhrases: z.array(z.object({
    term: z.string().describe('A key vocabulary word, phrasal verb, or idiom from the text (e.g., "grandiose", "hunkered down").'),
    partOfSpeech: z.string().describe('The part of speech of the term (e.g., "noun", "phrasal verb", "idiom").'),
    definition: z.string().describe('A simple definition of the term in the context of the article.'),
    example: z.string().describe('A simple example sentence showing how to use the term.'),
  })).describe('An array of key vocabulary words, phrasal verbs, and idioms with their definitions, parts of speech, and an example sentence.'),
});
export type AnalyzeArticleTextOutput = z.infer<typeof AnalyzeArticleTextOutputSchema>;


export async function analyzeArticleText(input: AnalyzeArticleTextInput): Promise<AnalyzeArticleTextOutput> {
  return analyzeArticleTextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeArticleTextPrompt',
  input: {schema: AnalyzeArticleTextInputSchema},
  output: {schema: AnalyzeArticleTextOutputSchema},
  prompt: `You are an expert linguistic analyst. Your task is to read the provided article text and extract a list of key vocabulary and phrases.

For this list, you must identify:
1.  Advanced or uncommon single words (e.g., "grandiose").
2.  Phrasal verbs (e.g., "hunkered down", "vaulted to").
3.  Idiomatic expressions (e.g., "nags at the back of").

For each item you identify, you MUST provide four pieces of information:
1.  **term**: The word or phrase itself.
2.  **partOfSpeech**: The grammatical role (e.g., noun, adjective, phrasal verb, idiom).
3.  **definition**: A simple, concise definition relevant to how it's used in the text.
4.  **example**: A new, clear sentence that shows how to use the term correctly.

Article Text:
{{{text}}}
`,
});

const analyzeArticleTextFlow = ai.defineFlow(
  {
    name: 'analyzeArticleTextFlow',
    inputSchema: AnalyzeArticleTextInputSchema,
    outputSchema: AnalyzeArticleTextOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
