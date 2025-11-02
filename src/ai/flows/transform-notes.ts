
'use server';
/**
 * @fileOverview An AI agent that transforms detailed notes into other formats.
 *
 * - transformNotes - A function that handles the note transformation process.
 */

import {ai} from '@/ai/genkit';
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
<<<<<<< HEAD
    prompt: `You are an expert academic assistant who creates powerful, one-page "cheat sheet" summaries from detailed study notes. Your work is "A-Level" quality, focusing on deep understanding and memorability.

Your task is to transform the provided notes into a highly structured, scannable summary using markdown. You must follow all instructions precisely.

### CRITICAL INSTRUCTIONS:
1.  **FILL ALL SECTIONS:** You MUST populate every single section of the summary template. DO NOT leave any sections or tables empty. This is not optional.
2.  **FIRST, EXTRACT & POPULATE KEY CONCEPTS:** Your first step is to identify all "Key Concepts" from the notes. You MUST create a markdown table with headers "Concept" and "Short Phrase / Keyword" and populate it in the "Key Concepts" section.
3.  **SECOND, EXTRACT & POPULATE DEFINITIONS:** Your second step is to identify all "Definitions" from the notes. You MUST create a markdown table with headers "Term" and "Concise Definition / Keyword" and populate it in the "Definitions" section.
4.  **APPLY MEMORY AIDS:** For the "Processes & Frameworks" section, you MUST select and apply the most effective memory aid (e.g., Mnemonic, Flowchart, Table) to explain the process.

### Output Format Requirements:

1.  **TITLE:** Start with a short, memorable title and a CREATIVE, MEMORABLE MNEMONIC in parentheses. e.g., \`### Real Estate Cycle & Investment Strategy (Recession Expands, Peaks, Contracts)\`
=======
    prompt: `You are an expert academic assistant who creates powerful, one-page "cheat sheet" summaries from detailed study notes.

Your task is to transform the provided notes into a highly structured, scannable summary using markdown. You must follow the specified format and developer notes precisely.

### Output Format Requirements:

