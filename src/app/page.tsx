import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BrainCircuit, Copy, FileQuestion, CalendarDays, MoveRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const features = [
  {
    icon: <Copy className="h-8 w-8 text-primary" />,
    title: 'Flashcard Generation',
    description: 'Turn your notes into interactive flashcards with a single click. Our AI finds the key points for you.',
    image: PlaceHolderImages.find((img) => img.id === 'flashcard-feature'),
  },
  {
    icon: <FileQuestion className="h-8 w-8 text-primary" />,
    title: 'Quiz Creation',
    description: 'Challenge yourself with AI-generated quizzes from your study materials. Adjust difficulty to match your learning pace.',
    image: PlaceHolderImages.find((img) => img.id === 'quiz-feature'),
  },
  {
    icon: <CalendarDays className="h-8 w-8 text-primary" />,
    title: 'Study Schedules',
    description: 'Get a personalized study plan based on your exam dates and topics. Stay organized and on track.',
    image: PlaceHolderImages.find((img) => img.id === 'schedule-feature'),
  },
];

const heroImage = PlaceHolderImages.find((img) => img.id === 'hero-image');

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
            <BrainCircuit className="h-7 w-7" />
            <span className='font-headline'>StudyBuddy AI</span>
          </Link>
          <Button asChild>
            <Link href="/dashboard">Get Started</Link>
          </Button>
        </div>
      </header>

      <main className="flex-grow">
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 text-center py-16 md:py-24">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4 font-headline">
            Supercharge Your Studies with AI
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Effortlessly create flashcards, quizzes, and personalized study schedules from your notes. Focus on learning, not preparing.
          </p>
          <Button size="lg" asChild>
            <Link href="/dashboard">
              Start Studying Now <MoveRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </section>

        {heroImage &&
          <section className="container mx-auto px-4 sm:px-6 lg:px-8 my-8">
            <div className="relative aspect-[3/2] max-w-5xl mx-auto rounded-xl overflow-hidden shadow-2xl">
              <Image
                src={heroImage.imageUrl}
                alt={heroImage.description}
                fill
                className="object-cover"
                data-ai-hint={heroImage.imageHint}
                priority
              />
            </div>
          </section>
        }

        <section id="features" className="bg-muted py-16 md:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold font-headline">Everything You Need to Succeed</h2>
              <p className="text-md md:text-lg text-muted-foreground mt-2">
                Our AI-powered tools are designed to make your study sessions more effective.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature) => (
                <Card key={feature.title} className="flex flex-col">
                  {feature.image &&
                    <div className="relative h-48 w-full">
                      <Image 
                        src={feature.image.imageUrl} 
                        alt={feature.image.description} 
                        fill
                        className="object-cover rounded-t-lg"
                        data-ai-hint={feature.image.imageHint}
                      />
                    </div>
                  }
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      {feature.icon}
                      <CardTitle className="font-headline text-xl">{feature.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} StudyBuddy AI. All rights reserved.</p>
      </footer>
    </div>
  );
}
