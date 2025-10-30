import { config } from 'dotenv';
config();

import '@/ai/flows/generate-flashcards-from-text.ts';
import '@/ai/flows/generate-quiz-from-uploaded-text.ts';
import '@/ai/flows/generate-study-schedule.ts';
import '@/ai/flows/generate-study-notes.ts';
import '@/ai/flows/generate-notes-from-pdf.ts';
import '@/ai/flows/generate-notes-from-url.ts';
import '@/ai/flows/transform-notes.ts';
import '@/ai/flows/analyze-article-text.ts';
import '@/ai/flows/generate-text.ts';
import '@/ai/flows/generate-daily-study-plan.ts';
import '@/ai/flows/schemas.ts';
import '@/ai/flows/analyze-video-for-footfall.ts';