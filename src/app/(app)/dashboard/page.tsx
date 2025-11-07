
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { MoveRight, BookOpen, FileText, FileQuestion, CalendarDays, ScanText, PenSquare } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const featureCards = [
    {
        title: "Study Material",
        description: "Generate detailed study notes from text, URLs, or PDFs.",
        href: "/study-material",
        icon: <BookOpen className="h-6 w-6" />,
        image: PlaceHolderImages.find((img) => img.id === 'articles-notes-feature'),
    },
    {
        title: "Flashcards",
        description: "Create flashcards from any text to reinforce key concepts.",
        href: "/flashcards",
        icon: <FileText className="h-6 w-6" />,
        image: PlaceHolderImages.find((img) => img.id === 'flashcard-feature'),
    },
    {
        title: "Quiz Generator",
        description: "Test your knowledge by generating quizzes from your notes.",
        href: "/quiz",
        icon: <FileQuestion className="h-6 w-6" />,
        image: PlaceHolderImages.find((img) => img.id === 'quiz-feature'),
    },
    {
        title: "Study Planner",
        description: "Organize your courses and generate weekly study plans.",
        href: "/schedule",
        icon: <CalendarDays className="h-6 w-6" />,
        image: PlaceHolderImages.find((img) => img.id === 'schedule-feature'),
    },
    {
        title: "Article Analyzer",
        description: "Extract key vocabulary and phrases from any article.",
        href: "/article",
        icon: <ScanText className="h-6 w-6" />,
        image: PlaceHolderImages.find((img) => img.id === 'article-feature'),
    },
    {
        title: "AI Writer",
        description: "Improve your writing with an AI-powered editor.",
        href: "/writer",
        icon: <PenSquare className="h-6 w-6" />,
        image: PlaceHolderImages.find((img) => img.id === 'writer-feature'),
    }
];

export default function DashboardPage() {
    
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight font-headline">Welcome back!</h2>
                <p className="text-muted-foreground">
                    Here are your AI-powered tools to help you study smarter.
                </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {featureCards.map((feature) => (
                    <Card key={feature.title} className="flex flex-col group overflow-hidden">
                        {feature.image && (
                            <div className="relative h-40 w-full overflow-hidden">
                                <Image
                                    src={feature.image.imageUrl}
                                    alt={feature.image.description}
                                    fill
                                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                                    data-ai-hint={feature.image.imageHint}
                                />
                            </div>
                        )}
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="bg-primary/10 p-2 rounded-md text-primary">
                                    {feature.icon}
                                </div>
                                <CardTitle className="font-headline text-lg">{feature.title}</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-grow">
                            <CardDescription>{feature.description}</CardDescription>
                        </CardContent>
                        <div className="p-6 pt-0">
                            <Button asChild className="w-full">
                                <Link href={feature.href}>
                                    Go <MoveRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
