'use client';

import { useState } from 'react';
import type { GenerateFlashcardsFromTextOutput } from '@/ai/flows/generate-flashcards-from-text';
import { FlashcardGenerator } from '@/components/flashcard-generator';
import { FlashcardViewer } from '@/components/flashcard-viewer';

export default function FlashcardsPage() {
  const [flashcardData, setFlashcardData] = useState<GenerateFlashcardsFromTextOutput | null>(null);

  const handleRestart = () => {
    setFlashcardData(null);
  };

  return (
    <div className="container mx-auto py-6">
      {flashcardData ? (
        <FlashcardViewer data={flashcardData} onRestart={handleRestart} />
      ) : (
        <FlashcardGenerator onFlashcardsGenerated={setFlashcardData} />
      )}
    </div>
  );
}
