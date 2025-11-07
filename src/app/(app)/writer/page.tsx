
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, Wand2, Lightbulb, Copy } from 'lucide-react';
import { handleGenerateText } from './actions';
import { type GenerateTextOutput } from '@/ai/flows/generate-text';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export default function WriterPage() {
    const [originalText, setOriginalText] = useState('');
    const [instructions, setInstructions] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [generationResult, setGenerationResult] = useState<GenerateTextOutput | null>(null);
    const { toast } = useToast();

    const handleGenerate = async () => {
        if (originalText.trim().length < 20) {
            toast({
                title: 'Text is too short',
                description: 'Please provide at least 20 characters of text to improve.',
                variant: 'destructive',
            });
            return;
        }

        setIsLoading(true);
        setGenerationResult(null);

        try {
            const result = await handleGenerateText({ text: originalText, instructions });
            if ('error' in result) {
                toast({
                    title: 'Improvement Failed',
                    description: result.error,
                    variant: 'destructive',
                });
            } else {
                setGenerationResult(result);
                toast({
                    title: 'Text Improved!',
                    description: 'The AI has rewritten your text and provided feedback.'
                });
            }
        } catch (error) {
            console.error(error);
            toast({
                title: 'An Unexpected Error Occurred',
                description: 'An unknown error occurred while improving the text.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleCopyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({ title: "Copied to clipboard!" });
    }

    const isGenerateDisabled = isLoading || originalText.trim().length < 20;
    
    const renderFeedbackList = (feedback: string) => {
        return (
            <ul className="space-y-2 text-sm">
                {feedback.split('\n').map((item, index) => {
                    const trimmedItem = item.trim();
                    if (!trimmedItem) return null;
                    return (
                        <li key={index} className="flex items-start gap-3">
                            <span className='mt-1 text-primary'>•</span>
                            <span>{trimmedItem.replace(/^- /, '')}</span>
                        </li>
                    );
                })}
            </ul>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-xl flex items-center gap-2"><Wand2 /> AI Writer</CardTitle>
                        <CardDescription>Improve your writing with an AI-powered assistant. Enter your text and let the AI elevate it to academic standards.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="original-text">Your Text</Label>
                                <Textarea
                                    id="original-text"
                                    placeholder="Paste your text here to get started..."
                                    value={originalText}
                                    onChange={(e) => setOriginalText(e.target.value)}
                                    rows={15}
                                    className="w-full"
                                    disabled={isLoading}
                                />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="instructions">Instructions (Optional)</Label>
                                <Input
                                    id="instructions"
                                    placeholder="e.g., 'Make it more concise' or 'Adopt a formal tone'"
                                    value={instructions}
                                    onChange={(e) => setInstructions(e.target.value)}
                                    disabled={isLoading}
                                />
                            </div>
                        </div>
                        <Button onClick={handleGenerate} disabled={isGenerateDisabled} className="mt-6">
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                            Improve Text
                        </Button>
                    </CardContent>
                </Card>
                 {isLoading && (
                     <Card>
                        <CardHeader>
                            <CardTitle className="font-headline">Improving Your Text</CardTitle>
                            <CardDescription>
                                Please wait while the AI analyzes and rewrites your content...
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-center h-48">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                <p className="ml-4 text-muted-foreground">Applying academic writing standards...</p>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
            
            {generationResult && !isLoading && (
              <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Improved Text</CardTitle>
                        <CardDescription>
                            This is the rewritten version of your text, enhanced for clarity and academic tone.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="relative">
                            <Textarea
                                readOnly
                                value={generationResult.generatedText}
                                rows={15}
                                className="w-full bg-muted/30"
                            />
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute top-2 right-2"
                                onClick={() => handleCopyToClipboard(generationResult.generatedText)}
                            >
                                <Copy className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center gap-2"><Lightbulb /> Feedback</CardTitle>
                        <CardDescription>
                            Here are the key changes the AI made and why.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="p-4 bg-muted/30 rounded-lg">
                           {renderFeedbackList(generationResult.feedback)}
                        </div>
                    </CardContent>
                </Card>
              </div>
            )}
        </div>
    );
}
