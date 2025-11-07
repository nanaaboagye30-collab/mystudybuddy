
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Library, Loader2, FileText, Newspaper, FolderPlus, Folder, ChevronRight, Home, PlusCircle, Upload, Save, X, FileQuestion } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { getNotesForUser, SavedNote } from '@/services/notes-service';
import { useEffect, useState, useRef } from 'react';
import { formatDistanceToNow } from 'date-fns';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

type ClientFolder = {
    name: string;
    path: string[];
};

const NoteCard = ({ note }: { note: SavedNote }) => {
    
    const getIcon = () => {
        switch (note.type) {
            case 'study-notes': return <FileText className="h-5 w-5" />;
            case 'article-analysis': return <Newspaper className="h-5 w-5" />;
            case 'flashcards': return <FileText className="h-5 w-5" />; // You can change this icon
            case 'quiz': return <FileQuestion className="h-5 w-5" />;
            default: return <FileText className="h-5 w-5" />;
        }
    };
    
    const getBadgeText = () => {
        switch (note.type) {
            case 'study-notes': return 'Study Notes';
            case 'article-analysis': return 'Article';
            case 'flashcards': return 'Flashcards';
            case 'quiz': return 'Quiz';
            default: return 'Note';
        }
    }

    const convertMarkdownToHTML = (text: string) => {
        let html = text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>');

        html = html
            .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold my-4">$1</h1>')
            .replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold my-3">$1</h2>')
            .replace(/^### (.*$)/gm, '<h3 class="text-lg font-bold my-2">$1</h3>');

        html = html.replace(/^\* (.*$)/gm, '<li>$1</li>');
        html = html.replace(/<\/li>\n<li>/g, '</li><li>');
        html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');

        html = html.replace(/\n/g, '<br />');
        html = html.replace(/<br \/><ul>/g, '<ul>');
        html = html.replace(/<\/ul><br \/>/g, '</ul>');
        
        return html;
    };

    const renderContent = () => {
        switch(note.type) {
            case 'study-notes':
                return (
                    <>
                        <AccordionItem value="study-notes">
                            <AccordionTrigger>Study Notes</AccordionTrigger>
                            <AccordionContent>
                                <div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: convertMarkdownToHTML(note.content.studyNotes) }} />
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="summary">
                            <AccordionTrigger>Summary</AccordionTrigger>
                            <AccordionContent>
                                <div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: convertMarkdownToHTML(note.content.summary) }} />
                            </AccordionContent>
                        </AccordionItem>
                    </>
                );
            case 'article-analysis':
                 return (
                    <AccordionItem value="vocab-phrases">
                        <AccordionTrigger className="text-lg font-semibold">Vocabulary &amp; Phrases</AccordionTrigger>
                        <AccordionContent>
                            <ul className="space-y-4">
                                {note.content.vocabularyAndPhrases.map((item: any, index: number) => (
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
                 );
            case 'flashcards':
                return (
                    <AccordionItem value="flashcards">
                        <AccordionTrigger>Flashcards ({note.content.flashcards.length})</AccordionTrigger>
                        <AccordionContent>
                            <ul className="space-y-3">
                                {note.content.flashcards.map((card: any, index: number) => (
                                    <li key={index} className="border-b pb-2">
                                        <p><strong>Q:</strong> {card.question}</p>
                                        <p><strong>A:</strong> {card.answer}</p>
                                    </li>
                                ))}
                            </ul>
                        </AccordionContent>
                    </AccordionItem>
                );
            case 'quiz':
                 return (
                    <AccordionItem value="quiz">
                        <AccordionTrigger>Quiz Questions ({note.content.quiz.length})</AccordionTrigger>
                        <AccordionContent>
                            <ol className="list-decimal list-inside space-y-4">
                                {note.content.quiz.map((q: any, index: number) => (
                                    <li key={index}>
                                        <p className="font-semibold">{q.question}</p>
                                        <ul className="list-disc list-inside pl-4 mt-1 text-sm">
                                            {q.options.map((opt: string, i: number) => (
                                                <li key={i} className={opt === q.answer ? 'text-green-600 font-medium' : ''}>
                                                    {opt} {opt === q.answer && '(Correct)'}
                                                </li>
                                            ))}
                                        </ul>
                                    </li>
                                ))}
                            </ol>
                        </AccordionContent>
                    </AccordionItem>
                );
            default:
                return <p>Unsupported note type.</p>;
        }
    };
    
    return (
        <Card>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className="font-headline flex items-center gap-2">
                             {getIcon()}
                            {note.topic}
                        </CardTitle>
                        <CardDescription>
                            Saved {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}
                        </CardDescription>
                    </div>
                    <Badge variant={note.type === 'article-analysis' ? 'secondary' : 'default'}>
                        {getBadgeText()}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                 <Accordion type="single" collapsible className="w-full">
                    {renderContent()}
                </Accordion>
            </CardContent>
        </Card>
    )
}

