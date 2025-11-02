'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { handleGenerateQuiz } from '@/app/(app)/quiz/actions';
import type { GenerateQuizOutput } from '@/ai/flows/generate-quiz-from-uploaded-text';
import { Loader2, Sparkles } from 'lucide-react';

type QuizGeneratorProps = {
  onQuizGenerated: (data: GenerateQuizOutput) => void;
};

export function QuizGenerator({ onQuizGenerated }: QuizGeneratorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const text = formData.get('text') as string;
    const difficulty = formData.get('difficulty') as 'easy' | 'medium' | 'hard';
    const numberOfQuestions = Number(formData.get('numberOfQuestions'));

    if (text.trim().length < 100) {
      toast({
        title: 'Text too short',
        description: 'Please enter at least 100 characters to generate a quiz.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);

    try {
      const result = await handleGenerateQuiz({ text, difficulty, numberOfQuestions });
      if (result.quiz && result.quiz.length > 0) {
        onQuizGenerated(result);
        toast({
          title: 'Quiz Generated!',
          description: `Your ${result.quiz.length}-question quiz is ready.`,
        });
      } else {
        throw new Error('No quiz questions were generated. Try different text or settings.');
      }
    } catch (error) {
      console.error(error);
      toast({
        title: 'Generation Failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
          <Sparkles className="text-accent" />
          Create a Quiz
        </CardTitle>
        <CardDescription>
          Paste your study material and set your preferences to generate a custom quiz.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="text">Study Material</Label>
            <Textarea
              id="text"
              name="text"
              placeholder="Paste your notes here... (minimum 100 characters)"
              rows={12}
              className="w-full"
              disabled={isLoading}
              required
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select name="difficulty" defaultValue="medium" disabled={isLoading} required>
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
              <Label htmlFor="numberOfQuestions">Number of Questions</Label>
              <Input
                id="numberOfQuestions"
                name="numberOfQuestions"
                type="number"
                min="1"
                max="20"
                defaultValue="5"
                disabled={isLoading}
                required
              />
            </div>
          </div>
          <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            Generate Quiz
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
