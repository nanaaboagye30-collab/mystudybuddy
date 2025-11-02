
'use server';

import {
  generateQuiz,
  type GenerateQuizInput,
  type GenerateQuizOutput,
} from '@/ai/flows/generate-quiz-from-uploaded-text';
import { saveNote } from '@/services/notes-service';

export async function handleGenerateQuiz(
  input: GenerateQuizInput
): Promise<GenerateQuizOutput | { error: string }> {
  try {
    // Add a simulated delay to show loading state
    await new Promise(resolve => setTimeout(resolve, 1500));
    const result = await generateQuiz(input);
    if (!result || !result.quiz) {
      return { error: 'AI failed to generate quiz.' };
    }
    return result;
  } catch (error) {
    console.error('Error generating quiz:', error);
    let errorMessage = 'An unknown error occurred while generating quiz.';
    if (error instanceof Error) {
       if (error.message.includes('503')) {
            errorMessage = 'The AI model is temporarily overloaded. Please wait a moment and try again.';
        } else {
            errorMessage = `Failed to generate quiz: ${error.message}`;
        }
    }
    return { error: errorMessage };
  }
}

export async function handleSaveQuiz(userId: string, topic: string, content: GenerateQuizOutput): Promise<{ success: boolean; error?: string }> {
  try {
    await saveNote(userId, topic, 'quiz', content);
    return { success: true };
  } catch (error) {
    console.error("Error saving quiz:", error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred while saving the quiz.';
    return { success: false, error: `Failed to save quiz: ${errorMessage}` };
  }
}
