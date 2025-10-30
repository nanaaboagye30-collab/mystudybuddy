'use server';
/**
 * @fileOverview Daily study plan generation flow.
 *
 * - generateDailyStudyPlan - A function that generates a daily study plan for a given week.
 * - GenerateDailyStudyPlanInput - The input type for the generateDailyStudyPlan function.
 * - GenerateDailyStudyPlanOutput - The return type for the generateDailyStudyPlan function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateDailyStudyPlanInputSchema = z.object({
  subject: z.string().describe('The subject to study.'),
  weeklyTopic: z.string().describe('The topic or tasks for the entire week.'),
  weekNumber: z.number().min(1).max(4).describe('The week number (1-4).'),
});

export type GenerateDailyStudyPlanInput = z.infer<
  typeof GenerateDailyStudyPlanInputSchema
>;

const GenerateDailyStudyPlanOutputSchema = z.object({
  weeklySchedule: z.array(
    z.object({
      time: z.string().describe('The time slot for the study session, e.g., "8 to 11".'),
      course: z.string().describe('The course or subject for that time slot.'),
      monday: z.string().describe("Task for Monday. Empty if no task."),
      tuesday: z.string().describe("Task for Tuesday. Empty if no task."),
      wednesday: z.string().describe("Task for Wednesday. Empty if no task."),
      thursday: z.string().describe("Task for Thursday. Empty if no task."),
      friday: z.string().describe("Task for Friday. Empty if no task."),
      saturday: z.string().describe("Task for Saturday. Empty if no task."),
      sunday: z.string().describe("Task for Sunday. Empty if no task."),
    })
  ).describe("The structured weekly study schedule in a grid format.")
});


export type GenerateDailyStudyPlanOutput = z.infer<
  typeof GenerateDailyStudyPlanOutputSchema
>;

export async function generateDailyStudyPlan(
  input: GenerateDailyStudyPlanInput
): Promise<GenerateDailyStudyPlanOutput> {
  return generateDailyStudyPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDailyStudyPlanPrompt',
  input: {schema: GenerateDailyStudyPlanInputSchema},
  output: {schema: GenerateDailyStudyPlanOutputSchema},
  prompt: `You are an expert academic planner. Your task is to take a list of subjects and create a detailed weekly study schedule in a grid format for a specific week.

You must structure the output as a list of time slots. For each time slot, you must specify the course and the tasks for each day of the week (Monday to Sunday). If there is no task for a particular day in a time slot, the value should be an empty string.

Subjects: {{{subject}}}
Week {{{weekNumber}}} Topic: {{{weeklyTopic}}}

Generate a detailed plan in the requested grid format.
`,
});

const generateDailyStudyPlanFlow = ai.defineFlow(
  {
    name: 'generateDailyStudyPlanFlow',
    inputSchema: GenerateDailyStudyPlanInputSchema,
    outputSchema: GenerateDailyStudyPlanOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
