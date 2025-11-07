// src/app/(app)/schedule/actions.ts
'use server';

// Imports for Generate Study Schedule
import {
  generateStudySchedule,
  type GenerateStudyScheduleInput,
  type GenerateStudyScheduleOutput, // This type is imported here
} from '@/ai/flows/generate-study-schedule';

// --- START OF REQUIRED CORRECTION ---
// We need to explicitly re-export GenerateStudyScheduleOutput from this file
// so that other modules (like schedule-generator.tsx) can import it from here.
export { type GenerateStudyScheduleOutput };
// --- END OF REQUIRED CORRECTION ---


// Imports for Generate Daily Study Plan
import {
  generateDailyStudyPlan,
  type GenerateDailyStudyPlanInput,
  type GenerateDailyStudyPlanOutput,
} from '@/ai/flows/generate-daily-study-plan';

// Imports for Goal Management
import { getGoalsForUser, saveGoals, type ClientGoal } from '@/services/goals-service';

// --- ENSURE 'export' IS PRESENT FOR ALL FUNCTIONS ---

// Server action to generate a high-level study schedule
export async function handleGenerateStudySchedule(
  input: GenerateStudyScheduleInput
): Promise<GenerateStudyScheduleOutput | { error: string }> {
  try {
    const result = await generateStudySchedule(input);
    if (!result) {
      return { error: 'AI failed to generate a study schedule.' };
    }
    // Type narrowing: Ensure 'result' matches the success output if there's no error field
    if ('error' in result) {
      return result; // It's already an error object
    }
    return result; // It's a GenerateStudyScheduleOutput
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

// Server action to generate a detailed daily study plan
export async function handleGenerateDailyStudyPlan(
  input: GenerateDailyStudyPlanInput
): Promise<GenerateDailyStudyPlanOutput | { error: string }> {
  try {
    const result = await generateDailyStudyPlan(input);
    if (!result) {
      return { error: 'AI failed to generate a daily study plan.' };
    }
    // Type narrowing
    if ('error' in result) {
      return result;
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

// Server action to save user goals
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

// Server action to retrieve user goals
export async function handleGetGoals(userId: string): Promise<ClientGoal[] | { error: string }> {
    try {
        const goals = await getGoalsForUser(userId);
        // Assuming getGoalsForUser returns ClientGoal[] or throws an error
        return goals;
    } catch(error) {
        console.error('Error getting goals:', error);
        const errorMessage = error instanceof Error ? error.message : 'Could not retrieve your saved goals.';
        return { error: errorMessage };
    }
}
