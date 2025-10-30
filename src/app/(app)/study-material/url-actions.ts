
'use server';

import {
  generateNotesFromUrl,
  type GenerateNotesFromUrlInput,
} from '@/ai/flows/generate-notes-from-url';
import type { GenerateStudyNotesOutput } from '@/ai/flows/schemas';

export async function handleGenerateNotesFromUrl(
  input: GenerateNotesFromUrlInput
): Promise<GenerateStudyNotesOutput> {
  try {
    const result = await generateNotesFromUrl(input);
    if (!result || !result.studyNotes) {
      throw new Error('AI failed to generate notes from the URL.');
    }
    return result;
  } catch (error) {
    console.error('Error processing URL and generating notes:', error);
    if (error instanceof Error) {
      if (error.message.includes('503')) {
          throw new Error('The AI model is temporarily overloaded. Please wait a moment and try again.');
      }
      throw new Error(`Failed to process URL: ${error.message}`);
    }
    throw new Error('An unknown error occurred while processing the URL.');
  }
}
