
'use server';

import {
  generateText,
  type GenerateTextInput,
  type GenerateTextOutput,
} from '@/ai/flows/generate-text';

export async function handleGenerateText(
  input: GenerateTextInput
): Promise<GenerateTextOutput | { error: string }> {
  try {
    // Add a simulated delay to show loading state
    await new Promise(resolve => setTimeout(resolve, 1500));
    const result = await generateText(input);
    if (!result || !result.generatedText) {
      return { error: 'AI failed to generate text.' };
    }
    return result;
  } catch (error) {
    console.error('Error generating text:', error);
    let errorMessage = 'An unknown error occurred while generating text.';
    if (error instanceof Error) {
       if (error.message.includes('503')) {
            errorMessage = 'The AI model is temporarily overloaded. Please wait a moment and try again.';
        } else {
            errorMessage = `Failed to generate text: ${error.message}`;
        }
    }
    return { error: errorMessage };
  }
}
