
'use server';

import {
  generateStudyNotes,
  type GenerateStudyNotesInput,
} from '@/ai/flows/generate-study-notes';
import {
  generateNotesFromUrl,
  type GenerateNotesFromUrlInput,
} from '@/ai/flows/generate-notes-from-url';
import {
    generateNotesFromPdf,
    type GenerateNotesFromPdfInput,
} from '@/ai/flows/generate-notes-from-pdf';
import { type GenerateStudyNotesOutput } from '@/ai/flows/schemas';
import { 
    transformNotes
} from '@/ai/flows/transform-notes';
import { type GenerateFlashcardsFromNotesOutput, type GenerateSummaryOutput } from '@/ai/flows/schemas';
import { saveNote } from '@/services/notes-service';

export async function handleGenerateNotes(
  input: GenerateStudyNotesInput
): Promise<GenerateStudyNotesOutput> {
  try {
    await new Promise(resolve => setTimeout(resolve, 1500));
    const result = await generateStudyNotes(input);
    if (!result || !result.studyNotes) {
      return { studyNotes: "ERROR: AI failed to generate notes." };
    }
    return result;
  } catch (error) {
    console.error('Error generating notes:', error);
    let errorMessage = 'An unknown error occurred while generating notes.';
    if (error instanceof Error) {
        if (error.message.includes('503')) {
            errorMessage = 'The AI model is temporarily overloaded. Please wait a moment and try again.';
        } else {
            errorMessage = `Failed to generate notes: ${error.message}`;
        }
    }
    return { studyNotes: `ERROR: ${errorMessage}` };
  }
}

export async function handleGenerateFromUrl(
  input: GenerateNotesFromUrlInput
): Promise<GenerateStudyNotesOutput> {
  try {
     await new Promise(resolve => setTimeout(resolve, 1500));
    const result = await generateNotesFromUrl(input);
    if (!result || !result.studyNotes) {
      return { studyNotes: "ERROR: AI failed to generate notes from URL." };
    }
     if (result.studyNotes.startsWith("ERROR:")) {
        return result;
    }
    return result;
  } catch (error) {
    console.error('Error generating notes from URL:', error);
    let errorMessage = 'An unknown error occurred while generating notes from URL.';
     if (error instanceof Error) {
        if (error.message.includes('503')) {
            errorMessage = 'The AI model is temporarily overloaded. Please wait a moment and try again.';
        } else if (error.message.includes('too short')) {
            errorMessage = "The content of the article is too short or could not be read properly.";
        } else {
            errorMessage = `Failed to generate notes from URL: ${error.message}`;
        }
    }
    return { studyNotes: `ERROR: ${errorMessage}` };
  }
}

export async function handleGenerateFromPdf(
  input: GenerateNotesFromPdfInput
): Promise<GenerateStudyNotesOutput> {
    try {
        await new Promise(resolve => setTimeout(resolve, 2500));
        const result = await generateNotesFromPdf(input);
        if (!result || !result.studyNotes) {
            return { studyNotes: "ERROR: AI failed to generate notes from the PDF." };
        }
        return result;
    } catch(error) {
        console.error('Error generating notes from PDF:', error);
        let errorMessage = 'An unknown error occurred while processing the PDF.';
        if (error instanceof Error) {
            if (error.message.includes('503')) {
               errorMessage = 'The AI model is temporarily overloaded. Please wait a moment and try again.';
            } else {
                errorMessage = `Failed to process PDF: ${error.message}`;
            }
        }
        return { studyNotes: `ERROR: ${errorMessage}` };
    }
}


export async function handleTransformNotes(
  notes: string,
  format: 'summary' | 'flashcards'
): Promise<GenerateSummaryOutput | GenerateFlashcardsFromNotesOutput | { error: string }> {
  try {
    await new Promise(resolve => setTimeout(resolve, 1500));
    const result = await transformNotes({ notes, format });
    if (!result) {
      return { error: `AI failed to transform notes to ${format}.` };
    }
    return result;
  } catch (error) {
    console.error(`Error transforming notes to ${format}:`, error);
    let errorMessage = 'An unknown error occurred.';
     if (error instanceof Error) {
        if (error.message.includes('503')) {
            errorMessage = 'The AI model is temporarily overloaded. Please wait a moment and try again.';
        } else {
             errorMessage = `Failed to transform notes: ${error.message}`;
        }
    }
    return { error: errorMessage };
  }
}


export async function handleSaveNote(
  userId: string,
  topic: string,
  studyNotes: string,
  summary: string
): Promise<{ success: boolean; error?: string }> {
    if (!userId || !topic || !studyNotes) {
        return { success: false, error: "Missing required data to save the note." };
    }
    try {
        await saveNote(userId, topic, 'study-notes', { studyNotes, summary });
        return { success: true };
    } catch(e) {
        console.error("Error saving note to Firestore:", e);
        const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
        return { success: false, error: `Could not save your note to the library: ${errorMessage}` };
    }
}
