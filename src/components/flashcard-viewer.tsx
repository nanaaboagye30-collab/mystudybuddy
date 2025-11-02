'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, RefreshCw, ChevronsLeft, ChevronsRight } from 'lucide-react';
import type { GenerateFlashcardsFromTextOutput } from '@/ai/flows/generate-flashcards-from-text';

type FlashcardViewerProps = {
  data: GenerateFlashcardsFromTextOutput;
  onRestart: () => void;
};

export function FlashcardViewer({ data, onRestart }: FlashcardViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const flashcards = useMemo(() => data.flashcards, [data]);
  const currentCard = flashcards[currentIndex];
  const progress = ((currentIndex + 1) / flashcards.length) * 100;

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => Math.min(prev + 1, flashcards.length - 1));
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };
  
  const handleFirst = () => {
    setIsFlipped(false);
    setCurrentIndex(0);
  };

  const handleLast = () => {
    setIsFlipped(false);
    setCurrentIndex(flashcards.length - 1);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div className="space-y-2">
        <div className="flex justify-between items-center text-sm text-muted-foreground">
            <span>Progress</span>
            <span>Card {currentIndex + 1} of {flashcards.length}</span>
        </div>
        <Progress value={progress} />
      </div>

      <div className="relative [perspective:1000px]">
        <div
          className={`relative w-full h-80 transition-transform duration-700 [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <Card className="absolute w-full h-full [backface-visibility:hidden] flex items-center justify-center p-6 cursor-pointer">
            <CardContent className="text-center">
              <p className="text-lg font-semibold">{currentCard.question}</p>
            </CardContent>
          </Card>
          <Card className="absolute w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] flex items-center justify-center p-6 cursor-pointer bg-secondary">
            <CardContent className="text-center">
              <p className="text-lg">{currentCard.answer}</p>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div className="text-center text-muted-foreground text-sm">
        Click card to flip
      </div>

      <div className="flex justify-center items-center gap-2 sm:gap-4">
        <Button variant="outline" size="icon" onClick={handleFirst} disabled={currentIndex === 0}>
          <ChevronsLeft className="h-4 w-4" />
          <span className="sr-only">First card</span>
        </Button>
        <Button variant="outline" size="icon" onClick={handlePrev} disabled={currentIndex === 0}>
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Previous card</span>
        </Button>
        <Button onClick={() => setIsFlipped(!isFlipped)} className="px-8 bg-accent hover:bg-accent/90">
            Flip
        </Button>
        <Button variant="outline" size="icon" onClick={handleNext} disabled={currentIndex === flashcards.length - 1}>
          <ArrowRight className="h-4 w-4" />
          <span className="sr-only">Next card</span>
        </Button>
         <Button variant="outline" size="icon" onClick={handleLast} disabled={currentIndex === flashcards.length - 1}>
          <ChevronsRight className="h-4 w-4" />
          <span className="sr-only">Last card</span>
        </Button>
      </div>

      <div className="text-center pt-4">
        <Button variant="ghost" onClick={onRestart}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Start Over
        </Button>
      </div>
    </div>
  );
}
