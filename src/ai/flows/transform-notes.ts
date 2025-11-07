
'use server';
/**
 * @fileOverview An AI agent that transforms detailed notes into other formats.
 *
 * - transformNotes - A function that handles the note transformation process.
 */

import {ai} from '@/ai/genkit';
import { z } from 'genkit';
import { 
    GenerateTransformedNotesInputSchema, 
    type GenerateTransformedNotesInput,
    GenerateFlashcardsFromNotesInputSchema,
    GenerateFlashcardsFromNotesOutputSchema,
    type GenerateFlashcardsFromNotesOutput,
    GenerateSummaryOutputSchema,
    type GenerateSummaryOutput
} from './schemas';


const summaryPrompt = ai.definePrompt({
    name: 'summaryPrompt',
    input: { schema: GenerateTransformedNotesInputSchema },
    output: { schema: GenerateSummaryOutputSchema },
    prompt: `You are an expert academic assistant who creates powerful, one-page "cheat sheet" summaries from detailed study notes. Your work is "A-Level" quality, focusing on deep understanding and memorability.

Your task is to transform the provided notes into a highly structured, scannable summary using markdown. You must follow all instructions precisely.

### CRITICAL INSTRUCTIONS:
1.  **FILL ALL SECTIONS:** You MUST populate every single section of the summary template. DO NOT leave any sections or tables empty. This is not optional.
2.  **FIRST, EXTRACT & POPULATE KEY CONCEPTS:** Your first step is to identify all "Key Concepts" from the notes. You MUST create a markdown table with headers "Concept" and "Short Phrase / Keyword" and populate it in the "Key Concepts" section.
3.  **SECOND, EXTRACT & POPULATE DEFINITIONS:** Your second step is to identify all "Definitions" from the notes. You MUST create a markdown table with headers "Term" and "Concise Definition / Keyword" and populate it in the "Definitions" section.
4.  **APPLY MEMORY AIDS:** For the "Processes & Frameworks" section, you MUST select and apply the most effective memory aid (e.g., Mnemonic, Flowchart, Table) to explain the process.

### Output Format Requirements:

1.  **TITLE:** Start with a short, memorable title and a CREATIVE, MEMORABLE MNEMONIC in parentheses. e.g., \`### Real Estate Cycle & Investment Strategy (Recession Expands, Peaks, Contracts)\`
2.  **BACKGROUND:**
    *   Field: [Short phrase]
    *   Goal: [Short phrase]
    *   Scope: [Short phrase]
3.  **Key Concepts:** A markdown table with headers "Concept" and "Short Phrase / Keyword". **This section MUST be filled out completely.**
4.  **Definitions:** A markdown table with headers "Term" and "Concise Definition / Keyword". **This section MUST be filled out completely.**
5.  **Processes & Frameworks:**
    *   Detail ALL major processes from the notes. For multi-step processes like the **18-Year Real Estate Cycle**, you MUST list out each phase and its key characteristics.
    *   Include a "Case Study / Example" line.
    *   You MUST select and apply the best memory aid for complex processes or lists. See "How to Generate Study Aids" below for methods. For example, if there is a multi-step process, create a table or a flowchart.
6.  **Metrics & Structures:** Use a markdown table with headers "Metric" and "Purpose / Short Description".
7.  **Best Practices & Pitfalls:** Use a markdown table with headers "Type" and "Item".
8.  **Action Items:** Use checkbox syntax (\`☐ [Action Item]\`).
9.  **Open Questions:** Use a question mark emoji (\`❓ [Question]\`).
10. **CLARITY TEST / SUMMARY:**
    *   Provide a 1-2 sentence distilled summary.
    *   List the "Top 3 Takeaways".

### How to Generate Study Aids (Choose the BEST one for the context):
1.  **Mnemonics (Creative & Memorable):** Create a memorable sentence.
    *   *Good Example:* Process: Collect, Clean, Analyze, Visualize -> Mnemonic: "Clever Cats Always Visualize"
2.  **Tables:** Convert bullet points into a 3–5 column matrix (e.g., | Step | Purpose | Example |).
3.  **Flowcharts / Process Flows (Text-based):** Represent sequential steps with arrows (e.g., "Step 1 → Step 2 → Step 3.").
4.  **Mind Maps / Visual Linkages (Text-based):** Describe the visual linkage (e.g., "Mind Map: Main Topic -> Sub-Concept -> Detail.").


The final output must be a single markdown string.

Detailed Study Notes:
{{{notes}}}
`
});


const flashcardsPrompt = ai.definePrompt({
  name: 'generateFlashcardsFromNotesPrompt',
  input: { schema: GenerateFlashcardsFromNotesInputSchema },
  output: { schema: GenerateFlashcardsFromNotesOutputSchema },
  prompt: `You are an expert in creating flashcards from study notes. Based on the notes provided, generate a series of questions and answers.

The output should be a JSON object containing an array of flashcard objects, where each object has a 'question' and an 'answer' field.

Detailed Study Notes:
{{{notes}}}
`
});


export async function transformNotes(input: GenerateTransformedNotesInput): Promise<GenerateSummaryOutput | GenerateFlashcardsFromNotesOutput | { error: string }> {
  return transformNotesFlow(input);
}


const transformNotesFlow = ai.defineFlow(
  {
    name: 'transformNotesFlow',
    inputSchema: GenerateTransformedNotesInputSchema,
    outputSchema: GenerateSummaryOutputSchema.or(GenerateFlashcardsFromNotesOutputSchema).or(z.object({ error: z.string() })),
  },
  async (input) => {
    switch (input.format) {
        case 'summary': {
            const { output } = await summaryPrompt(input);
            if (!output) {
                return { error: 'The AI failed to generate the summary. Please try again.' };
            }
            return output;
        }
        case 'flashcards': {
            const { output } = await flashcardsPrompt({ notes: input.notes });
             if (!output) {
                return { error: 'The AI failed to generate flashcards. Please try again.' };
            }
            return output;
        }
        default:
             return { error: 'Invalid or unsupported transformation format specified.' };
    }
  }
);
