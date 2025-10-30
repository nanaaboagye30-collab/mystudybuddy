'use client';

import { useState } from 'react';
import type { GenerateQuizOutput } from '@/ai/flows/generate-quiz-from-uploaded-text';
import { QuizGenerator } from '@/components/quiz-generator';
import { QuizPlayer } from '@/components/quiz-player';

export default function QuizPage() {
  const [quizData, setQuizData] = useState<GenerateQuizOutput | null>(null);

  const handleRestart = () => {
    setQuizData(null);
  };

  return (
    <div className="container mx-auto py-6">
      {quizData ? (
        <QuizPlayer data={quizData} onRestart={handleRestart} />
      ) : (
        <QuizGenerator onQuizGenerated={setQuizData} />
      )}
    </div>
  );
}
