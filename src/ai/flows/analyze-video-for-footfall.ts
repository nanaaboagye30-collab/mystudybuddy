'use server';
/**
 * @fileOverview An AI agent that analyzes video frames to count people.
 *
 * - analyzeVideoForFootfall - A function that handles the video analysis process.
 * - AnalyzeVideoForFootfallInput - The input type for the analyzeVideoForFootfall function.
 * - AnalyzeVideoForFootfallOutput - The return type for the analyzeVideoForFootfall function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeVideoForFootfallInputSchema = z.object({
  videoFrameDataUri: z
    .string()
    .describe(
      "A single frame from a video feed, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeVideoForFootfallInput = z.infer<typeof AnalyzeVideoForFootfallInputSchema>;

const AnalyzeVideoForFootfallOutputSchema = z.object({
  personCount: z.number().min(0).describe('The number of people detected in the video frame.'),
});
export type AnalyzeVideoForFootfallOutput = z.infer<typeof AnalyzeVideoForFootfallOutputSchema>;

export async function analyzeVideoForFootfall(input: AnalyzeVideoForFootfallInput): Promise<AnalyzeVideoForFootfallOutput> {
  return analyzeVideoForFootfallFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeVideoForFootfallPrompt',
  input: {schema: AnalyzeVideoForFootfallInputSchema},
  output: {schema: AnalyzeVideoForFootfallOutputSchema},
  prompt: `You are an AI system designed to monitor a retail store's entrance for footfall.

Your task is to analyze the provided image, which is a single frame from a video feed, and count the number of distinct people visible.

- Only count people. Do not count mannequins, reflections, or images of people.
- Provide only the total number of people detected in the 'personCount' field.

Image to analyze:
{{media url=videoFrameDataUri}}`,
});

const analyzeVideoForFootfallFlow = ai.defineFlow(
  {
    name: 'analyzeVideoForFootfallFlow',
    inputSchema: AnalyzeVideoForFootfallInputSchema,
    outputSchema: AnalyzeVideoForFootfallOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
