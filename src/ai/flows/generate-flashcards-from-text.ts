'use server';
/**
 * @fileOverview A flashcard generation AI agent.
 *
 * - generateFlashcardsFromText - A function that handles the flashcard generation process.
 * - GenerateFlashcardsFromTextInput - The input type for the generateFlashcardsFromText function.
 * - GenerateFlashcardsFromTextOutput - The return type for the generateFlashcardsFromText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateFlashcardsFromTextInputSchema = z.object({
  text: z.string().describe('The text to generate flashcards from.'),
});
export type GenerateFlashcardsFromTextInput = z.infer<typeof GenerateFlashcardsFromTextInputSchema>;

const GenerateFlashcardsFromTextOutputSchema = z.object({
  flashcards: z.array(
    z.object({
      question: z.string().describe('The question for the flashcard.'),
      answer: z.string().describe('The answer to the question.'),
    })
  ).describe('The generated flashcards.'),
});
export type GenerateFlashcardsFromTextOutput = z.infer<typeof GenerateFlashcardsFromTextOutputSchema>;

export async function generateFlashcardsFromText(input: GenerateFlashcardsFromTextInput): Promise<GenerateFlashcardsFromTextOutput> {
  return generateFlashcardsFromTextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateFlashcardsFromTextPrompt',
  input: {schema: GenerateFlashcardsFromTextInputSchema},
  output: {schema: GenerateFlashcardsFromTextOutputSchema},
  prompt: `You are an expert at creating flashcards from text.

  Given the following text, generate a set of flashcards with questions and answers.

  Text: {{{text}}}

  Each flashcard should focus on a key concept or idea from the text.
  Make sure the questions are clear and concise, and the answers are accurate and complete.
  The response should be in JSON format.
  `,config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_NONE',
      },
    ],
  },
});

const generateFlashcardsFromTextFlow = ai.defineFlow(
  {
    name: 'generateFlashcardsFromTextFlow',
    inputSchema: GenerateFlashcardsFromTextInputSchema,
    outputSchema: GenerateFlashcardsFromTextOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
