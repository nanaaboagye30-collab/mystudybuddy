<<<<<<< HEAD

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, Check, X, FileQuestion, ThumbsUp, ThumbsDown, Save } from 'lucide-react';
import { handleGenerateQuiz, handleSaveQuiz } from './actions';
import {
  type GenerateQuizOutput,
  type GenerateQuizInput,
} from '@/ai/flows/generate-quiz-from-uploaded-text';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-auth';

type QuizQuestion = GenerateQuizOutput['quiz'][0];
type AnswerState = 'unanswered' | 'correct' | 'incorrect';

export default function QuizPage() {
  const [topic, setTopic] = useState('');
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [quizResult, setQuizResult] = useState<GenerateQuizOutput | null>(
    null
  );
  const { toast } = useToast();
  const { user } = useAuth();

  // Quiz state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<number, string>
  >({});
  const [answerStates, setAnswerStates] = useState<Record<number, AnswerState>>(
    {}
  );
  const [score, setScore] = useState(0);
  const [isQuizFinished, setIsQuizFinished] = useState(false);
  const [isSaved, setIsSaved] = useState(false);


  // Quiz settings
  const [difficulty, setDifficulty] =
    useState<GenerateQuizInput['difficulty']>('medium');
  const [numberOfQuestions, setNumberOfQuestions] =
    useState<GenerateQuizInput['numberOfQuestions']>(5);

  const handleGenerate = async () => {
    if (text.trim().length < 100) {
        toast({
            title: 'Text is too short',
            description: 'Please provide at least 100 characters to generate a quiz from.',
            variant: 'destructive'
        });
        return;
    }
    
    setIsLoading(true);
    setQuizResult(null);
    resetQuizState();

    try {
      const result = await handleGenerateQuiz({
        text,
        difficulty,
        numberOfQuestions,
      });

      if ('error' in result) {
         toast({
            title: 'Generation Failed',
            description: result.error,
            variant: 'destructive',
        });
      } else {
        setQuizResult(result);
        toast({
            title: 'Quiz Generated!',
            description: 'Your quiz is ready to be taken.',
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: 'An Unexpected Error Occurred',
        description: 'An unknown error occurred while generating the quiz.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetQuizState = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setAnswerStates({});
    setScore(0);
    setIsQuizFinished(false);
    setIsSaved(false);
  };
  
  const startNewQuiz = () => {
    setQuizResult(null);
    resetQuizState();
  }

  const handleAnswerSelect = (questionIndex: number, answer: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIndex]: answer,
    }));
  };

  const checkAnswer = () => {
    if (!quizResult) return;
    const currentQuestion = quizResult.quiz[currentQuestionIndex];
    const selectedAnswer = selectedAnswers[currentQuestionIndex];

    if (!selectedAnswer) {
      toast({
        title: 'No answer selected',
        description: 'Please select an answer before checking.',
        variant: 'destructive',
      });
      return;
    }

    if (selectedAnswer === currentQuestion.answer) {
      setAnswerStates((prev) => ({ ...prev, [currentQuestionIndex]: 'correct' }));
      setScore((prev) => prev + 1);
    } else {
      setAnswerStates((prev) => ({
        ...prev,
        [currentQuestionIndex]: 'incorrect',
      }));
    }
  };

  const nextQuestion = () => {
    if (quizResult && currentQuestionIndex < quizResult.quiz.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setIsQuizFinished(true);
    }
  };
  
  const handleSave = async () => {
    if (!quizResult || !user) return;
    
    const topicToSave = topic || "Untitled Quiz";

    setIsSaved(true);
    const result = await handleSaveQuiz(user.uid, topicToSave, quizResult);
    
    if (result.success) {
         toast({
            title: 'Quiz Saved!',
            description: 'You can now find your saved quiz in My Library.',
        });
    } else {
        toast({
            title: 'Save Failed',
            description: result.error,
            variant: 'destructive',
        });
        setIsSaved(false);
    }
  };

  const currentQuestion: QuizQuestion | null = quizResult ? quizResult.quiz[currentQuestionIndex] : null;
  const currentAnswerState: AnswerState = answerStates[currentQuestionIndex] || 'unanswered';


  if (isLoading) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-xl">Generating Quiz</CardTitle>
                <CardDescription>The AI is crafting your questions. Please wait...</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    <p className="ml-4 text-muted-foreground">Analyzing text and creating quiz...</p>
                </div>
            </CardContent>
        </Card>
    );
  }

  if (isQuizFinished && quizResult) {
     const percentage = Math.round((score / quizResult.quiz.length) * 100);
     const isPassing = percentage >= 70;
     
    return (
        <Card className="text-center">
            <CardHeader>
                <CardTitle className="font-headline text-2xl">Quiz Complete!</CardTitle>
                <CardDescription>Here's how you did.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className={`mx-auto flex h-24 w-24 items-center justify-center rounded-full ${isPassing ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}`}>
                    {isPassing ? <ThumbsUp className="h-12 w-12 text-green-600 dark:text-green-400" /> : <ThumbsDown className="h-12 w-12 text-red-600 dark:text-red-400" />}
                </div>
                <p className="text-4xl font-bold">{percentage}%</p>
                <p className="text-muted-foreground">You got <span className="font-bold text-foreground">{score}</span> out of <span className="font-bold text-foreground">{quizResult.quiz.length}</span> questions correct.</p>

                <div className="flex justify-center">
                    <Button onClick={handleSave} variant="outline" disabled={isSaved}>
                        <Save className="mr-2 h-4 w-4" />
                        {isSaved ? 'Saved to Library' : 'Save Quiz to Library'}
                    </Button>
                </div>
                
                <div className="space-y-2 text-left pt-4">
                    <h3 className="font-semibold">Review your answers:</h3>
                     <ul className="space-y-2">
                        {quizResult.quiz.map((q, index) => (
                            <li key={index} className="flex items-center justify-between rounded-md border p-3">
                                <span className="flex-1 mr-4">{q.question}</span>
                                {selectedAnswers[index] === q.answer ? <Check className="h-5 w-5 text-green-500" /> : <X className="h-5 w-5 text-destructive" />}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="flex gap-4 pt-6">
                    <Button onClick={resetQuizState} variant="outline" className="w-full">
                        Try Again
                    </Button>
                     <Button onClick={startNewQuiz} className="w-full">
                        <Sparkles className="mr-2 h-4 w-4" />
                        Create New Quiz
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
  }

  if (quizResult && currentQuestion) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">
            Quiz Time! (Question {currentQuestionIndex + 1} of{' '}
            {quizResult.quiz.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-semibold text-lg mb-4">{currentQuestion.question}</p>
          <RadioGroup
            value={selectedAnswers[currentQuestionIndex] || ''}
            onValueChange={(value) =>
              handleAnswerSelect(currentQuestionIndex, value)
            }
            disabled={currentAnswerState !== 'unanswered'}
          >
            {currentQuestion.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`q${currentQuestionIndex}-o${index}`} />
                <Label htmlFor={`q${currentQuestionIndex}-o${index}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
          
          {currentAnswerState !== 'unanswered' && (
             <Alert className="mt-4" variant={currentAnswerState === 'correct' ? 'default' : 'destructive'}>
                {currentAnswerState === 'correct' ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                <AlertTitle>
                    {currentAnswerState === 'correct' ? 'Correct!' : 'Incorrect'}
                </AlertTitle>
                <AlertDescription>
                    {currentAnswerState === 'incorrect' && `The correct answer is: ${currentQuestion.answer}`}
                </AlertDescription>
            </Alert>
          )}

          <div className="mt-6 flex justify-end">
            {currentAnswerState === 'unanswered' ? (
              <Button onClick={checkAnswer}>Check Answer</Button>
            ) : (
              <Button onClick={nextQuestion}>
                {currentQuestionIndex === quizResult.quiz.length - 1
                  ? 'Finish Quiz'
                  : 'Next Question'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }


  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-xl flex items-center gap-2">
          <FileQuestion />
          Generate a Quiz
        </CardTitle>
        <CardDescription>
          Paste your notes or any text below, choose your settings, and the AI
          will create a multiple-choice quiz for you.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
            <Label htmlFor="topic">Topic / Quiz Name (Optional)</Label>
            <Input
                id="topic"
                placeholder="e.g., 'Real Estate Principles Ch. 1'"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                disabled={isLoading}
            />
        </div>
        <Textarea
          placeholder="Paste your text here... (minimum 100 characters)"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={10}
          className="w-full"
          disabled={isLoading}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="difficulty">Difficulty</Label>
            <Select
              value={difficulty}
              onValueChange={(val) =>
                setDifficulty(val as GenerateQuizInput['difficulty'])
              }
            >
              <SelectTrigger id="difficulty">
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="num-questions">Number of Questions</Label>
             <Select
              value={String(numberOfQuestions)}
              onValueChange={(val) => setNumberOfQuestions(Number(val))}
            >
              <SelectTrigger id="num-questions">
                <SelectValue placeholder="Select number of questions" />
              </SelectTrigger>
              <SelectContent>
                {[5, 10, 15, 20].map(num => (
                    <SelectItem key={num} value={String(num)}>{num} Questions</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button onClick={handleGenerate} disabled={isLoading || text.trim().length < 100} className="mt-4">
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-4 w-4" />
          )}
          Generate Quiz
        </Button>
      </CardContent>
    </Card>
=======
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
>>>>>>> cb4c034c204ea3197443d50d39cc11865d10f9d0
  );
}
