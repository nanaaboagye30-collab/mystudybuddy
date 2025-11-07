
'use server';

import {
  analyzeArticleText,
  type AnalyzeArticleTextInput,
  type AnalyzeArticleTextOutput,
} from '@/ai/flows/analyze-article-text';
import { saveNote } from '@/services/notes-service';

export async function handleAnalyzeArticle(
  input: AnalyzeArticleTextInput
): Promise<AnalyzeArticleTextOutput | { error: string }> {
  try {
    // Add a simulated delay to show loading state
    await new Promise(resolve => setTimeout(resolve, 1500));
    const result = await analyzeArticleText(input);
    if (!result || !result.vocabularyAndPhrases) {
        return { error: 'AI failed to analyze the article.' };
    }
    return result;
  } catch (error) {
    console.error('Error analyzing article:', error);
    let errorMessage = 'An unknown error occurred while analyzing the article.';
    if (error instanceof Error) {
       if (error.message.includes('503')) {
            errorMessage = 'The AI model is temporarily overloaded. Please wait a moment and try again.';
        } else {
            errorMessage = `Failed to analyze article: ${error.message}`;
        }
    }
    return { error: errorMessage };
  }
}

export async function handleSaveArticle(userId: string, topic: string, content: AnalyzeArticleTextOutput): Promise<{ success: boolean; error?: string }> {
  try {
    await saveNote(userId, topic, 'article-analysis', content);
    return { success: true };
  } catch (error) {
    console.error("Error saving article analysis:", error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred while saving the article analysis.';
    return { success: false, error: `Failed to save article analysis: ${errorMessage}` };
  }
}
