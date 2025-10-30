
'use server';

import {
  generateStudyNotes,
} from '@/ai/flows/generate-study-notes';
import type { GenerateStudyNotesOutput, GenerateSummaryOutput } from '@/ai/flows/schemas';
import { transformNotes, type GenerateTransformedNotesInput } from '@/ai/flows/transform-notes';
import { saveNote } from '@/services/notes-service';
import type { GenerateFlashcardsFromNotesOutput } from '@/ai/flows/schemas';

function getFriendlyErrorMessage(error: Error): string {
    if (error.message.includes('503')) {
        return 'The AI model is temporarily overloaded. Please wait a moment and try again.';
    }
    return `Failed to generate notes: ${error.message}`;
}

export async function handleGenerateNotes(text: string): Promise<GenerateStudyNotesOutput> {
  try {
    const result = await generateStudyNotes({ text });
    if (!result || !result.studyNotes) {
      throw new Error('AI failed to generate the primary study notes.');
    }
    return result;
  } catch (error) {
    console.error('Error generating notes:', error);
    if (error instanceof Error) {
        throw new Error(getFriendlyErrorMessage(error));
    }
    throw new Error('An unknown error occurred while generating notes.');
  }
}

export async function handleTransformNotes(input: GenerateTransformedNotesInput): Promise<GenerateSummaryOutput | GenerateFlashcardsFromNotesOutput> {
    try {
        const result = await transformNotes(input);
        if (!result) {
            throw new Error(`AI failed to transform notes to ${input.format}.`);
        }
        return result;
    } catch (error) {
        console.error(`Error transforming notes to ${input.format}:`, error);
        if (error instanceof Error) {
            if (error.message.includes('503')) {
                throw new Error('The AI model is temporarily overloaded. Please wait a moment and try again.');
            }
            throw new Error(`Failed to transform notes: ${error.message}`);
        }
        throw new Error('An unknown error occurred while transforming notes.');
    }
}

export async function handleSaveNotes(userId: string, topic: string, content: any) {
    try {
        await saveNote(userId, topic, 'study-notes', content);
    } catch (error) {
        console.error("Error saving notes:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to save notes: ${error.message}`);
        }
        throw new Error('An unknown error occurred while saving notes.');
    }
}
