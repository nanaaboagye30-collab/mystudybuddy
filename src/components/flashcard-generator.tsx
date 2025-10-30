'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { handleGenerateFlashcards } from '@/app/(app)/flashcards/actions';
import type { GenerateFlashcardsFromTextOutput } from '@/ai/flows/generate-flashcards-from-text';
import { Loader2, Sparkles } from 'lucide-react';

type FlashcardGeneratorProps = {
  onFlashcardsGenerated: (data: GenerateFlashcardsFromTextOutput) => void;
};

export function FlashcardGenerator({ onFlashcardsGenerated }: FlashcardGeneratorProps) {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim().length < 50) {
      toast({
        title: 'Text too short',
        description: 'Please enter at least 50 characters to generate flashcards.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);
    try {
      const result = await handleGenerateFlashcards(text);
      if (result.flashcards && result.flashcards.length > 0) {
        onFlashcardsGenerated(result);
        toast({
          title: 'Success!',
          description: `Generated ${result.flashcards.length} flashcards.`,
        });
      } else {
        throw new Error('No flashcards were generated. Try different text.');
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
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
          <Sparkles className="text-accent" />
          Generate Flashcards
        </CardTitle>
        <CardDescription>
          Paste your notes or any text below, and let AI create flashcards for you.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder="Paste your notes here... (minimum 50 characters)"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={10}
            className="w-full"
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading || text.trim().length < 50} className="w-full sm:w-auto">
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            Generate
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
