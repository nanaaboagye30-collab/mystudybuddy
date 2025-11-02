
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, Upload, Paperclip, ScanText, Save, Download, FileText, File, FileSpreadsheet } from 'lucide-react';
import { handleAnalyzeArticle, handleSaveArticle } from './actions';
import { type AnalyzeArticleTextOutput } from '@/ai/flows/analyze-article-text';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import * as XLSX from 'xlsx';
import { htmlToText } from 'html-to-text';
import { useAuth } from '@/hooks/use-auth';

export default function ArticlePage() {
    const [topic, setTopic] = useState('');
    const [text, setText] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<AnalyzeArticleTextOutput | null>(null);
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState('text');
    const [isSaved, setIsSaved] = useState(false);
    const { user } = useAuth();

    const handleAnalyze = async () => {
        let sourceText = text;
        
        if (activeTab === 'upload' && file) {
            // Placeholder for file reading logic
            sourceText = `(Content of ${file.name}) This is a placeholder for the file content. In a real implementation, we would read the file here. Innovation and market trends are pivotal. Technological advancements are happening at a rapid pace, which is a key consideration. The company decided to hunker down during the economic crisis, waiting for a better opportunity. Her ambition vaulted her to the top of the company. A grandiose plan for a new city center was unveiled. The thought that he had left the door unlocked nagged at the back of his mind.`;
        }
        
        if (!sourceText || sourceText.trim().length < 50) {
            toast({
                title: 'Text is too short',
                description: 'Please provide at least 50 characters of text to analyze.',
                variant: 'destructive',
            });
            return;
        }

        setIsLoading(true);
        setAnalysisResult(null);
        setIsSaved(false);

        try {
            const result = await handleAnalyzeArticle({ text: sourceText });
            if ('error' in result) {
                 toast({
                    title: 'Analysis Failed',
                    description: result.error,
                    variant: 'destructive',
                });
            } else {
                setAnalysisResult(result);
                toast({
                    title: 'Analysis Complete',
                    description: 'Extracted vocabulary and key phrases from the article.'
                });
            }
        } catch (error) {
            console.error(error);
            toast({
                title: 'An Unexpected Error Occurred',
                description: 'An unknown error occurred while analyzing the article.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    const isAnalyzeDisabled = isLoading || (activeTab === 'text' && text.trim().length < 50) || (activeTab === 'upload' && !file);

    const handleSave = async () => {
        if (!analysisResult || !user) return;

        setIsSaved(true); // Optimistically set as saved
        const result = await handleSaveArticle(user.uid, topic || "Untitled Analysis", analysisResult);
        
        if (result.success) {
             toast({
                title: 'Analysis Saved!',
                description: 'You can now find your saved analysis in My Library.',
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

    const getCleanText = (html: string) => {
        return htmlToText(html, {
            wordwrap: 130,
            selectors: [
                { selector: 'table', options: { uppercase: false } },
                { selector: 'h1', options: { uppercase: false } },
            ]
        });
    };

    const handleDownload = (format: 'pdf' | 'word' | 'excel') => {
        if (!analysisResult) return;

        const { vocabularyAndPhrases } = analysisResult;
        const noteTopic = topic || 'Article Analysis';

        const tableHeader = `
            <thead>
                <tr>
                    <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">No.</th>
                    <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Vocabulary or phrase</th>
                    <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Part of speech</th>
                    <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Meaning</th>
                    <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">For example</th>
                </tr>
            </thead>
        `;
        const tableBody = vocabularyAndPhrases.map((item, index) => `
            <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">${index + 1}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${item.term}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${item.partOfSpeech}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${item.definition}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${item.example}</td>
            </tr>
        `).join('');

        const tableHtml = `
            <table style="width: 100%; border-collapse: collapse; font-family: sans-serif;">
                ${tableHeader}
                <tbody>
                    ${tableBody}
                </tbody>
            </table>
        `;
        
        const content = `<h1>${noteTopic}</h1>${tableHtml}`;

        if (format === 'excel') {
            const workbook = XLSX.utils.book_new();
            const wsData = [
                ['No.', 'Vocabulary or phrase', 'Part of speech', 'Meaning', 'For example']
            ];
            vocabularyAndPhrases.forEach((item, index) => {
                wsData.push([String(index + 1), item.term, item.partOfSpeech, item.definition, item.example]);
            });
            const ws = XLSX.utils.aoa_to_sheet(wsData);
            XLSX.utils.book_append_sheet(workbook, ws, noteTopic);
            XLSX.writeFile(workbook, `${noteTopic.replace(/ /g, '_')}_Analysis.xlsx`);
        } else if (format === 'word') {
            const cleanContent = getCleanText(content);
            const blob = new Blob(['\ufeff', cleanContent], { type: 'application/msword' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `${noteTopic.replace(/ /g, '_')}_Analysis.doc`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
        } else if (format === 'pdf') {
            const printWindow = window.open('', '', 'height=800,width=800');
            if (printWindow) {
                printWindow.document.write(`<html><head><title>${noteTopic} Analysis</title>`);
                printWindow.document.write('<style>body { font-family: sans-serif; } table { width: 100%; border-collapse: collapse; } th, td { border: 1px solid #ddd; padding: 8px; text-align: left; } h1 { color: #333; }</style>');
                printWindow.document.write('</head><body>');
                printWindow.document.write(content);
                printWindow.document.write('</body></html>');
                printWindow.document.close();
                printWindow.focus();
                printWindow.print();
            }
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="space-y-2">
                        <Label htmlFor="topic">Topic / Document Title (Optional)</Label>
                        <Input
                            id="topic"
                            placeholder="e.g., 'The Future of Renewable Energy'"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <CardTitle className="font-headline text-xl">Analyze Article</CardTitle>
                        <Tabs value={activeTab} onValueChange={setActiveTab}>
                            <TabsList className="grid w-full grid-cols-2 max-w-md">
                                <TabsTrigger value="text" disabled={isLoading}>Paste Text</TabsTrigger>
                                <TabsTrigger value="upload" disabled={isLoading}>Upload Document</TabsTrigger>
                            </TabsList>
                            <TabsContent value="text" className="mt-4">
                                <Textarea
                                    placeholder="Paste the article text here to identify vocabulary and key phrases... (minimum 50 characters)"
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
                    <Button onClick={handleAnalyze} disabled={isAnalyzeDisabled} className="mt-4">
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ScanText className="mr-2 h-4 w-4" />}
                        Analyze
                    </Button>
                </CardContent>
            </Card>

            {(isLoading || analysisResult) && (
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="font-headline">Article Analysis</CardTitle>
                            <CardDescription>
                                {topic ? `Showing analysis for: ${topic}` : "Key vocabulary and phrases from the provided text."}
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                             <Button onClick={handleSave} variant="outline" disabled={isLoading || !analysisResult || isSaved}>
                                <Save className="mr-2 h-4 w-4" />
                                {isSaved ? 'Saved' : 'Save'}
                            </Button>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" disabled={!analysisResult}>
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
                         {isLoading ? (
                            <div className="flex items-center justify-center h-48">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                <p className="ml-4 text-muted-foreground">Analyzing your article...</p>
                            </div>
                        ) : analysisResult && analysisResult.vocabularyAndPhrases ? (
                            <Accordion type="single" collapsible defaultValue="vocab-phrases" className="w-full">
                                <AccordionItem value="vocab-phrases">
                                    <AccordionTrigger className="text-lg font-semibold">Vocabulary &amp; Phrases</AccordionTrigger>
                                    <AccordionContent>
                                        <ul className="space-y-4">
                                            {analysisResult.vocabularyAndPhrases.map((item, index) => (
                                                <li key={index} className="flex flex-col gap-1">
                                                    <p>
                                                        <strong className="font-medium">{item.term}</strong>
                                                        <span className="text-muted-foreground text-sm ml-2">({item.partOfSpeech})</span>
                                                    </p>
                                                    <p className="text-sm pl-2">{item.definition}</p>
                                                    <p className="text-sm pl-2 text-muted-foreground italic">e.g., "{item.example}"</p>
                                                </li>
                                            ))}
                                        </ul>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        ) : (
                            <div className="flex items-center justify-center h-48">
                                <p className="text-muted-foreground">No analysis results to display.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
