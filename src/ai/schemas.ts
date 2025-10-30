/**
 * @fileOverview Shared Zod schemas for AI flows.
 */

import {z} from 'genkit';

export const GenerateStudyNotesOutputSchema = z.object({
  studyNotes: z.string().describe("The generated study notes in markdown format."),
});

export type GenerateStudyNotesOutput = z.infer<typeof GenerateStudyNotesOutputSchema>;


export const GenerateTransformedNotesInputSchema = z.object({
    notes: z.string().describe('The detailed study notes to transform.'),
    format: z.enum(['summary', 'flashcards']).describe('The target format for the notes.')
});
export type GenerateTransformedNotesInput = z.infer<typeof GenerateTransformedNotesInputSchema>;

export const GenerateTransformedNotesOutputSchema = z.object({
    transformedNotes: z.string().describe('The notes in the requested new format.')
});
export type GenerateTransformedNotesOutput = z.infer<typeof GenerateTransformedNotesOutputSchema>;

export const GenerateFlashcardsFromNotesInputSchema = z.object({
    notes: z.string().describe('The detailed study notes to generate flashcards from.'),
});
export type GenerateFlashcardsFromNotesInput = z.infer<typeof GenerateFlashcardsFromNotesInputSchema>;

export const GenerateFlashcardsFromNotesOutputSchema = z.object({
    flashcards: z.array(
        z.object({
            question: z.string().describe('The question for the flashcard.'),
            answer: z.string().describe('The answer to the question.'),
        })
    ).describe('The generated flashcards.'),
});
export type GenerateFlashcardsFromNotesOutput = z.infer<typeof GenerateFlashcardsFromNotesOutputSchema>;
