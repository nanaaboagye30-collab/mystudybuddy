'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import type { GenerateQuizOutput } from '@/ai/flows/generate-quiz-from-uploaded-text';
import { CheckCircle2, Frown, PartyPopper, RefreshCw, XCircle } from 'lucide-react';

type QuizPlayerProps = {
  data: GenerateQuizOutput;
  onRestart: () => void;
};

type AnswerState = 'unanswered' | 'correct' | 'incorrect';

export function QuizPlayer({ data, onRestart }: QuizPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [answerState, setAnswerState] = useState<AnswerState>('unanswered');
  const [isFinished, setIsFinished] = useState(false);

  const quiz = data.quiz;
  const currentQuestion = quiz[currentIndex];
  const progress = ((currentIndex + (isFinished ? 1 : 0)) / quiz.length) * 100;
  
  const score = quiz.reduce((acc, question, index) => {
    return userAnswers[index] === question.answer ? acc + 1 : acc;
  }, 0);
  const scorePercentage = (score / quiz.length) * 100;


  const handleCheckAnswer = () => {
    if (!selectedOption) return;
    const isCorrect = selectedOption === currentQuestion.answer;
    setUserAnswers(prev => ({ ...prev, [currentIndex]: selectedOption }));
    setAnswerState(isCorrect ? 'correct' : 'incorrect');
  };

  const handleNext = () => {
    setAnswerState('unanswered');
    setSelectedOption(null);
    if (currentIndex < quiz.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsFinished(true);
    }
  };

  if (isFinished) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="items-center text-center">
            {scorePercentage > 70 ? <PartyPopper className="h-12 w-12 text-green-500" /> : <Frown className="h-12 w-12 text-destructive" /> }
            <CardTitle className="text-2xl font-headline">Quiz Complete!</CardTitle>
            <CardDescription>You scored</CardDescription>
            <p className="text-4xl font-bold text-primary">{score} / {quiz.length}</p>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
             <div className="w-full space-y-2">
                <Progress value={scorePercentage} />
                <p className="text-center text-muted-foreground">{scorePercentage.toFixed(0)}%</p>
            </div>
            <Button onClick={onRestart}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
        <div className="space-y-2">
            <div className="flex justify-between items-center text-sm text-muted-foreground">
                <span>Progress</span>
                <span>Question {currentIndex + 1} of {quiz.length}</span>
            </div>
            <Progress value={progress} />
        </div>

        <Card>
            <CardHeader>
                <CardTitle className="text-xl font-headline">{currentQuestion.question}</CardTitle>
            </CardHeader>
            <CardContent>
                <RadioGroup
                    value={selectedOption || ''}
                    onValueChange={setSelectedOption}
                    disabled={answerState !== 'unanswered'}
                    className="space-y-3"
                >
                    {currentQuestion.options.map((option, i) => {
                        const isSelected = selectedOption === option;
                        const isCorrectAnswer = currentQuestion.answer === option;
                        let stateIndicator = null;
                        if(answerState !== 'unanswered' && isSelected) {
                            stateIndicator = isCorrectAnswer ? <CheckCircle2 className="text-green-500" /> : <XCircle className="text-destructive" />;
                        } else if(answerState !== 'unanswered' && isCorrectAnswer) {
                             stateIndicator = <CheckCircle2 className="text-green-500" />;
                        }

                        return (
                            <Label
                                key={i}
                                htmlFor={`option-${i}`}
                                className={`flex items-center gap-3 rounded-lg border p-4 cursor-pointer transition-colors ${
                                    answerState !== 'unanswered' && isCorrectAnswer ? 'border-green-500 bg-green-500/10' : ''
                                } ${
                                    answerState === 'incorrect' && isSelected ? 'border-destructive bg-destructive/10' : ''
                                }`}
                            >
                                <RadioGroupItem value={option} id={`option-${i}`} />
                                <span className="flex-1">{option}</span>
                                {stateIndicator}
                            </Label>
                        )
                    })}
                </RadioGroup>
            </CardContent>
        </Card>
        
        <div className="flex justify-end gap-4">
            {answerState === 'unanswered' ? (
                <Button onClick={handleCheckAnswer} disabled={!selectedOption}>Check Answer</Button>
            ) : (
                <Button onClick={handleNext} className="bg-accent hover:bg-accent/90">
                    {currentIndex === quiz.length - 1 ? 'Finish' : 'Next Question'}
                </Button>
            )}
        </div>
    </div>
  );
}
