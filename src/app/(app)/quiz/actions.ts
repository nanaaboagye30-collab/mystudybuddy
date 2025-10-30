
'use server';

import {
  generateQuiz,
  type GenerateQuizInput,
  type GenerateQuizOutput,
} from '@/ai/flows/generate-quiz-from-uploaded-text';

export async function handleGenerateQuiz(input: GenerateQuizInput): Promise<GenerateQuizOutput> {
  try {
    const result = await generateQuiz(input);
    if (!result || !result.quiz) {
      throw new Error('AI failed to generate a quiz.');
    }
    return result;
  } catch (error) {
    console.error('Error generating quiz:', error);
    if (error instanceof Error) {
        if (error.message.includes('503')) {
            throw new Error('The AI model is temporarily overloaded. Please wait a moment and try again.');
        }
        throw new Error(`Failed to generate quiz: ${error.message}`);
    }
    throw new Error('An unknown error occurred while generating the quiz.');
  }
}
