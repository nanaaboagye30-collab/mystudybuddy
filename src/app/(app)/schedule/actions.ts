
'use server';

import {
  generateStudySchedule,
  type GenerateStudyScheduleInput,
  type GenerateStudyScheduleOutput,
} from '@/ai/flows/generate-study-schedule';

<<<<<<< HEAD
import {
  generateDailyStudyPlan,
  type GenerateDailyStudyPlanInput,
  type GenerateDailyStudyPlanOutput,
} from '@/ai/flows/generate-daily-study-plan';

import { getGoalsForUser, saveGoals, type ClientGoal } from '@/services/goals-service';

export async function handleGenerateStudySchedule(
  input: GenerateStudyScheduleInput
): Promise<GenerateStudyScheduleOutput | { error: string }> {
  try {
    const result = await generateStudySchedule(input);
    if (!result) {
      return { error: 'AI failed to generate a study schedule.' };
    }
    return result;
  } catch (error) {
    console.error('Error generating study schedule:', error);
    let errorMessage = 'An unknown error occurred while generating the schedule.';
    if (error instanceof Error) {
        if (error.message.includes('503')) {
            errorMessage = 'The AI model is temporarily overloaded. Please wait a moment and try again.';
        } else {
            errorMessage = `Failed to generate schedule: ${error.message}`;
        }
    }
    return { error: errorMessage };
  }
}


export async function handleGenerateDailyStudyPlan(
  input: GenerateDailyStudyPlanInput
): Promise<GenerateDailyStudyPlanOutput | { error: string }> {
  try {
    const result = await generateDailyStudyPlan(input);
    if (!result) {
      return { error: 'AI failed to generate a daily study plan.' };
    }
    return result;
  } catch (error) {
    console.error('Error generating daily study plan:', error);
    let errorMessage = 'An unknown error occurred while generating the daily plan.';
     if (error instanceof Error) {
        if (error.message.includes('503')) {
            errorMessage = 'The AI model is temporarily overloaded. Please wait a moment and try again.';
        } else {
            errorMessage = `Failed to generate daily plan: ${error.message}`;
        }
    }
    return { error: errorMessage };
  }
}

export async function handleSaveGoals(userId: string, goals: ClientGoal[]): Promise<{ success: boolean; error?: string }> {
    try {
        await saveGoals(userId, goals);
        return { success: true };
    } catch(error) {
        console.error('Error saving goals:', error);
        const errorMessage = error instanceof Error ? error.message : 'Could not save goals to your profile.';
        return { success: false, error: errorMessage };
    }
}

export async function handleGetGoals(userId: string): Promise<ClientGoal[] | { error: string }> {
    try {
        return await getGoalsForUser(userId);
    } catch(error) {
        console.error('Error getting goals:', error);
        const errorMessage = error instanceof Error ? error.message : 'Could not retrieve your saved goals.';
        return { error: errorMessage };
    }
}
=======
export async function handleGenerateSchedule(input: GenerateStudyScheduleInput): Promise<GenerateStudyScheduleOutput> {
  try {
    const result = await generateStudySchedule(input);
    if (!result || !result.schedule) {
      throw new Error('AI failed to generate a schedule.');
    }
    return result;
  } catch (error) {
    console.error('Error generating schedule:', error);
    if (error instanceof Error) {
        if (error.message.includes('503')) {
            throw new Error('The AI model is temporarily overloaded. Please wait a moment and try again.');
        }
        throw new Error(`Failed to generate schedule: ${error.message}`);
    }
    throw new Error('An unknown error occurred while generating the schedule.');
  }
}
>>>>>>> cb4c034c204ea3197443d50d39cc11865d10f9d0