const FolderGrid = ({ folders, onFolderClick }: { folders: ClientFolder[], onFolderClick: (folder: ClientFolder) => void }) => {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {folders.map((folder, index) => (
                <Button variant="ghost" key={index} onClick={() => onFolderClick(folder)} className="flex flex-col h-28 items-center justify-center gap-2 border">
                    <Folder className="h-8 w-8 text-primary" />
                    <span className="text-sm font-medium truncate w-full">{folder.name}</span>
                </Button>
            ))}
        </div>
    )
}

const Breadcrumbs = ({ path, onPathChange }: { path: string[], onPathChange: (newPath: string[]) => void }) => {
    const handleCrumbClick = (index: number) => {
        onPathChange(path.slice(0, index + 1));
    }
    return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Button variant="ghost" size="sm" onClick={() => onPathChange([])} className="flex items-center gap-1.5 pl-1">
                <Home className="h-4 w-4" /> 
                My Library
            </Button>
            {path.length > 0 && <ChevronRight className="h-4 w-4" />}
            {path.map((segment, index) => (
                <div key={index} className="flex items-center gap-2">
                    <Button
                        variant={index === path.length -1 ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => handleCrumbClick(index)}
                        className={index === path.length - 1 ? 'font-semibold text-foreground' : ''}
                    >
                        {segment}
                    </Button>
                    {index < path.length - 1 && <ChevronRight className="h-4 w-4" />}
                </div>
            ))}
        </div>
    )
}


