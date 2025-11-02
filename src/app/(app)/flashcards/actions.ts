
'use server';

import {
  generateFlashcardsFromText,
<<<<<<< HEAD
  type GenerateFlashcardsFromTextInput,
  type GenerateFlashcardsFromTextOutput,
} from '@/ai/flows/generate-flashcards-from-text';
import { saveNote } from '@/services/notes-service';

export async function handleGenerateFlashcards(
  input: GenerateFlashcardsFromTextInput
): Promise<GenerateFlashcardsFromTextOutput | { error: string }> {
  try {
    // Add a simulated delay to show loading state
    await new Promise(resolve => setTimeout(resolve, 1500));
    const result = await generateFlashcardsFromText(input);
    if (!result || !result.flashcards) {
      return { error: 'AI failed to generate flashcards.' };
=======
  type GenerateFlashcardsFromTextOutput,
} from '@/ai/flows/generate-flashcards-from-text';

export async function handleGenerateFlashcards(text: string): Promise<GenerateFlashcardsFromTextOutput> {
  try {
    const result = await generateFlashcardsFromText({ text });
    if (!result || !result.flashcards) {
      throw new Error('AI failed to generate flashcards.');
>>>>>>> cb4c034c204ea3197443d50d39cc11865d10f9d0
    }
    return result;
  } catch (error) {
    console.error('Error generating flashcards:', error);
<<<<<<< HEAD
    let errorMessage = 'An unknown error occurred while generating flashcards.';
    if (error instanceof Error) {
        if (error.message.includes('503')) {
            errorMessage = 'The AI model is temporarily overloaded. Please wait a moment and try again.';
        } else {
            errorMessage = `Failed to generate flashcards: ${error.message}`;
        }
    }
    return { error: errorMessage };
  }
}

export async function handleSaveFlashcards(userId: string, topic: string, content: GenerateFlashcardsFromTextOutput): Promise<{ success: boolean; error?: string }> {
  try {
    await saveNote(userId, topic, 'flashcards', content);
    return { success: true };
  } catch (error) {
    console.error("Error saving flashcards:", error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred while saving the flashcards.';
    return { success: false, error: `Failed to save flashcards: ${errorMessage}` };
=======
    // Re-throw a more user-friendly error
    if (error instanceof Error) {
        if (error.message.includes('503')) {
            throw new Error('The AI model is temporarily overloaded. Please wait a moment and try again.');
        }
        throw new Error(`Failed to generate flashcards: ${error.message}`);
    }
    throw new Error('An unknown error occurred while generating flashcards.');
>>>>>>> cb4c034c204ea3197443d50d39cc11865d10f9d0
  }
}
