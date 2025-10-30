
'use server';
/**
 * @fileOverview Generates flashcards from detailed study notes.
 *
 * - generateFlashcardsFromNotes - A function that handles the flashcard generation process from notes.
 */

import {ai} from '@/ai/genkit';
import { 
    GenerateFlashcardsFromNotesInputSchema, 
    GenerateFlashcardsFromNotesOutputSchema, 
    type GenerateFlashcardsFromNotesInput, 
    type GenerateFlashcardsFromNotesOutput 
} from './schemas';

export async function generateFlashcardsFromNotes(input: GenerateFlashcardsFromNotesInput): Promise<GenerateFlashcardsFromNotesOutput> {
  return generateFlashcardsFromNotesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateFlashcardsFromNotesPrompt',
  input: {schema: GenerateFlashcardsFromNotesInputSchema},
  output: {schema: GenerateFlashcardsFromNotesOutputSchema},
  prompt: `You are an expert at creating high-yield flashcards from structured study notes.

Given the following study notes, generate a set of targeted flashcards. Each flashcard should test a single, critical concept, definition, or key point.

Focus on the **bolded keywords** in the notes to identify the most important information.

Study Notes:
{{{notes}}}

Generate clear, concise questions and accurate answers. The output must be a JSON object containing an array of flashcard objects, where each object has a 'question' and an 'answer' field.
`,
});

const generateFlashcardsFromNotesFlow = ai.defineFlow(
  {
    name: 'generateFlashcardsFromNotesFlow',
    inputSchema: GenerateFlashcardsFromNotesInputSchema,
    outputSchema: GenerateFlashcardsFromNotesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
