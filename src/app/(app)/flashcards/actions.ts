
'use server';

import {
  generateFlashcardsFromText,
  type GenerateFlashcardsFromTextOutput,
} from '@/ai/flows/generate-flashcards-from-text';

export async function handleGenerateFlashcards(text: string): Promise<GenerateFlashcardsFromTextOutput> {
  try {
    const result = await generateFlashcardsFromText({ text });
    if (!result || !result.flashcards) {
      throw new Error('AI failed to generate flashcards.');
    }
    return result;
  } catch (error) {
    console.error('Error generating flashcards:', error);
    // Re-throw a more user-friendly error
    if (error instanceof Error) {
        if (error.message.includes('503')) {
            throw new Error('The AI model is temporarily overloaded. Please wait a moment and try again.');
        }
        throw new Error(`Failed to generate flashcards: ${error.message}`);
    }
    throw new Error('An unknown error occurred while generating flashcards.');
  }
}