export default function LibraryPage() {
    const { user } = useAuth();
    const [notes, setNotes] = useState<SavedNote[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFolderDialogOpen, setIsFolderDialogOpen] = useState(false);
    const [folderName, setFolderName] = useState('');
    const [folders, setFolders] = useState<ClientFolder[]>([]);
    const [currentPath, setCurrentPath] = useState<string[]>([]);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (user) {
            setIsLoading(true);
            getNotesForUser(user.uid)
                .then(setNotes)
                .catch(console.error)
                .finally(() => setIsLoading(false));
        }
    }, [user]);

    const handleCreateFolder = () => {
        if (!folderName.trim()) {
            toast({ title: 'Folder name is required', variant: 'destructive' });
            return;
        }
        
        const newFolder: ClientFolder = {
            name: folderName.trim(),
            path: currentPath,
        };

        if(folders.some(f => f.name === newFolder.name && f.path.join('/') === newFolder.path.join('/'))) {
            toast({ title: 'Folder already exists in this location', variant: 'destructive'});
            return;
        }
        
        setFolders(prev => [...prev, newFolder]);
        
        toast({
            title: 'Folder Created!',
            description: `The folder "${folderName}" has been created.`,
        });
        setFolderName('');
        setIsFolderDialogOpen(false);
    }
    
    const handleFolderClick = (folder: ClientFolder) => {
        setCurrentPath([...folder.path, folder.name]);
    };
    
    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFile(file);
        }
    };
    
    const handleCancelUpload = () => {
        setSelectedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSaveFile = () => {
        if (!selectedFile) return;

        // Placeholder for actual file upload logic
        toast({
            title: "File Saved (simulation)",
            description: `${selectedFile.name} has been saved to the current folder.`,
        });

        handleCancelUpload();
    };

    // Filter folders and notes based on the current path
    const currentFolders = folders.filter(f => f.path.join('/') === currentPath.join('/'));
    // For now, notes are only at the root. This logic will evolve.
    const currentNotes = currentPath.length === 0 ? notes : [];
    
    const isCurrentFolderEmpty = currentFolders.length === 0 && currentNotes.length === 0;

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Library className="h-6 w-6" />
                            <CardTitle className="font-headline">My Library</CardTitle>
                        </div>
                        <div className="flex items-center gap-2">
                             <input 
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                onChange={handleFileChange}
                                accept=".pdf,.doc,.docx,.txt"
                            />
                            {currentPath.length > 0 && (
                                <>
                                    <Button variant="outline" size="sm" onClick={handleUploadClick}>
                                        <Upload className="mr-2 h-4 w-4" /> Upload
                                    </Button>
                                </>
                            )}
                            <Dialog open={isFolderDialogOpen} onOpenChange={setIsFolderDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" size="sm">
                                        <FolderPlus className="mr-2 h-4 w-4" />
                                        Add Folder
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Create New Folder</DialogTitle>
                                        <DialogDescription>
                                            Creating folder inside: My Library {currentPath.length > 0 && `/ ${currentPath.join(' / ')}`}
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="py-4">
                                        <Label htmlFor="folder-name">Folder Name</Label>
                                        <Input
                                            id="folder-name"
                                            value={folderName}
                                            onChange={(e) => setFolderName(e.target.value)}
                                            placeholder="e.g., 'Google Data Analytics'"
                                            onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
                                        />
                                    </div>
                                    <DialogFooter>
                                        <Button onClick={handleCreateFolder}>Create Folder</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                    <CardDescription>
                        Your saved notes, folders, and other study materials will appear here.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Breadcrumbs path={currentPath} onPathChange={setCurrentPath} />
                    {selectedFile ? (
                        <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-primary/50 rounded-lg bg-primary/5 text-center p-6">
                            <p className="text-lg font-medium">Ready to Upload</p>
                            <p className="text-sm text-muted-foreground/80 mb-4">{selectedFile.name}</p>
                            <div className="flex gap-4">
                                <Button onClick={handleSaveFile}>
                                    <Save className="mr-2 h-4 w-4" /> Save
                                </Button>
                                <Button variant="ghost" onClick={handleCancelUpload}>
                                    <X className="mr-2 h-4 w-4" /> Cancel
                                </Button>
                            </div>
                        </div>
                    ) : isLoading ? (
                        <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-muted-foreground/30 rounded-lg">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            <p className="mt-4 text-muted-foreground">Loading your library...</p>
                        </div>
                    ) : isCurrentFolderEmpty ? (
                        <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-muted-foreground/30 rounded-lg text-center p-6">
                            <p className="text-lg font-medium">This folder is empty.</p>
                            <p className="text-sm text-muted-foreground/80 mb-4">Get started by adding a new subfolder or uploading a document.</p>
                            <div className="flex gap-4">
                                <Dialog open={isFolderDialogOpen} onOpenChange={setIsFolderDialogOpen}>
                                    <DialogTrigger asChild>
                                         <Button>
                                            <FolderPlus className="mr-2 h-4 w-4" /> Add Subfolder
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Create New Folder</DialogTitle>
                                        <DialogDescription>
                                            Creating folder inside: My Library {currentPath.length > 0 && `/ ${currentPath.join(' / ')}`}
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="py-4">
                                        <Label htmlFor="folder-name-2">Folder Name</Label>
                                        <Input
                                            id="folder-name-2"
                                            value={folderName}
                                            onChange={(e) => setFolderName(e.target.value)}
                                            placeholder="e.g., 'Google Data Analytics'"
                                            onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
                                        />
                                    </div>
                                    <DialogFooter>
                                        <Button onClick={handleCreateFolder}>Create Folder</Button>
                                    </DialogFooter>
                                </DialogContent>
                                </Dialog>
                                <Button variant="secondary" onClick={handleUploadClick}>
                                    <Upload className="mr-2 h-4 w-4" /> Upload Document
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {currentFolders.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-semibold mb-2">Folders</h3>
                                    <FolderGrid folders={currentFolders} onFolderClick={handleFolderClick} />
                                </div>
                            )}

                            {(currentFolders.length > 0 && currentNotes.length > 0) && <Separator className="my-6" />}
                            
                            {currentNotes.length > 0 && (
                                <div className="space-y-4">
                                   <h3 className="text-lg font-semibold mb-2">My Saved Items</h3>
                                   {currentNotes.map(note => <NoteCard key={note.id} note={note} />)}
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
