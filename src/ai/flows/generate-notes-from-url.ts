'use server';
/**
 * @fileOverview A note generation AI agent that creates notes from a URL.
 *
 * - generateNotesFromUrl - A function that handles the note generation process from a URL.
 * - GenerateNotesFromUrlInput - The input type for the generateNotesFromUrl function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {htmlToText} from 'html-to-text';
import { generateStudyNotes } from './generate-study-notes';
import { GenerateStudyNotesOutputSchema, type GenerateStudyNotesOutput } from './schemas';

const GenerateNotesFromUrlInputSchema = z.object({
  url: z.string().url().describe('The URL of the article to generate notes from.'),
});
export type GenerateNotesFromUrlInput = z.infer<typeof GenerateNotesFromUrlInputSchema>;

async function fetchAndClean(url: string): Promise<string> {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch URL: ${response.statusText}`);
        }
        const html = await response.text();
        const text = htmlToText(html, {
            wordwrap: false,
            selectors: [
                { selector: 'a', options: { ignoreHref: true } },
                { selector: 'img', format: 'skip' },
            ]
        });
        return text;
    } catch(error) {
        console.error("Error fetching or cleaning URL content:", error);
        throw new Error("Could not retrieve content from the provided URL.");
    }
}


export async function generateNotesFromUrl(input: GenerateNotesFromUrlInput): Promise<GenerateStudyNotesOutput> {
  return generateNotesFromUrlFlow(input);
}


const generateNotesFromUrlFlow = ai.defineFlow(
  {
    name: 'generateNotesFromUrlFlow',
    inputSchema: GenerateNotesFromUrlInputSchema,
    outputSchema: GenerateStudyNotesOutputSchema,
  },
  async (input) => {
    const articleText = await fetchAndClean(input.url);

    if (articleText.trim().length < 100) {
        throw new Error('The content of the article is too short to generate notes from.');
    }
    
    // Correctly reuse the main study notes generation function
    return await generateStudyNotes({ text: articleText });
  }
);
