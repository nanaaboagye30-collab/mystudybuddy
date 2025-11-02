'use server';

/**
 * @fileOverview Study schedule generation flow.
 *
 * - generateStudySchedule - A function that generates a personalized study schedule based on exam dates, subjects, and availability.
 * - GenerateStudyScheduleInput - The input type for the generateStudyScheduleInput function.
 * - GenerateStudyScheduleOutput - The return type for the generateStudySchedule function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateStudyScheduleInputSchema = z.object({
  examDates: z
    .string()
    .describe('The date of the exam, format as YYYY-MM-DD'),
  subjects: z.string().describe('The subjects to study for the exam.'),
  availability: z
    .string()
    .describe(
      'The user availability in hours per day. Example: 2 hours on weekdays, 4 hours on weekends'
    ),
});

export type GenerateStudyScheduleInput = z.infer<
  typeof GenerateStudyScheduleInputSchema
>;

const GenerateStudyScheduleOutputSchema = z.object({
  month: z.string().describe('The month for which the schedule is generated, e.g., "SEPTEMBER".'),
  schedule: z.array(
    z.object({
      time: z.string().describe('The time slot for the study session, e.g., "8 to 11".'),
      subject: z.string().describe('The subject or task for the session.'),
      week1: z.string().describe('The task for week 1. Empty string if no task.'),
      week2: z.string().describe('The task for week 2. Empty string if no task.'),
      week3: z.string().describe('The task for week 3. Empty string if no task.'),
      week4: z.string().describe('The task for week 4. Empty string if no task.'),
    })
  ).describe('The generated weekly study schedule in a structured grid format for a month.'),
});


export type GenerateStudyScheduleOutput = z.infer<
  typeof GenerateStudyScheduleOutputSchema
>;

export async function generateStudySchedule(
  input: GenerateStudyScheduleInput
): Promise<GenerateStudyScheduleOutput> {
  return generateStudyScheduleFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateStudySchedulePrompt',
  input: {schema: GenerateStudyScheduleInputSchema},
  output: {schema: GenerateStudyScheduleOutputSchema},
  prompt: `You are a study schedule generator. Your task is to create a detailed, 4-week study plan for a given month in a grid format.

Based on the provided subjects and user availability, you must generate a schedule organized by time slots and subjects for each of the four weeks.

1.  **Structure the Output:** The output must be a structured object.
2.  **Set the Month:** The 'month' field should be set to the month of the exam (e.g., "SEPTEMBER").
3.  **Create Schedule Rows:** Each item in the 'schedule' array represents a row and must contain:
    *   A 'time' slot (e.g., "8 to 11", "13 to 15").
    *   The 'subject' to be studied at that specific time.
    *   The tasks for 'week1', 'week2', 'week3', and 'week4'. If there is no task for a week, the value should be an empty string.
4.  **Distribute the Workload:** Logically distribute the study subjects and tasks throughout the weeks.

Subjects: {{{subjects}}}
Availability: {{{availability}}}`,
});

const generateStudyScheduleFlow = ai.defineFlow(
  {
    name: 'generateStudyScheduleFlow',
    inputSchema: GenerateStudyScheduleInputSchema,
    outputSchema: GenerateStudyScheduleOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
