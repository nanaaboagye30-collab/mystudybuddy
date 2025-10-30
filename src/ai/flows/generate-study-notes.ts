
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
  prompt: `You are a world-class academic assistant, known for your ability to synthesize complex information into structured, highly-detailed study notes.

Your task is to transform the provided text into a comprehensive study guide using markdown. You must follow the specified format precisely.

**Output Format Requirements:**

1.  **Main Sections:** The notes MUST include the following H2 sections in this order: \`## BACKGROUND\`, \`## KEY POINTS\`, and \`## SUMMARY\`.
2.  **BACKGROUND Section:** Briefly outline the Field, Goal, and Scope of the topic.
3.  **KEY POINTS Section:**
    *   This section MUST contain the following H3 sub-sections as numbered items: \`1. Key Concepts\`, \`2. Definitions\`, \`3. Processes & Frameworks\`, \`4. Metrics & Structures\`, \`5. Best Practices & Pitfalls\`, \`6. Action Items\`, \`7. Open Questions\`.
    *   Use a hierarchical structure (e.g., \`a.\`, \`i.\`) for deep detail within each sub-section.
    *   Provide exhaustive and comprehensive details for each point, as shown in the example below.
4.  **SUMMARY Section:** Provide a concise, one-paragraph summary of the most critical information.

**Example of Expected Detail Level:**
\`\`\`markdown
## BACKGROUND
- Field → Real Estate Investment & Market Dynamics
- Goal → Understand drivers of land value, market forces, growth opportunities, asset lifecycles, market dynamics, and cycle-specific investment strategies.
- Scope → Urban land economics, real estate markets (space & asset), property/neighborhood/city lifecycles, and the 18-Year Real Estate Cycle.

## KEY POINTS
1. Key Concepts
   a. Land Value Drivers → Location, scarcity, demand vs. supply, and accessibility.
   b. Market Forces Shaping Land Use → Population growth, income, zoning, interest rates, economic activity determine the highest and best use of land.
   ...
2. Definitions
   a. Highest and Best Use → The most profitable and physically possible use of a property, legally permissible, and financially feasible.
   b. Path of Progress → The tendency for growth and development to extend into areas adjacent to already-developed zones.
   ...
3. Processes & Frameworks
   a. The 18-Year Real Estate Cycle Phases
      i. Recovery (Years 1-7 approx.) → Market coming out of downturn, high but declining vacancies, flat/slowly rising rents, minimal new construction.
      ii. Expansion (Years 8-14 approx.) → Demand for space grows, falling vacancies, strong rent growth, increasing property values, accelerating new construction.
      ...
4. Metrics & Structures
   a. Vacancy Rates → Key indicator of demand vs. supply in the space market.
   b. Rent Growth → Primary driver of property income and asset market valuations.
   c. Debt Service Coverage Ratio (DSCR) → A measure of the cash flow available to pay current debt obligations.
...
\`\`\`

The final output must be a single string containing the complete, detailed notes in markdown.

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
