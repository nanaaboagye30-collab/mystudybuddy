
'use server';
/**
 * @fileOverview An AI agent that creates structured study notes using the Outline Method.
 *
 * - generateStudyNotes - A function that handles the note generation process.
 * - GenerateStudyNotesInput - The input type for the generateStudyNotes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { GenerateStudyNotesOutputSchema, type GenerateStudyNotesOutput } from './schemas';

const GenerateStudyNotesInputSchema = z.object({
  text: z.string().describe('The text to generate notes from.'),
});
export type GenerateStudyNotesInput = z.infer<typeof GenerateStudyNotesInputSchema>;


export async function generateStudyNotes(input: GenerateStudyNotesInput): Promise<GenerateStudyNotesOutput> {
  return generateStudyNotesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateStudyNotesPrompt',
  input: {schema: GenerateStudyNotesInputSchema},
  output: {schema: GenerateStudyNotesOutputSchema},
  prompt: `You are a world-class academic assistant with the analytical rigor of a Harvard professor. Your task is to not just summarize, but to critically analyze the provided text and transform it into a comprehensive study guide using markdown. You must follow the specified format precisely.

### "A-Level" Analysis Mandate:
Your output must go beyond simple extraction. You are expected to:
1.  **Synthesize Connections:** Identify and articulate relationships between different concepts in the text, even if not explicitly stated.
2.  **Inject Critical Insights:** Add 'A-Level Insight' callouts where you can provide deeper context, identify an unstated assumption, or offer a critique. For example, if the text praises a business process, you might add an insight about its potential scalability challenges or ethical implications.
3.  **Elevate the Analysis:** Frame the information in a way that reveals underlying principles and frameworks. Do not just list facts; explain their significance.

### Output Format Requirements:

1.  **Main Sections:** The notes MUST include the following H2 sections in this order: \`## BACKGROUND\`, \`## KEY POINTS\`, and \`## SUMMARY\`.
2.  **BACKGROUND Section:** This section MUST be structured with the following three labels, each on its own line: \`Field:\`, \`Goal:\`, and \`Scope:\`. Briefly outline each one.
3.  **KEY POINTS Section:**
    *   This section MUST contain the following H3 sub-sections as numbered items: \`1. Key Concepts\`, \`2. Definitions\`, \`3. Processes & Frameworks\`, \`4. Metrics & Structures\`, \`5. Best Practices & Pitfalls\`, \`6. Action Items\`, \`7. Open Questions\`.
    *   Use a hierarchical structure (e.g., \`a.\`, \`i.\`) for deep detail within each sub-section.
    *   Where appropriate, add a clearly marked blockquote for an \`> **A-Level Insight:** [Your critical commentary here]\`.
4.  **SUMMARY Section:** Provide a concise, one-paragraph summary of the most critical information and its implications.

**Example of Expected Detail and Insight:**
\`\`\`markdown
## KEY POINTS
1. Key Concepts
   a. Data Analytics Market Growth → Projected to reach $105.08 billion by 2027.
   b. Demand for Data Analysts → Current demand significantly outweighs supply.
      > **A-Level Insight:** The text frames this as a simple supply/demand issue. However, this high demand is also driven by the increasing accessibility of data tools, which paradoxically creates a wider skills gap between tool users and true analytical thinkers.
...
3. Processes & Frameworks
   a. The Six Phases of the Data Analysis Process
      i. Ask → Define the problem and desired outcomes.
      ii. Prepare → Gather and verify data.
         > **A-Level Insight:** The text presents this as a linear step. In reality, the 'Prepare' phase is often iterative with the 'Ask' phase. Initial data exploration frequently forces a re-definition of the original question.
...
\`\`\`

The final output must be a single string containing the complete, critically-analyzed notes in markdown.

Text to analyze:
{{{text}}}
`,
});

const generateStudyNotesFlow = ai.defineFlow(
  {
    name: 'generateStudyNotesFlow',
    inputSchema: GenerateStudyNotesInputSchema,
    outputSchema: GenerateStudyNotesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
