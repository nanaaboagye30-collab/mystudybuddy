
'use server';

import {
  generateFlashcardsFromText,
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
    }
    return result;
  } catch (error) {
    console.error('Error generating flashcards:', error);
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
  }
}
