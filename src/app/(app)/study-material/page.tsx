


'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { handleGenerateNotes, handleSaveNotes, handleTransformNotes } from './actions';
import { handleGenerateNotesFromPdf } from './pdf-actions';
import { handleGenerateNotesFromUrl } from './url-actions';
import type { GenerateStudyNotesOutput, GenerateFlashcardsFromNotesOutput, GenerateSummaryOutput } from '@/ai/flows/schemas';
import { Loader2, Sparkles, Upload, Save, Download, FileText, File, FileSpreadsheet, Paperclip, Link as LinkIcon, BookOpen, Columns } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import * as XLSX from 'xlsx';
import { htmlToText } from 'html-to-text';
import { useAuth } from '@/hooks/use-auth';

type NoteFormat = 'summary' | 'flashcards';

// A new state type to manage different generated note formats
type GeneratedNotesState = {
    studyNotes: string;
    summary?: string;
    flashcards?: string;
};

const convertMarkdownToHTML = (text: string): string => {
    if (!text) return '';
    let html = text
        // Bold and Italic
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        // Q&A for flashcards
        .replace(/^Q: (.*$)/gm, '<p><strong>Q:</strong> $1</p>')
        .replace(/^A: (.*$)/gm, '<p><strong>A:</strong> $1</p>')
        // Headings
        .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold my-4">$1</h1>')
        .replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold my-3">$1</h2>')
        .replace(/^### (.*$)/gm, '<h3 class="text-lg font-bold my-2">$1</h3>')
        // Lists (basic)
        .replace(/^\* (.*$)/gm, '<li>$1</li>')
        .replace(/^- (.*$)/gm, '<li>$1</li>')
        .replace(/^(\d+)\. (.*$)/gm, '<li>$1. $2</li>');

    html = html.replace(/<\/li>\n<li>/g, '</li><li>');
    html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
    
    // Handle markdown tables
    // Process header row first
    html = html.replace(/^\|(.+?)\|$/gm, (match, content) => {
        const headers = content.split('|').map((h: string) => `<th>${h.trim()}</th>`).join('');
        return `<thead><tr>${headers}</tr></thead>`;
    });
    
    // Process separator row
    html = html.replace(/^\|-+\|$/gm, '');

    // Process body rows
    html = html.replace(/^\|(.+?)\|$/gm, (match, content) => {
        if (match.includes('---')) return ''; // ignore separator line if missed
        const cells = content.split('|').map((c: string) => `<td>${c.trim()}</td>`).join('');
        return `<tr>${cells}</tr>`;
    });

    // Wrap rows in tbody and table
    html = html.replace(/(<tr>.+?<\/tr>)/gs, '<tbody>$1</tbody>');
    html = html.replace(/(<thead>.+?<\/thead><tbody>.+?<\/tbody>)/gs, '<table class="w-full border-collapse">$1</table>');


    // Newline breaks
    html = html.replace(/\n/g, '<br />');

    // Cleanup extra breaks around lists/tables
    html = html.replace(/<br \/><ul>/g, '<ul>');
    html = html.replace(/<\/ul><br \/>/g, '</ul>');
    html = html.replace(/<br \/><table/g, '<table');
    html = html.replace(/<\/table><br \/>/g, '</table>');
    html = html.replace(/<br \/>(<p><strong>Q:)/g, '$1');

    return html;
};


function SingleNoteView({ notes, topic }: { notes: string, topic?: string }) {
    
     return (
        <div className="prose prose-sm max-w-none">
            {topic && <h1 className="text-3xl font-bold mb-4 font-headline">{topic}</h1>}
            <div dangerouslySetInnerHTML={{ __html: convertMarkdownToHTML(notes) }} />
        </div>
    );
}

function StudyMaterialPageContent() {
    const searchParams = useSearchParams();
    const defaultTab = searchParams.get('tab') || 'text';

    const [topic, setTopic] = useState('');
    const [text, setText] = useState('');
    const [url, setUrl] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [generatedNotes, setGeneratedNotes] = useState<GeneratedNotesState | null>(null);
    const { toast } = useToast();
    const [isSaved, setIsSaved] = useState(false);
    const [activeTab, setActiveTab] = useState(defaultTab);
    const { user } = useAuth();
    const [isTransforming, setIsTransforming] = useState<Partial<Record<NoteFormat, boolean>>>({});
    
    useEffect(() => {
        setActiveTab(defaultTab);
    }, [defaultTab]);

    const fileToDataUri = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    const isValidUrl = (urlString: string) => {
        try {
            new URL(urlString);
            return true;
        } catch (e) {
            return false;
        }
    }

    const handleAnalyse = async () => {
        if (!topic) {
             toast({
                title: 'Topic is missing',
                description: 'Please provide a topic for your notes.',
                variant: 'destructive',
            });
            return;
        }

        if (activeTab === 'text' && text.trim().length < 100) {
            toast({
                title: 'Text too short',
                description: 'Please enter at least 100 characters to generate notes.',
                variant: 'destructive',
            });
            return;
        }

        if (activeTab === 'upload' && !file) {
            toast({
                title: 'No file selected',
                description: 'Please upload a PDF file to generate notes.',
                variant: 'destructive',
            });
            return;
        }

        if (activeTab === 'link' && !isValidUrl(url)) {
            toast({
                title: 'Invalid URL',
                description: 'Please enter a valid URL to generate notes.',
                variant: 'destructive',
            });
            return;
        }

        setIsLoading(true);
        setGeneratedNotes(null);
        setIsSaved(false);
        
        try {
            let result: GenerateStudyNotesOutput;
            if (activeTab === 'text') {
                result = await handleGenerateNotes(text);
            } else if (activeTab === 'upload' && file) {
                const pdfDataUri = await fileToDataUri(file);
                result = await handleGenerateNotesFromPdf({ pdf: pdfDataUri });
            } else if (activeTab === 'link') {
                result = await handleGenerateNotesFromUrl({ url });
            } else {
                throw new Error("No valid input source selected.");
            }

            if (result && result.studyNotes) {
                setGeneratedNotes({ studyNotes: result.studyNotes });
                toast({
                    title: 'Success!',
                    description: 'Your study notes have been generated.',
                });
            } else {
                throw new Error('The AI failed to generate notes. Please try again.');
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
    
    const handleSave = async () => {
        if (!generatedNotes || !user) return;

        // For simplicity, we'll just save the main notes for now.
        // The logic to pre-generate all formats can be complex.
        const notesToSave = {
            studyNotes: generatedNotes.studyNotes,
            summary: generatedNotes.summary || '',
        };

        setIsSaved(true);
        try {
            await handleSaveNotes(user.uid, topic, notesToSave);
            toast({
                title: 'Notes Saved!',
                description: 'You can now find your saved notes in My Library.',
            });
        } catch(error) {
            console.error('Failed to save notes:', error);
            toast({
                title: 'Save Failed',
                description: 'Could not save notes to your library.',
                variant: 'destructive',
            });
            setIsSaved(false);
        }
    };

    const convertMarkdownToHTMLForDownload = (markdown: string) => {
         let html = convertMarkdownToHTML(markdown);
         return html;
    }

    const getCleanText = (markdown: string) => {
        const html = convertMarkdownToHTMLForDownload(markdown);
        return htmlToText(html, {
            wordwrap: 130,
        });
    }

    const handleDownload = (format: 'pdf' | 'word' | 'excel') => {
        if (!generatedNotes) return;

        const { studyNotes, summary } = generatedNotes;
        const noteTopic = topic || 'AI Generated Notes';

        if (format === 'excel') {
            const workbook = XLSX.utils.book_new();
            const ws1_data = [[`Topic: ${noteTopic}`], [getCleanText(studyNotes)]];
            const ws1 = XLSX.utils.aoa_to_sheet(ws1_data);
            XLSX.utils.book_append_sheet(workbook, ws1, "Study Notes");
            
            if (summary) {
                 const ws2_data = [[`Topic: ${noteTopic}`], [getCleanText(summary)]];
                const ws2 = XLSX.utils.aoa_to_sheet(ws2_data);
                XLSX.utils.book_append_sheet(workbook, ws2, "Summary");
            }
            
            XLSX.writeFile(workbook, `${noteTopic.replace(/ /g, '_')}_Notes.xlsx`);

        } else {
            let content = `
                <h1>${noteTopic}</h1>
                <h2>Study Notes</h2>
                <div>${convertMarkdownToHTMLForDownload(studyNotes || '')}</div>
                ${summary ? `<h2>Summary</h2><div>${convertMarkdownToHTMLForDownload(summary)}</div>` : ''}
            `;
            
            if (format === 'word') {
                const blob = new Blob(['\ufeff', content], { type: 'application/msword' });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = `${noteTopic.replace(/ /g, '_')}_Notes.doc`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(link.href);

            } else if (format === 'pdf') {
                const printWindow = window.open('', '', 'height=800,width=800');
                if (printWindow) {
                    printWindow.document.write(`<html><head><title>${noteTopic} Notes</title>`);
                    printWindow.document.write('<style>body { font-family: sans-serif; } h1, h2, h3 { color: #333; } table { width: 100%; border-collapse: collapse; } th, td { border: 1px solid #ddd; padding: 8px; text-align: left; } ul { padding-left: 20px; } li { margin-bottom: 5px; }</style>');
                    printWindow.document.write('</head><body>');
                    printWindow.document.write(content);
                    printWindow.document.write('</body></html>');
                    printWindow.document.close();
                    printWindow.focus();
                    printWindow.print();
                }
            }
        }
    };
    
    const isAnalyseDisabled = isLoading || !topic || (activeTab === 'text' && text.trim().length < 100) || (activeTab === 'upload' && !file) || (activeTab === 'link' && !isValidUrl(url));

    const handleTabChange = useCallback(async (value: string) => {
        const format = value as NoteFormat;
        if (!generatedNotes || !generatedNotes.studyNotes || value === 'studyNotes') {
            return;
        }

        if (value === 'summary' || value === 'flashcards') {
             if (!generatedNotes[format]) {
                setIsTransforming(prev => ({ ...prev, [format]: true }));
                try {
                    const result = await handleTransformNotes({ notes: generatedNotes.studyNotes, format });
                    
                    if (format === 'summary') {
                        const summaryResult = result as GenerateSummaryOutput;
                        if (summaryResult.transformedNotes) {
                             setGeneratedNotes(prev => prev ? ({ ...prev, summary: summaryResult.transformedNotes }) : null);
                        }
                    } else if (format === 'flashcards') {
                         const flashcardResult = result as GenerateFlashcardsFromNotesOutput;
                         if (flashcardResult.flashcards && Array.isArray(flashcardResult.flashcards)) {
                            const flashcardText = flashcardResult.flashcards.map((fc: {question: string, answer: string}) => `Q: ${fc.question}\nA: ${fc.answer}`).join('\n\n');
                            setGeneratedNotes(prev => prev ? ({ ...prev, flashcards: flashcardText }) : null);
                         }
                    }

                } catch (error) {
                    toast({ title: `Failed to generate ${format}`, variant: 'destructive' });
                } finally {
                    setIsTransforming(prev => ({ ...prev, [format]: false }));
                }
            }
        }
    }, [generatedNotes, toast]);


    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="space-y-2">
                        <Label htmlFor="topic">Topic</Label>
                        <Input 
                        id="topic"
                        placeholder="Enter the topic for your notes (e.g., 'Chapter 5: Photosynthesis')"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        disabled={isLoading}
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <CardTitle className="font-headline">Analyse Document</CardTitle>
                        <Tabs value={activeTab} onValueChange={setActiveTab}>
                            <TabsList className="grid w-full grid-cols-3 max-w-md">
                                <TabsTrigger value="text" disabled={isLoading}>Text</TabsTrigger>
                                <TabsTrigger value="upload" disabled={isLoading}>Upload PDF</TabsTrigger>
                                <TabsTrigger value="link" disabled={isLoading}>From Link</TabsTrigger>
                            </TabsList>
                            <TabsContent value="text" className="mt-4">
                                <Textarea
                                    placeholder="Paste your text here... (minimum 100 characters)"
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    rows={10}
                                    className="w-full"
                                    disabled={isLoading}
                                />
                            </TabsContent>
                             <TabsContent value="upload" className="mt-4">
                                <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-input p-6">
                                    <Input
                                        id="pdf-upload"
                                        type="file"
                                        accept="application/pdf"
                                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                                        className="hidden"
                                        disabled={isLoading}
                                    />
                                    <Label htmlFor="pdf-upload" className="w-full cursor-pointer text-center">
                                        {file ? (
                                            <div className="flex items-center gap-2 justify-center">
                                                <Paperclip className="h-5 w-5" />
                                                <span>{file.name}</span>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center gap-2">
                                                 <Upload className="h-8 w-8 text-muted-foreground" />
                                                <span className="text-muted-foreground">Click to upload a PDF</span>
                                                <span className="text-xs text-muted-foreground">(Max 5MB)</span>
                                            </div>
                                        )}
                                    </Label>
                                </div>
                            </TabsContent>
                             <TabsContent value="link" className="mt-4">
                                <div className="space-y-2">
                                    <Label htmlFor="url-input">Article URL</Label>
                                    <div className="flex gap-2">
                                        <div className="relative flex-grow">
                                            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="url-input"
                                                type="url"
                                                placeholder="https://example.com/article"
                                                value={url}
                                                onChange={(e) => setUrl(e.target.value)}
                                                className="pl-9"
                                                disabled={isLoading}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                    <Button onClick={handleAnalyse} disabled={isAnalyseDisabled} className="mt-4">
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                        Analyse
                    </Button>
                </CardContent>
            </Card>

            {isLoading && (
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Generating AI Powered Notes</CardTitle>
                        <CardDescription>
                            Please wait while the AI analyzes your document...
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-center h-64">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            <p className="ml-4 text-muted-foreground">Generating your notes...</p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {generatedNotes && !isLoading && (
                <div className="space-y-6">
                    {/* Box 1: Study Notes */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="font-headline flex items-center gap-2">
                                    <BookOpen />
                                    AI Powered Notes: {topic}
                                </CardTitle>
                                <CardDescription>
                                    Here are the detailed study notes generated by the AI.
                                </CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button onClick={handleSave} variant="outline" disabled={isLoading || !generatedNotes || isSaved}>
                                    <Save className="mr-2 h-4 w-4" />
                                    {isSaved ? 'Saved' : 'Save'}
                                </Button>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" disabled={!generatedNotes}>
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
                                        <DropdownMenuItem onClick={() => handleDownload('excel')}>
                                            <FileSpreadsheet className="mr-2 h-4 w-4" />
                                            Excel
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {generatedNotes.studyNotes && <SingleNoteView notes={generatedNotes.studyNotes} />}
                        </CardContent>
                    </Card>

                    {/* Box 2: Summary and Flashcards */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="font-headline flex items-center gap-2">
                                    <Columns />
                                    Note Transformation Tools
                                </CardTitle>
                                <CardDescription>
                                    Use the detailed notes to generate a concise summary or flashcards.
                                </CardDescription>
                            </div>
                             <div className="flex items-center gap-2">
                                <Button onClick={handleSave} variant="outline" disabled={isLoading || !generatedNotes || isSaved}>
                                    <Save className="mr-2 h-4 w-4" />
                                    {isSaved ? 'Saved' : 'Save'}
                                </Button>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" disabled={!generatedNotes}>
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
                                        <DropdownMenuItem onClick={() => handleDownload('excel')}>
                                            <FileSpreadsheet className="mr-2 h-4 w-4" />
                                            Excel
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Tabs defaultValue="summary" onValueChange={handleTabChange}>
                                <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 max-w-lg">
                                    <TabsTrigger value="summary">Summary</TabsTrigger>
                                    <TabsTrigger value="flashcards">Flashcards</TabsTrigger>
                                </TabsList>
                                <Separator className="my-4"/>
                                <TabsContent value="summary" className="min-h-[10rem]">
                                    {isTransforming.summary ? (
                                        <div className="flex items-center justify-center h-40"><Loader2 className="h-6 w-6 animate-spin"/></div>
                                    ) : (
                                        generatedNotes.summary ? <SingleNoteView notes={generatedNotes.summary} /> : <div className="flex flex-col gap-4 items-center justify-center h-40 text-muted-foreground"><p>Click the button to generate a summary.</p><Button onClick={() => handleTabChange('summary')}>Generate Summary</Button></div>
                                    )}
                                </TabsContent>
                                <TabsContent value="flashcards" className="min-h-[10rem]">
                                    {isTransforming.flashcards ? (
                                        <div className="flex items-center justify-center h-40"><Loader2 className="h-6 w-6 animate-spin"/></div>
                                    ) : (
                                        generatedNotes.flashcards ? <SingleNoteView notes={generatedNotes.flashcards} /> : <div className="flex flex-col gap-4 items-center justify-center h-40 text-muted-foreground"><p>Click the button to generate flashcards.</p><Button onClick={() => handleTabChange('flashcards')}>Generate Flashcards</Button></div>
                                    )}
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}

export default function StudyMaterialPage() {
    return (
        <React.Suspense fallback={<div>Loading...</div>}>
            <StudyMaterialPageContent />
        </React.Suspense>
    )
}

    