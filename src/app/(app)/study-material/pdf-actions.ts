'use server';

import {
  generateNotesFromPdf,
  type GenerateNotesFromPdfInput,
  // --- CORRECTION START ---
  // Remove 'type GenerateStudyNotesOutput' from this import, as it's no longer exported from here.
} from '@/ai/flows/generate-notes-from-pdf';

// Add a new, separate import for GenerateStudyNotesOutput directly from its source.
import { type GenerateStudyNotesOutput } from '@/ai/flows/schemas';
// --- CORRECTION END ---


export async function handleGenerateNotesFromPdf(
  input: GenerateNotesFromPdfInput
): Promise<GenerateStudyNotesOutput> {
  try {
    const result = await generateNotesFromPdf(input);
    if (!result || !result.studyNotes) {
      throw new Error('AI failed to generate notes from the PDF content.');
    }
    return result;
  } catch (error) {
    console.error('Error processing PDF and generating notes:', error);
    if (error instanceof Error) {
        if (error.message.includes('503')) {
            throw new Error('The AI model is temporarily overloaded. Please wait a moment and try again.');
        }
        throw new Error(`Failed to process PDF: ${error.message}`);
    }
    throw new Error('An unknown error occurred while processing the PDF.');
  }
}
