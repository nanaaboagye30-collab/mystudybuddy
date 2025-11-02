
'use server';

import {
  generateText,
  type GenerateTextInput,
  type GenerateTextOutput,
} from '@/ai/flows/generate-text';

export async function handleGenerateText(
  input: GenerateTextInput
<<<<<<< HEAD
): Promise<GenerateTextOutput | { error: string }> {
=======
): Promise<GenerateTextOutput> {
>>>>>>> cb4c034c204ea3197443d50d39cc11865d10f9d0
  try {
    // Add a simulated delay to show loading state
    await new Promise(resolve => setTimeout(resolve, 1500));
    const result = await generateText(input);
    if (!result || !result.generatedText) {
<<<<<<< HEAD
      return { error: 'AI failed to generate text.' };
=======
      throw new Error('AI failed to generate text.');
>>>>>>> cb4c034c204ea3197443d50d39cc11865d10f9d0
    }
    return result;
  } catch (error) {
    console.error('Error generating text:', error);
<<<<<<< HEAD
    let errorMessage = 'An unknown error occurred while generating text.';
    if (error instanceof Error) {
       if (error.message.includes('503')) {
            errorMessage = 'The AI model is temporarily overloaded. Please wait a moment and try again.';
        } else {
            errorMessage = `Failed to generate text: ${error.message}`;
        }
    }
    return { error: errorMessage };
=======
    if (error instanceof Error) {
       if (error.message.includes('503')) {
            throw new Error('The AI model is temporarily overloaded. Please wait a moment and try again.');
        }
      throw new Error(`Failed to generate text: ${error.message}`);
    }
    throw new Error('An unknown error occurred while generating text.');
>>>>>>> cb4c034c204ea3197443d50d39cc11865d10f9d0
  }
}
