// src/components/quiz-player.tsx
'use client'; // Assuming this is a client component

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge'; // Assuming you use your custom Badge
import { useToast } from '@/hooks/use-toast';
import { Check, X, ThumbsUp, ThumbsDown } from 'lucide-react';

// IMPORTANT: Import GenerateQuizSuccessOutput and QuizQuestion type
import type { GenerateQuizSuccessOutput, QuizQuestion } from '@/ai/flows/generate-quiz-from-uploaded-text';

// Define the props for your QuizPlayer component
interface QuizPlayerProps {
  // --- CRITICAL CORRECTION HERE ---
  // The 'data' prop is now explicitly typed as GenerateQuizSuccessOutput
  data: GenerateQuizSuccessOutput;
  onQuizFinish: (score: number, totalQuestions: number) => void;
  // You might also want to pass quiz input data if needed for display or saving
  // quizInputData: GenerateQuizInput;
}

export function QuizPlayer({ data, onQuizFinish }: QuizPlayerProps) {
  const { toast } = useToast();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answerState, setAnswerState] = useState<'unanswered' | 'correct' | 'incorrect'>('unanswered');
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  // Now, 'data.quiz' is safely accessed because 'data' is guaranteed to be GenerateQuizSuccessOutput
  const quiz: QuizQuestion[] = data.quiz;
  const currentQuestion: QuizQuestion = quiz[currentIndex]; // Type assertion for safety
  const totalQuestions = quiz.length;
  const progress = ((currentIndex + (isFinished ? 1 : 0)) / totalQuestions) * 100;

  const handleAnswerSubmit = () => {
    if (!selectedAnswer) {
      toast({
        title: "Please select an answer",
        variant: "destructive",
      });
      return;
    }

    if (selectedAnswer === currentQuestion.answer) {
      setAnswerState('correct');
      setScore(prev => prev + 1);
    } else {
      setAnswerState('incorrect');
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setAnswerState('unanswered');
    } else {
      setIsFinished(true);
      onQuizFinish(score, totalQuestions); // Notify parent that quiz is finished
    }
  };

  return (
    <Card className="max-w-3xl mx-auto mt-8">
      {!isFinished ? (
        <>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Question {currentIndex + 1} of {totalQuestions}</span>
              <Badge variant={answerState === 'correct' ? 'success' : answerState === 'incorrect' ? 'destructive' : 'secondary'}>
                {answerState === 'correct' ? 'Correct!' : answerState === 'incorrect' ? 'Incorrect' : 'Unanswered'}
              </Badge>
            </CardTitle>
            <Progress value={progress} className="mt-2" />
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold mb-4">{currentQuestion.question}</p>
            <div className="grid gap-3">
              {currentQuestion.options.map((option, index) => (
                <Button
                  key={index}
                  variant={selectedAnswer === option ? 'default' : 'outline'}
                  onClick={() => setSelectedAnswer(option)}
                  disabled={answerState !== 'unanswered'}
                  className={`justify-start ${
                    answerState !== 'unanswered' && option === currentQuestion.answer
                      ? 'border-green-500 bg-green-50' // Highlight correct answer
                      : answerState === 'incorrect' && selectedAnswer === option
                      ? 'border-red-500 bg-red-50' // Highlight wrong selected answer
                      : ''
                  }`}
                >
                  {option}
                </Button>
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between mt-4">
            {answerState === 'unanswered' ? (
              <Button onClick={handleAnswerSubmit} disabled={!selectedAnswer}>
                Submit Answer
              </Button>
            ) : (
              <Button onClick={handleNextQuestion}>
                {currentIndex < totalQuestions - 1 ? 'Next Question' : 'Finish Quiz'}
              </Button>
            )}
          </CardFooter>
        </>
      ) : (
        // Quiz finished state (might be moved to parent or a dedicated component)
        <Card className="max-w-3xl mx-auto mt-8 text-center">
          <CardHeader>
            <CardTitle className="text-2xl">Quiz Finished!</CardTitle>
            <CardDescription>You've completed all questions.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold mb-4">Your Score: {score} / {totalQuestions}</p>
            {score / totalQuestions > 0.7 ? (
              <ThumbsUp className="h-16 w-16 mx-auto text-green-500" />
            ) : (
              <ThumbsDown className="h-16 w-16 mx-auto text-red-500" />
            )}
          </CardContent>
          <CardFooter className="flex justify-center gap-4">
            {/* These buttons would typically trigger actions in the parent,
                e.g., reset quiz or save score */}
            <Button onClick={() => onQuizFinish(score, totalQuestions)}>Back to Results/Options</Button>
          </CardFooter>
        </Card>
      )}
    </Card>
  );
}
