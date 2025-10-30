
'use server';

import {
  analyzeArticleText,
  type AnalyzeArticleTextInput,
  type AnalyzeArticleTextOutput,
} from '@/ai/flows/analyze-article-text';
import { saveNote } from '@/services/notes-service';

export async function handleAnalyzeArticle(
  input: AnalyzeArticleTextInput
): Promise<AnalyzeArticleTextOutput> {
  try {
    // Add a simulated delay to show loading state
    await new Promise(resolve => setTimeout(resolve, 1500));
    const result = await analyzeArticleText(input);
    if (!result || !result.vocabularyAndPhrases) {
      throw new Error('AI failed to analyze the article.');
    }
    return result;
  } catch (error) {
    console.error('Error analyzing article:', error);
    if (error instanceof Error) {
       if (error.message.includes('503')) {
            throw new Error('The AI model is temporarily overloaded. Please wait a moment and try again.');
        }
      throw new Error(`Failed to analyze article: ${error.message}`);
    }
    throw new Error('An unknown error occurred while analyzing the article.');
  }
}

export async function handleSaveArticle(userId: string, topic: string, content: AnalyzeArticleTextOutput) {
  try {
    await saveNote(userId, topic, 'article-analysis', content);
  } catch (error) {
    console.error("Error saving article analysis:", error);
    if (error instanceof Error) {
      throw new Error(`Failed to save article analysis: ${error.message}`);
    }
    throw new Error('An unknown error occurred while saving the article analysis.');
  }
}
