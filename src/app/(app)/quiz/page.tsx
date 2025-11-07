// src/app/(app)/quiz/page.tsx
'use client'; // This must be at the top of client components

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, Check, X, FileQuestion, ThumbsUp, ThumbsDown, Save } from 'lucide-react';

// --- CRITICAL CORRECTION: Import QuizGenerator with an alias ---
import { QuizGenerator as QuizFormComponent } from '@/components/quiz-generator'; // <--- Renamed the import here

import { handleGenerateQuiz, handleSaveQuiz } from './actions';
import {
  type GenerateQuizOutput,
  type GenerateQuizInput,
  type GenerateQuizSuccessOutput,
  type QuizQuestion as BaseQuizQuestion
} from '@/ai/flows/generate-quiz-from-uploaded-text';
import { useAuth } from '@/hooks/use-auth';

type QuizQuestion = BaseQuizQuestion;
type AnswerState = 'unanswered' | 'correct' | 'incorrect';

export default function QuizPage() {
  const { toast } = useToast();
  const { user } = useAuth();

  const [quizInput, setQuizInput] = useState<GenerateQuizInput | null>(null);
  const [generatedQuiz, setGeneratedQuiz] = useState<GenerateQuizSuccessOutput | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answerState, setAnswerState] = useState<AnswerState>('unanswered');
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const currentQuestion: QuizQuestion | undefined = generatedQuiz?.quiz[currentQuestionIndex];
  const totalQuestions = generatedQuiz?.quiz.length || 0;
  const progress = totalQuestions > 0 ? (((currentQuestionIndex + 1) / totalQuestions) * 100) : 0;

  const handleQuizGenerated = (data: GenerateQuizSuccessOutput, inputData: GenerateQuizInput) => {
    setGeneratedQuiz(data);
    setQuizInput(inputData);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setAnswerState('unanswered');
    setScore(0);
    setQuizFinished(false);
  };

  const handleAnswerSubmit = () => {
    if (!selectedAnswer || !currentQuestion) return;

    if (selectedAnswer === currentQuestion.answer) {
      setAnswerState('correct');
      setScore(prev => prev + 1);
    } else {
      setAnswerState('incorrect');
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setAnswerState('unanswered');
    } else {
      setQuizFinished(true);
    }
  };

  const handleSaveQuizToProfile = async () => {
    if (!user || !generatedQuiz) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to save your quiz.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const quizToSave = {
        ...generatedQuiz,
        userId: user.uid,
        createdAt: new Date().toISOString(),
        score: score,
        totalQuestions: totalQuestions,
        originalText: quizInput?.text || "N/A",
        difficulty: quizInput?.difficulty || "N/A"
      };

      const result = await handleSaveQuiz(quizToSave);

      if (result.success) {
        toast({
          title: "Quiz Saved!",
          description: result.message,
        });
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error("Error saving quiz:", error);
      toast({
        title: "Failed to Save Quiz",
        description: error instanceof Error ? error.message : "An unknown error occurred while saving the quiz.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };


  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center font-headline">Quiz Time!</h1>

      {generatedQuiz === null ? (
        // --- CRITICAL CORRECTION: Use the aliased name here ---
        <QuizFormComponent onQuizGenerated={(data, inputData) => {
            handleQuizGenerated(data, inputData);
        }} />
      ) : (
        <>
          {quizFinished && generatedQuiz ? (
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
                <Button onClick={() => {
                  setQuizInput(null);
                  setGeneratedQuiz(null);
                }}>
                  Generate New Quiz
                </Button>
                {user && (
                  <Button onClick={handleSaveQuizToProfile} disabled={isSaving}>
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Save Quiz
                  </Button>
                )}
              </CardFooter>
            </Card>
          ) : (
            currentQuestion && (
              <Card className="max-w-3xl mx-auto mt-8">
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span>Question {currentQuestionIndex + 1} of {totalQuestions}</span>
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
                            ? 'border-green-500 bg-green-50'
                            : answerState === 'incorrect' && selectedAnswer === option
                            ? 'border-red-500 bg-red-50'
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
                      {currentQuestionIndex < totalQuestions - 1 ? 'Next Question' : 'Finish Quiz'}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            )
          )}
        </>
      )}
    </div>
  );
}
