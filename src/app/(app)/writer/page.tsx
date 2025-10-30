'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, Upload, Paperclip, Save, Download, FileText, File, CheckCircle, XCircle, TrendingUp } from 'lucide-react';
import { handleGenerateText } from './actions';
import { type GenerateTextOutput } from '@/ai/flows/generate-text';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { htmlToText } from 'html-to-text';
import { Progress } from '@/components/ui/progress';

export default function WriterPage() {
    const [prompt, setPrompt] = useState('');
    const [text, setText] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [generationResult, setGenerationResult] = useState<GenerateTextOutput | null>(null);
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState('prompt');
    const [isSaved, setIsSaved] = useState(false);

    const handleGenerate = async () => {
        let sourceText = text;

        if (!text && !file) {
            toast({
                title: 'No text provided',
                description: 'Please paste some text or upload a document to edit.',
                variant: 'destructive',
            });
            return;
        }

        if (activeTab === 'upload' && file) {
            sourceText = `(Content of ${file.name}) This is a placeholder for the file content. In a real implementation, we would read the file here.`;
        }

        setIsLoading(true);
        setGenerationResult(null);
        setIsSaved(false);

        try {
            const result = await handleGenerateText({ prompt: sourceText });
            setGenerationResult(result);
            toast({
                title: 'Editing Complete',
                description: 'Your text has been reviewed and improved.'
            });
        } catch (error) {
            console.error(error);
            toast({
                title: 'Editing Failed',
                description: error instanceof Error ? error.message : 'An unknown error occurred.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const isGenerateDisabled = isLoading || (!text && !file);

    const handleSave = () => {
        setIsSaved(true);
        toast({
            title: 'Saved!',
            description: 'You can now download your edited text.',
        });
    };

    const getCleanText = (html: string) => {
        return htmlToText(html, {
            wordwrap: 130,
        });
    };

    const handleDownload = (format: 'pdf' | 'word' | 'txt') => {
        if (!generationResult) return;

        const { generatedText } = generationResult;
        const noteTopic = prompt || 'AI Edited Text';
        
        const content = `<h1>${noteTopic}</h1><p>${generatedText.replace(/\n/g, '<br/>')}</p>`;

        if (format === 'txt') {
            const cleanContent = getCleanText(content);
            const blob = new Blob([cleanContent], { type: 'text/plain' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `${noteTopic.replace(/ /g, '_')}.txt`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);

        } else if (format === 'word') {
            const cleanContent = getCleanText(content);
            const blob = new Blob(['\ufeff', cleanContent], { type: 'application/msword' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `${noteTopic.replace(/ /g, '_')}.doc`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
        } else if (format === 'pdf') {
            const printWindow = window.open('', '', 'height=800,width=800');
            if (printWindow) {
                printWindow.document.write(`<html><head><title>${noteTopic}</title>`);
                printWindow.document.write('<style>body { font-family: sans-serif; } h1 { color: #333; }</style>');
                printWindow.document.write('</head><body>');
                printWindow.document.write(content);
                printWindow.document.write('</body></html>');
                printWindow.document.close();
                printWindow.focus();
                printWindow.print();
            }
        }
    };
    
    const renderFeedbackList = (feedback: string) => {
        return (
            <ul className="space-y-2">
                {feedback.split('\n').map((item, index) => item.trim() && (
                    <li key={index} className="flex items-start gap-2">
                        <span>-</span>
                        <span>{item.replace(/^- /, '')}</span>
                    </li>
                ))}
            </ul>
        );
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-xl">AI Editor</CardTitle>
                    <CardDescription>Paste your text below to get it reviewed and scored against the "A-Level" Harvard standard for analytical writing.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                         <div className="space-y-2">
                            <Label htmlFor="prompt">Document Title (Optional)</Label>
                            <Input
                                id="prompt"
                                placeholder="e.g., 'Q3 Marketing Report Draft'"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>
                        <Tabs value={activeTab} onValueChange={setActiveTab}>
                            <TabsList className="grid w-full grid-cols-2 max-w-md">
                                <TabsTrigger value="prompt" disabled={isLoading}>Paste Text</TabsTrigger>
                                <TabsTrigger value="upload" disabled={isLoading}>Upload Document</TabsTrigger>
                            </TabsList>
                            <TabsContent value="prompt" className="mt-4">
                                <Textarea
                                    placeholder="Paste your text here to begin..."
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    rows={15}
                                    className="w-full"
                                    disabled={isLoading}
                                />
                            </TabsContent>
                            <TabsContent value="upload" className="mt-4">
                                <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-input p-6">
                                    <Input
                                        id="doc-upload"
                                        type="file"
                                        accept=".pdf,.doc,.docx,.txt"
                                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                                        className="hidden"
                                        disabled={isLoading}
                                    />
                                    <Label htmlFor="doc-upload" className="w-full cursor-pointer text-center">
                                        {file ? (
                                            <div className="flex items-center gap-2 justify-center">
                                                <Paperclip className="h-5 w-5" />
                                                <span>{file.name}</span>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center gap-2">
                                                <Upload className="h-8 w-8 text-muted-foreground" />
                                                <span className="text-muted-foreground">Click to upload a document</span>
                                                <span className="text-xs text-muted-foreground">(PDF, Word, TXT)</span>
                                            </div>
                                        )}
                                    </Label>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                    <Button onClick={handleGenerate} disabled={isGenerateDisabled} className="mt-4">
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                        Generate
                    </Button>
                </CardContent>
            </Card>

            {isLoading && (
                 <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Evaluating & Editing</CardTitle>
                        <CardDescription>
                            Please wait while the AI analyzes your text...
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-center h-64">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            <p className="ml-4 text-muted-foreground">Analyzing your text...</p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {generationResult && !isLoading && (
              <div className="space-y-6">
                 <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Evaluation</CardTitle>
                        <CardDescription>Assessment of your original text against the "A-Level" standard.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="relative size-24">
                                <svg className="size-full" width="36" height="36" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="18" cy="18" r="16" fill="none" className="stroke-current text-muted" strokeWidth="2"></circle>
                                    <g className="origin-center -rotate-90 transform">
                                        <circle cx="18" cy="18" r="16" fill="none" className="stroke-current text-primary" strokeWidth="2" strokeDasharray="100" strokeDashoffset={100 - (generationResult.evaluation.score || 0)}></circle>
                                    </g>
                                </svg>
                                <div className="absolute top-1/2 start-1/2 transform -translate-y-1/2 -translate-x-1/2">
                                    <span className="text-center text-2xl font-bold text-gray-800 dark:text-white">{generationResult.evaluation.score}</span>
                                </div>
                            </div>
                            <div className="flex-1 space-y-1">
                                <h3 className="text-lg font-semibold">Overall Score</h3>
                                <p className="text-muted-foreground text-sm">This score reflects the analytical depth, structure, and clarity of your original text.</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2 rounded-lg border p-4">
                                <h4 className="font-semibold flex items-center gap-2"><CheckCircle className="text-green-500" /> Strengths</h4>
                                {renderFeedbackList(generationResult.evaluation.strengths)}
                            </div>
                            <div className="space-y-2 rounded-lg border p-4">
                                <h4 className="font-semibold flex items-center gap-2"><XCircle className="text-destructive" /> Weaknesses</h4>
                                {renderFeedbackList(generationResult.evaluation.weaknesses)}
                            </div>
                             <div className="space-y-2 rounded-lg border p-4">
                                <h4 className="font-semibold flex items-center gap-2"><TrendingUp className="text-blue-500" /> Improvements Made</h4>
                                {renderFeedbackList(generationResult.evaluation.improvements)}
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="font-headline">Edited Text (A-Level)</CardTitle>
                            <CardDescription>
                                {prompt ? `Showing results for: ${prompt}` : "The revised version of your provided text."}
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                             <Button onClick={handleSave} variant="outline" disabled={isSaved}>
                                <Save className="mr-2 h-4 w-4" />
                                {isSaved ? 'Saved' : 'Save'}
                            </Button>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" disabled={!isSaved}>
                                        <Download className="mr-2 h-4 w-4" />
                                        Download
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleDownload('pdf')}>
                                        <FileText className="mr-2 h-4 w-4" />
                                        PDF
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleDownload('word')}>
                                        <File className="mr-2 h-4 w-4" />
                                        Word
                                    </DropdownMenuItem>
                                     <DropdownMenuItem onClick={() => handleDownload('txt')}>
                                        <FileText className="mr-2 h-4 w-4" />
                                        TXT
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="prose prose-sm max-w-none dark:prose-invert">
                           {generationResult.generatedText.split('\n\n').map((paragraph, index) => (
                                <p key={index}>{paragraph}</p>
                            ))}
                        </div>
                    </CardContent>
                </Card>
              </div>
            )}
        </div>
    );
}
