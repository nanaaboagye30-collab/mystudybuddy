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
import { Loader2, Sparkles, Save } from 'lucide-react';
import { handleGenerateFlashcards, handleSaveFlashcards } from './actions';
import { type GenerateFlashcardsFromTextOutput } from '@/ai/flows/generate-flashcards-from-text';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/use-auth';

export default function FlashcardsPage() {
  const [topic, setTopic] = useState('');
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [flashcardsResult, setFlashcardsResult] =
    useState<GenerateFlashcardsFromTextOutput | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const [isFlipped, setIsFlipped] = useState<boolean[]>([]);
  const [isSaved, setIsSaved] = useState(false);

  const handleGenerate = async () => {
    if (text.trim().length < 50) {
        toast({
            title: 'Text is too short',
            description: 'Please provide at least 50 characters to generate flashcards from.',
            variant: 'destructive',
        });
        return;
    }
    
    setIsLoading(true);
    setFlashcardsResult(null);
    setIsSaved(false);

    try {
      const result = await handleGenerateFlashcards({ text });
      if ('error' in result) {
         toast({
            title: 'Generation Failed',
            description: result.error,
            variant: 'destructive',
        });
      } else {
        setFlashcardsResult(result);
        setIsFlipped(new Array(result.flashcards.length).fill(false));
        toast({
            title: 'Flashcards Generated!',
            description: 'Your flashcards are ready for review.',
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: 'An Unexpected Error Occurred',
        description:
          'An unknown error occurred while generating flashcards.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFlip = (index: number) => {
    setIsFlipped((prev) => {
      const newFlipped = [...prev];
      newFlipped[index] = !newFlipped[index];
      return newFlipped;
    });
  };

  const handleSave = async () => {
    if (!flashcardsResult || !user) return;
    
    const topicToSave = topic || "Untitled Flashcards";

    setIsSaved(true); // Optimistically set as saved
    const result = await handleSaveFlashcards(user.uid, topicToSave, flashcardsResult);
    
    if (result.success) {
         toast({
            title: 'Flashcards Saved!',
            description: 'You can now find your saved deck in My Library.',
        });
    } else {
        toast({
            title: 'Save Failed',
            description: result.error,
            variant: 'destructive',
        });
        setIsSaved(false); // Revert save state on error
    }
  };


  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-xl">
            Generate Flashcards
          </CardTitle>
          <CardDescription>
            Paste your notes or any text below, and the AI will create
            flashcards for you.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
             <div className="space-y-2">
                <Label htmlFor="topic">Topic / Deck Name (Optional)</Label>
                <Input
                    id="topic"
                    placeholder="e.g., 'Chapter 5 Key Terms'"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    disabled={isLoading}
                />
            </div>
            <Textarea
              placeholder="Paste your text here... (minimum 50 characters)"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={10}
              className="w-full"
              disabled={isLoading}
            />
          </div>
          <Button onClick={handleGenerate} disabled={isLoading || text.trim().length < 50} className="mt-4">
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            Generate
          </Button>
        </CardContent>
      </Card>

      {(isLoading || flashcardsResult) && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle className="font-headline">Your Flashcards</CardTitle>
                <CardDescription>
                  Click on a card to flip it and reveal the answer.
                </CardDescription>
            </div>
             <Button onClick={handleSave} variant="outline" disabled={isLoading || !flashcardsResult || isSaved}>
                <Save className="mr-2 h-4 w-4" />
                {isSaved ? 'Saved' : 'Save Deck'}
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="ml-4 text-muted-foreground">
                  Generating your flashcards...
                </p>
              </div>
            ) : flashcardsResult && flashcardsResult.flashcards.length > 0 ? (
              <Carousel className="w-full max-w-lg mx-auto">
                <CarouselContent>
                  {flashcardsResult.flashcards.map((card, index) => (
                    <CarouselItem key={index}>
                      <div className="p-1">
                        <Card
                          className="aspect-video flex items-center justify-center text-center p-6 cursor-pointer transform-style-3d transition-transform duration-500"
                          onClick={() => handleFlip(index)}
                          style={{
                            transform: isFlipped[index]
                              ? 'rotateY(180deg)'
                              : 'rotateY(0deg)',
                          }}
                        >
                            <div className="absolute w-full h-full backface-hidden flex flex-col items-center justify-center">
                                <p className="text-sm text-muted-foreground mb-2">Question</p>
                                <p className="text-lg font-semibold">{card.question}</p>
                            </div>
                            <div
                                className="absolute w-full h-full backface-hidden flex flex-col items-center justify-center"
                                style={{ transform: 'rotateY(180deg)' }}
                            >
                                <p className="text-sm text-muted-foreground mb-2">Answer</p>
                                <p className="text-lg">{card.answer}</p>
                            </div>
                        </Card>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="-left-12" />
                <CarouselNext className="-right-12" />
              </Carousel>
            ) : (
                 <div className="flex items-center justify-center h-64">
                    <p className="text-muted-foreground">No flashcards were generated. Please try a different text.</p>
                </div>
            )}
          </CardContent>
        </Card>
      )}
      <style jsx>{`
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
      `}</style>
=======
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
>>>>>>> cb4c034c204ea3197443d50d39cc11865d10f9d0
    </div>
  );
}