1.  **TITLE:** Start with a short, memorable title and an optional mnemonic in parentheses. e.g., \`### Real Estate Cycle & Investment Strategy (RE-CIS)\`
>>>>>>> cb4c034c204ea3197443d50d39cc11865d10f9d0
2.  **BACKGROUND:**
    *   Field: [Short phrase]
    *   Goal: [Short phrase]
    *   Scope: [Short phrase]
<<<<<<< HEAD
3.  **Key Concepts:** A markdown table with headers "Concept" and "Short Phrase / Keyword". **This section MUST be filled out completely.**
4.  **Definitions:** A markdown table with headers "Term" and "Concise Definition / Keyword". **This section MUST be filled out completely.**
5.  **Processes & Frameworks:**
    *   Detail ALL major processes from the notes. For multi-step processes like the **18-Year Real Estate Cycle**, you MUST list out each phase and its key characteristics.
    *   Include a "Case Study / Example" line.
    *   You MUST select and apply the best memory aid for complex processes or lists. See "How to Generate Study Aids" below for methods. For example, if there is a multi-step process, create a table or a flowchart.
=======
3.  **Key Concepts:** Use a markdown table with headers "Concept" and "Short Phrase / Keyword".
4.  **Definitions:** Use a markdown table with headers "Term" and "Concise Definition / Keyword".
5.  **Processes & Frameworks:**
    *   Include a "Case Study / Example" line.
    *   For the "18-Year Real Estate Cycle," you MUST create a 2x2 markdown table summarizing the four phases. Each cell in the table must contain the phase name, duration, characteristics, and opportunities, structured exactly like the example below.
    *   For other processes, use a markdown table with headers "Step / Main Point", "Goal / Short Description", and "Subpoints / Memory Aid".
>>>>>>> cb4c034c204ea3197443d50d39cc11865d10f9d0
6.  **Metrics & Structures:** Use a markdown table with headers "Metric" and "Purpose / Short Description".
7.  **Best Practices & Pitfalls:** Use a markdown table with headers "Type" and "Item".
8.  **Action Items:** Use checkbox syntax (\`☐ [Action Item]\`).
9.  **Open Questions:** Use a question mark emoji (\`❓ [Question]\`).
10. **CLARITY TEST / SUMMARY:**
    *   Provide a 1-2 sentence distilled summary.
    *   List the "Top 3 Takeaways".

<<<<<<< HEAD
### How to Generate Study Aids (Choose the BEST one for the context):
1.  **Mnemonics (Creative & Memorable):** Create a memorable sentence.
    *   *Good Example:* Process: Collect, Clean, Analyze, Visualize -> Mnemonic: "Clever Cats Always Visualize"
2.  **Tables:** Convert bullet points into a 3–5 column matrix (e.g., | Step | Purpose | Example |).
3.  **Flowcharts / Process Flows (Text-based):** Represent sequential steps with arrows (e.g., "Step 1 → Step 2 → Step 3.").
4.  **Mind Maps / Visual Linkages (Text-based):** Describe the visual linkage (e.g., "Mind Map: Main Topic -> Sub-Concept -> Detail.").


=======
### Example for 18-Year Real Estate Cycle 2x2 Table:
| 1. Recovery (1-7 years) | 2. Expansion (8-14 years) |
| :--- | :--- |
| **Characteristics:**<br/>- Market emerges from downturn.<br/>- Vacancies high, start decline.<br/>- Rents flat/slow increases.<br/>- New construction minimal.<br/>**Opportunities:**<br/>1. Buy distressed/undervalued assets.<br/>2. Renovate/reposition existing properties.<br/>3. Lock in favorable long-term financing. | **Characteristics:**<br/>- Demand for space grows, vacancies fall.<br/>- Rents rise strongly, property values increase.<br/>- New construction accelerates.<br/>- Optimism fuels investment.<br/>**Opportunities:**<br/>1. Develop new projects.<br/>2. Secure strong tenants, long leases.<br/>3. Use leverage wisely. |
| **3. Hyper-Supply (15-17 years)** | **4. Recession (18+ years)** |
| **Characteristics:**<br/>- Excessive new construction -> oversupply.<br/>- Vacancies begin to rise.<br/>- Rent growth slows/ceases.<br/>- Late buyers may overpay.<br/>**Opportunities:**<br/>1. Focus on defensive strategies (core assets).<br/>2. Sell speculative/high-risk properties.<br/>3. Diversify into earlier cycle markets. | **Characteristics:**<br/>- Falling rents & rising vacancies.<br/>- Sharp drop in property values.<br/>- Distressed sales increase.<br/>**Opportunities:**<br/>1. Acquire distressed properties (deep discounts).<br/>2. Form partnerships for foreclosed assets.<br/>3. Prepare for next recovery (land banking). |


### Developer Notes & Features:
*   **Hierarchy:** Enforce a 3-layer hierarchy: Main → Sub → Example.
*   **Conciseness:** Use concise bullets (≤12 words).
*   **Distillation:** Apply distillation to extract the core idea only.
*   **Memory Aids:** You MUST choose and apply the best memory aid for complex processes or lists. See "How to Generate Study Aids" below for methods.

### How to Generate Study Aids:
1.  **Mnemonics:** Extract first letters of a sequence to form a memorable word/sentence.
2.  **Tables:** Convert bullet points into a 3–5 column matrix (Step / Purpose / Example).
3.  **Mind Maps / Visual Linkages:** Describe the visual linkage. e.g., "Mind Map: Main Topic -> Sub-Concept -> Detail."
4.  **Flowcharts:** Represent sequential steps with arrows. e.g., "Step 1 → Step 2 → Step 3."

>>>>>>> cb4c034c204ea3197443d50d39cc11865d10f9d0
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


<<<<<<< HEAD
export async function transformNotes(input: GenerateTransformedNotesInput): Promise<GenerateSummaryOutput | GenerateFlashcardsFromNotesOutput | { error: string }> {
=======
export async function transformNotes(input: GenerateTransformedNotesInput): Promise<GenerateSummaryOutput | GenerateFlashcardsFromNotesOutput> {
>>>>>>> cb4c034c204ea3197443d50d39cc11865d10f9d0
  return transformNotesFlow(input);
}


const transformNotesFlow = ai.defineFlow(
  {
    name: 'transformNotesFlow',
    inputSchema: GenerateTransformedNotesInputSchema,
<<<<<<< HEAD
    outputSchema: GenerateSummaryOutputSchema.or(GenerateFlashcardsFromNotesOutputSchema).or(z.object({ error: z.string() })),
=======
    outputSchema: GenerateSummaryOutputSchema.or(GenerateFlashcardsFromNotesOutputSchema),
>>>>>>> cb4c034c204ea3197443d50d39cc11865d10f9d0
  },
  async (input) => {
    switch (input.format) {
        case 'summary': {
            const { output } = await summaryPrompt(input);
            if (!output) {
<<<<<<< HEAD
                return { error: 'The AI failed to generate the summary. Please try again.' };
=======
                throw new Error('The AI failed to generate the summary. Please try again.');
>>>>>>> cb4c034c204ea3197443d50d39cc11865d10f9d0
            }
            return output;
        }
        case 'flashcards': {
            const { output } = await flashcardsPrompt({ notes: input.notes });
             if (!output) {
<<<<<<< HEAD
                return { error: 'The AI failed to generate flashcards. Please try again.' };
=======
                throw new Error('The AI failed to generate flashcards. Please try again.');
>>>>>>> cb4c034c204ea3197443d50d39cc11865d10f9d0
            }
            return output;
        }
        default:
<<<<<<< HEAD
             return { error: 'Invalid or unsupported transformation format specified.' };
    }
  }
);
=======
            throw new Error('Invalid or unsupported transformation format specified.');
    }
  }
);

    
>>>>>>> cb4c034c204ea3197443d50d39cc11865d10f9d0
