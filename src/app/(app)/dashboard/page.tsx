import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { CalendarDays, Copy, FileQuestion, MoveRight, PenLine, Newspaper, Bot, Library } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const featureCards = [
    {
        title: "Generate Flashcards",
        description: "Create a new set of flashcards from your notes.",
        href: "/flashcards",
        icon: <Copy className="h-6 w-6" />,
        image: PlaceHolderImages.find((img) => img.id === 'flashcard-feature'),
    },
    {
        title: "Create a Quiz",
        description: "Test your knowledge by generating a quiz.",
        href: "/quiz",
        icon: <FileQuestion className="h-6 w-6" />,
        image: PlaceHolderImages.find((img) => img.id === 'quiz-feature'),
    },
    {
        title: "Plan Your Studies",
        description: "Generate a personalized study schedule.",
        href: "/schedule",
        icon: <CalendarDays className="h-6 w-6" />,
        image: PlaceHolderImages.find((img) => img.id === 'schedule-feature'),
    },
    {
        title: "Study Material",
        description: "Analyse your documents to generate study materials.",
        href: "/study-material",
        icon: <PenLine className="h-6 w-6" />,
        image: PlaceHolderImages.find((img) => img.id === 'articles-notes-feature'),
    },
    {
        title: "Article",
        description: "Generate a full article from a topic or keywords.",
        href: "/article",
        icon: <Newspaper className="h-6 w-6" />,
        image: PlaceHolderImages.find((img) => img.id === 'article-feature'),
    },
    {
        title: "Writer",
        description: "Your AI-powered writing assistant.",
        href: "/writer",
        icon: <Bot className="h-6 w-6" />,
        image: PlaceHolderImages.find((img) => img.id === 'writer-feature'),
    },
    {
        title: "My Library",
        description: "Access your saved notes and study materials.",
        href: "/library",
        icon: <Library className="h-6 w-6" />,
        image: PlaceHolderImages.find((img) => img.id === 'library-feature'),
    },
]

export default function DashboardPage() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight font-headline">Welcome back!</h2>
                <p className="text-muted-foreground">
                    Ready to start studying? Here's what you can do.
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
