
'use server';

import {
  generateDailyStudyPlan,
  type GenerateDailyStudyPlanInput,
  type GenerateDailyStudyPlanOutput,
} from '@/ai/flows/generate-daily-study-plan';

export async function handleGenerateDailyPlan(input: GenerateDailyStudyPlanInput): Promise<GenerateDailyStudyPlanOutput> {
  try {
    const result = await generateDailyStudyPlan(input);
    if (!result || !result.weeklySchedule) {
      throw new Error('AI failed to generate a daily plan.');
    }
    return result;
  } catch (error) {
    console.error('Error generating daily plan:', error);
    if (error instanceof Error) {
        if (error.message.includes('503')) {
            throw new Error('The AI model is temporarily overloaded. Please wait a moment and try again.');
        }
        throw new Error(`Failed to generate daily plan: ${error.message}`);
    }
    throw new Error('An unknown error occurred while generating the daily plan.');
  }
}
