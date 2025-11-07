// src/app/(app)/quiz/actions.ts
'use server'; // This must be at the very top for Server Actions

import {
  generateQuiz,
  type GenerateQuizInput,
  type GenerateQuizOutput,
  type GenerateQuizSuccessOutput, // Needed for handleSaveQuiz type
} from '@/ai/flows/generate-quiz-from-uploaded-text';

// If you have Firebase Admin SDK initialization, it would typically be here or in a separate util file.
// import { getFirestore } from 'firebase-admin/firestore';
// import { adminApp } from '@/lib/firebase-admin'; // Assuming you have an admin app initialized
// const db = getFirestore(adminApp);

// Exported function for generating a quiz
export async function handleGenerateQuiz(input: GenerateQuizInput): Promise<GenerateQuizOutput> {
  try {
    // This `setTimeout` can be for simulating network delay or other async server work.
    await new Promise(resolve => setTimeout(resolve, 1500));

    const result: GenerateQuizOutput = await generateQuiz(input);
    return result;

  } catch (error) {
    console.error('Error caught in handleGenerateQuiz (server action):', error);
    return { error: error instanceof Error ? error.message : 'An unexpected server error occurred during quiz generation.' };
  }
}

// Exported function for saving a quiz
export async function handleSaveQuiz(quizData: GenerateQuizSuccessOutput): Promise<{ success: boolean; message: string; quizId?: string }> {
  try {
    console.log('Attempting to save quiz:', quizData);

    // --- REPLACE THIS MOCK IMPLEMENTATION WITH YOUR ACTUAL DATABASE SAVE LOGIC ---
    // Example using Cloud Firestore (assuming it's initialized elsewhere or here)
    // For example:
    // const quizzesCollection = db.collection('quizzes');
    // const newQuizRef = await quizzesCollection.add({
    //   ...quizData,
    //   createdAt: new Date(),
    //   // userId: currentUser.uid, // Add user ID if you have authentication
    // });
    // const quizId = newQuizRef.id;

    // Simulate saving to a database
    await new Promise(resolve => setTimeout(resolve, 1000));
    const mockQuizId = `quiz-${Date.now()}`; // Generate a mock ID

    console.log(`Quiz saved successfully with ID: ${mockQuizId}`);
    return { success: true, message: 'Quiz saved successfully!', quizId: mockQuizId };

  } catch (error) {
    console.error('Error saving quiz:', error);
    return { success: false, message: error instanceof Error ? `Failed to save quiz: ${error.message}` : 'An unknown error occurred while saving the quiz.' };
  }
}
