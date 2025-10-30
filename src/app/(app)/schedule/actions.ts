
'use server';

import {
  generateStudySchedule,
  type GenerateStudyScheduleInput,
  type GenerateStudyScheduleOutput,
} from '@/ai/flows/generate-study-schedule';

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
