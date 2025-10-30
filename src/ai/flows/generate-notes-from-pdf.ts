
'use server';
/**
 * @fileOverview A note generation AI agent that creates notes from a PDF.
 *
 * - generateNotesFromPdf - A function that handles the note generation process from a PDF.
 * - GenerateNotesFromPdfInput - The input type for the generateNotesFromPdf function.
 * - GenerateStudyNotesOutput - The return type for the generateNotesFromPfd function (shared with text-based generation).
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { GenerateStudyNotesOutputSchema, type GenerateStudyNotesOutput } from './schemas';

const GenerateNotesFromPdfInputSchema = z.object({
  pdf: z.string().describe("A PDF file encoded as a data URI. Expected format: 'data:application/pdf;base64,<encoded_data>'."),
});
export type GenerateNotesFromPdfInput = z.infer<typeof GenerateNotesFromPdfInputSchema>;

export async function generateNotesFromPdf(input: GenerateNotesFromPdfInput): Promise<GenerateStudyNotesOutput> {
  return generateNotesFromPdfFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateNotesFromPdfPrompt',
  input: {schema: GenerateNotesFromPdfInputSchema},
  output: {schema: GenerateStudyNotesOutputSchema},
  prompt: `You are a world-class academic assistant, known for your ability to synthesize complex information into structured, highly-detailed study notes.

Your task is to transform the provided PDF content into a comprehensive study guide using markdown. You must follow the specified format precisely.

**Output Format Requirements:**

1.  **Main Sections:** The notes MUST include the following H2 sections in this order: \`## BACKGROUND\`, \`## KEY POINTS\`, and \`## SUMMARY\`.
2.  **BACKGROUND Section:** Briefly outline the Field, Goal, and Scope of the topic.
3.  **KEY POINTS Section:**
    *   This section MUST contain the following H3 sub-sections as numbered items: \`1. Key Concepts\`, \`2. Definitions\`, \`3. Processes & Frameworks\`, \`4. Metrics & Structures\`, \`5. Best Practices & Pitfalls\`, \`6. Action Items\`, \`7. Open Questions\`.
    *   Use a hierarchical structure (e.g., \`a.\`, \`i.\`) for deep detail within each sub-section.
    *   Provide exhaustive and comprehensive details for each point.
4.  **SUMMARY Section:** Provide a concise, one-paragraph summary of the most critical information.

PDF Content:
{{media url=pdf}}
`,
});

const generateNotesFromPdfFlow = ai.defineFlow(
  {
    name: 'generateNotesFromPdfFlow',
    inputSchema: GenerateNotesFromPdfInputSchema,
    outputSchema: GenerateStudyNotesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
