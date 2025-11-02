
'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, Upload, Paperclip, Link as LinkIcon, Book, FileText, Download, Save, Copy } from 'lucide-react';
import { handleGenerateNotes, handleGenerateFromUrl, handleGenerateFromPdf, handleTransformNotes, handleSaveNote } from './actions';
import { type GenerateStudyNotesOutput } from '@/ai/flows/schemas';
import { type GenerateSummaryOutput } from '@/ai/flows/schemas';
import { useAuth } from '@/hooks/use-auth';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { htmlToText } from 'html-to-text';

export default function StudyMaterialPage() {
    const [topic, setTopic] = useState('');
    const [text, setText] = useState('');
    const [url, setUrl] = useState('');
    const [file, setFile] = useState<File | null>(null);

    const [isLoading, setIsLoading] = useState(false);
    
    const [studyNotesResult, setStudyNotesResult] = useState<string | null>(null);
    const [summaryResult, setSummaryResult] = useState<string | null>(null);
    
    const [isNotesSaved, setIsNotesSaved] = useState(false);
    
    const { toast } = useToast();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('text');

    const fileInputRef = useRef<HTMLInputElement>(null);

    const isGenerateDisabled = isLoading || (activeTab === 'text' && text.trim().length < 100) || (activeTab === 'url' && !url) || (activeTab === 'upload' && !file);

    const handleGenerate = async () => {
        let sourceProvided = false;
        
        if (activeTab === 'text' && text.trim().length >= 100) sourceProvided = true;
        if (activeTab === 'url' && url.trim().length > 0) sourceProvided = true;
        if (activeTab === 'upload' && file) sourceProvided = true;

        if (!sourceProvided) {
            toast({
                title: 'No content provided',
                description: 'Please paste text, enter a URL, or upload a file.',
                variant: 'destructive',
            });
            return;
        }

        setIsLoading(true);
        setStudyNotesResult(null);
        setSummaryResult(null);
        setIsNotesSaved(false);

        try {
            let notesOutput: GenerateStudyNotesOutput;
            if (activeTab === 'text') {
                notesOutput = await handleGenerateNotes({ text });
            } else if (activeTab === 'url') {
                notesOutput = await handleGenerateFromUrl({ url });
            } else if (activeTab === 'upload' && file) {
                 const reader = new FileReader();
                 reader.readAsDataURL(file);
                 const dataUri = await new Promise<string>((resolve, reject) => {
                    reader.onload = () => resolve(reader.result as string);
                    reader.onerror = error => reject(error);
                });
                notesOutput = await handleGenerateFromPdf({ pdf: dataUri });
            } else {
                throw new Error("No valid input method selected.");
            }

            if (notesOutput.studyNotes.startsWith("ERROR:")) {
                 toast({
                    title: 'Generation Failed',
                    description: notesOutput.studyNotes.replace("ERROR:", "").trim(),
                    variant: 'destructive',
                });
                setStudyNotesResult(null);
            } else {
                setStudyNotesResult(notesOutput.studyNotes);
                toast({
                    title: 'Notes Generated!',
                    description: 'Your detailed study notes are ready below.',
                });
                
                // Automatically generate the summary
                const transformResult = await handleTransformNotes(notesOutput.studyNotes, 'summary');

                if ('error' in transformResult) {
                    toast({
                        title: 'Summary Generation Failed',
                        description: transformResult.error,
                        variant: 'destructive',
                    });
                } else if ('transformedNotes' in transformResult) {
                    setSummaryResult(transformResult.transformedNotes);
                    toast({
                        title: 'Summary Generated!',
                        description: 'A summary of your notes has also been created.',
                    });
                }
            }

        } catch (error) {
            console.error(error);
            toast({
                title: 'An Unexpected Error Occurred',
                description: error instanceof Error ? error.message : 'Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleSave = async () => {
        if (!user || !studyNotesResult || !summaryResult) {
            toast({ title: "Cannot save until notes and summary are generated.", variant: "destructive"});
            return;
        }
        
        setIsNotesSaved(true);
        
        const topicToSave = topic || (activeTab === 'url' ? url : 'Untitled Notes');
        const result = await handleSaveNote(user.uid, topicToSave, studyNotesResult, summaryResult);
        
        if (result.success) {
            toast({
                title: "Note Saved!",
                description: "Your study materials have been saved to your library.",
            });
        } else {
            setIsNotesSaved(false);
            toast({ title: "Save failed", description: result.error, variant: "destructive"});
        }
    }
    
    const convertMarkdownToHTML = (text: string) => {
         let html = text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

        html = html
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>');
            
        html = html
            .replace(/^### (.*$)/gm, '<h3 class="text-lg font-bold my-2">$1</h3>')
            .replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold my-3">$1</h2>')
            .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold my-4 text-primary">$1</h1>');

        // Handle list items, including nested ones
        html = html.replace(/^\s*-\s(.*$)/gm, '<li>$1</li>');
        html = html.replace(/^\s*\*\s(.*$)/gm, '<li>$1</li>');
        html = html.replace(/<\/li>\n<li>/g, '</li><li>'); 
        html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');

        // Checkboxes
        html = html.replace(/☐\s/g, '<input type="checkbox" class="mr-2" disabled> ');
        
        // Basic table conversion
        html = html.replace(/^\|(.+)\|$/gm, (match) => {
            const cells = match.slice(1, -1).split('|').map(c => `<td>${c.trim()}</td>`).join('');
            return `<tr>${cells}</tr>`;
        });
        html = html.replace(/<\/tr><tr>/g, '</tr>\n<tr>');
        html = html.replace(/(<tr>.*<\/tr>)/s, '<table>$1</table>');

        // A very basic way to differentiate header row
        html = html.replace(/<table>\n<tr>/, '<table>\n<thead class="bg-muted"><tr>');
        html = html.replace(/<\/tr>\n<tr>/, '</tr></thead>\n<tbody><tr>');
        html = html.replace(/<\/tr>\n<\/table>/, '</tbody></tr>\n</table>');


        // Cleanup newlines to <br> tags
        html = html.replace(/\n/g, '<br />');

        // Remove <br> tags around block elements
        const blockElements = ['ul', 'h1', 'h2', 'h3', 'table'];
        blockElements.forEach(tag => {
            const openTagRegex = new RegExp(`<br \\/><${tag}>`, 'g');
            const closeTagRegex = new RegExp(`</${tag}><br \\/>`, 'g');
            html = html.replace(openTagRegex, `<${tag}>`);
            html = html.replace(closeTagRegex, `</${tag}>`);
        });

        return html;
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

    const handleDownload = (format: 'pdf' | 'word') => {
        if (!studyNotesResult || !summaryResult) return;
        const noteTopic = topic || 'Study Material';
        
        const combinedContent = `
            <h1>${noteTopic} - Study Notes</h1>
            ${convertMarkdownToHTML(studyNotesResult)}
            <div style="page-break-before: always;"></div>
            <h1>${noteTopic} - Summary</h1>
            ${convertMarkdownToHTML(summaryResult)}
        `;

        if (format === 'word') {
             const cleanContent = getCleanText(combinedContent);
            const blob = new Blob(['\ufeff', cleanContent], { type: 'application/msword' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `${noteTopic.replace(/ /g, '_')}_Complete.doc`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
        } else if (format === 'pdf') {
            const printWindow = window.open('', '', 'height=800,width=800');
            if (printWindow) {
                printWindow.document.write(`<html><head><title>${noteTopic} - Complete Study Material</title></head><body>`);
                printWindow.document.write(combinedContent);
                printWindow.document.write('</body></html>');
                printWindow.document.close();
                printWindow.focus();
                printWindow.print();
            }
        }
    };
    
    const handleCopy = (textToCopy: string) => {
        navigator.clipboard.writeText(textToCopy);
        toast({ title: "Copied to clipboard!" });
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                     <div className="space-y-2">
                        <Label htmlFor="topic">Topic / Document Title</Label>
                        <Input
                            id="topic"
                            placeholder="e.g., 'Introduction to Data Analytics'"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    <CardTitle className="font-headline text-xl flex items-center gap-2 mb-4">
                        <Book />
                        1. Provide Your Material
                    </CardTitle>
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="text" disabled={isLoading}>Paste Text</TabsTrigger>
                            <TabsTrigger value="url" disabled={isLoading}>From URL</TabsTrigger>
                            <TabsTrigger value="upload" disabled={isLoading}>Upload PDF</TabsTrigger>
                        </TabsList>
                        <TabsContent value="text" className="mt-4">
                            <Textarea
                                placeholder="Paste your notes or article text here... (minimum 100 characters)"
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                rows={15}
                                className="w-full"
                                disabled={isLoading}
                            />
                        </TabsContent>
                        <TabsContent value="url" className="mt-4">
                            <div className="flex items-center space-x-2">
                                <LinkIcon className="h-5 w-5 text-muted-foreground" />
                                <Input
                                    type="url"
                                    placeholder="https://example.com/article"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    disabled={isLoading}
                                />
                            </div>
                             <p className="text-xs text-muted-foreground mt-2">Enter the URL of an article, blog post, or web page.</p>
                        </TabsContent>
                        <TabsContent value="upload" className="mt-4">
                            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-input p-6">
                                <Input
                                    id="pdf-upload"
                                    type="file"
                                    ref={fileInputRef}
                                    accept=".pdf"
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
                                            <span className="text-xs text-muted-foreground">(.pdf up to 10MB)</span>
                                        </div>
                                    )}
                                </Label>
                            </div>
                        </TabsContent>
                    </Tabs>
                    <Button onClick={handleGenerate} disabled={isGenerateDisabled} className="mt-4">
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                        Generate Study Materials
                    </Button>
                </CardContent>
            </Card>

            {(isLoading || studyNotesResult) && (
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">2. Detailed Study Notes</CardTitle>
                        <CardDescription>Comprehensive, structured notes generated by the AI.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading && !studyNotesResult ? (
                             <div className="flex items-center justify-center h-96">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                <p className="ml-4 text-muted-foreground">The AI is generating your notes and summary...</p>
                            </div>
                        ) : studyNotesResult ? (
                            <div className="border rounded-lg p-4 max-h-[600px] overflow-y-auto">
                                <div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: convertMarkdownToHTML(studyNotesResult!) }} />
                            </div>
                        ) : null}
                    </CardContent>
                </Card>
            )}
            
            {summaryResult && !isLoading && (
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="font-headline">3. One-Page Summary</CardTitle>
                            <CardDescription>A concise, structured summary with memory aids.</CardDescription>
                        </div>
                         <div className="flex items-center gap-2">
                             <Button onClick={handleSave} variant="outline" disabled={isNotesSaved}>
                                <Save className="mr-2 h-4 w-4" />
                                {isNotesSaved ? 'Saved' : 'Save to Library'}
                            </Button>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline">
                                        <Download className="mr-2 h-4 w-4" />
                                        Download All
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                     <DropdownMenuItem onClick={() => handleDownload('pdf')}>
                                        <FileText className="mr-2 h-4 w-4" />
                                        PDF
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleDownload('word')}>
                                        <Book className="mr-2 h-4 w-4" />
                                        Word
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                             <Button variant="ghost" size="icon" onClick={() => handleCopy(summaryResult)}>
                                <Copy className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="border rounded-lg p-4 max-h-[600px] overflow-y-auto">
                            <div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: convertMarkdownToHTML(summaryResult) }} />
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
