
'use server';

import {
  generateNotesFromPdf,
  type GenerateNotesFromPdfInput,
  type GenerateStudyNotesOutput,
} from '@/ai/flows/generate-notes-from-pdf';

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
