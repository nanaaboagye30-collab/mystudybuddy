'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { handleGenerateSchedule, type GenerateStudyScheduleOutput } from '@/app/(app)/schedule/actions';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon, Loader2, Sparkles, ListChecks } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import type { ClientGoal } from '@/services/goals-service';

type WeeklyPlannerProps = {
    initialGoals?: ClientGoal[];
};

type GoalDetail = {
    id: string | number;
    goal: string;
    examDate?: Date;
    availability: string;
};

export function WeeklyPlanner({ initialGoals = [] }: WeeklyPlannerProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [goalDetails, setGoalDetails] = useState<GoalDetail[]>([]);
    const { toast } = useToast();
    const [generatedSchedule, setGeneratedSchedule] = useState<GenerateStudyScheduleOutput | null>(null);

    useEffect(() => {
        const details = initialGoals.length > 0 
            ? initialGoals.map(g => ({
                id: g.id,
                goal: g.courseName,
                examDate: g.startDate,
                availability: ''
              }))
            : [{ id: 'scratch-1', goal: '', availability: '', examDate: undefined }];

        setGoalDetails(details);
    }, [initialGoals]);

    const handleDateChange = (id: string | number, date: Date | undefined) => {
        setGoalDetails(prev => prev.map(d => d.id === id ? { ...d, examDate: date } : d));
    };

    const handleAvailabilityChange = (id: string | number, availability: string) => {
        setGoalDetails(prev => prev.map(d => d.id === id ? { ...d, availability: availability } : d));
    };
    
    const handleGoalChange = (id: string | number, goal: string) => {
        setGoalDetails(prev => prev.map(d => d.id === id ? { ...d, goal } : d));
    }


    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const allSubjects = goalDetails.map(d => d.goal).filter(Boolean).join(', ');
        const latestExamDate = goalDetails.reduce((latest, d) => {
            return (d.examDate && (!latest || d.examDate > latest)) ? d.examDate : latest;
        }, undefined as Date | undefined);
        const allAvailabilities = goalDetails.map(d => `${d.goal}: ${d.availability}`).filter(d => d.goal && d.availability).join('; ');

        if (!latestExamDate) {
            toast({ title: 'Please select at least one exam date.', variant: 'destructive' });
            return;
        }
        if (!allSubjects) {
            toast({ title: 'Please enter subjects.', variant: 'destructive' });
            return;
        }
        if (goalDetails.some(d => d.goal && !d.availability)) {
            toast({ title: 'Please enter your availability for all goals.', variant: 'destructive' });
            return;
        }
        
        setIsLoading(true);
        setGeneratedSchedule(null);

        try {
          const result = await handleGenerateSchedule({ 
            examDates: format(latestExamDate, 'yyyy-MM-dd'), 
            subjects: allSubjects, 
            availability: allAvailabilities 
          });
          if (result.schedule) {
            setGeneratedSchedule(result);
            toast({ title: 'Monthly Schedule Generated!', description: 'Your high-level plan is ready.' });
          } else {
            throw new Error('AI failed to generate a schedule.');
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
    
    const isFromGoals = initialGoals.length > 0;

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2 text-xl">
                    <Sparkles className="text-accent" />
                    Schedule Details
                    </CardTitle>
                    <CardDescription>
                        {isFromGoals ? "Your master plan goals are loaded. Confirm availability and generate your schedule." : "Add subjects, exam dates, and your availability to create a study plan."}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[40%]">{isFromGoals ? "My Goals" : "Subjects/Topics"}</TableHead>
                                    <TableHead>Exam Date</TableHead>
                                    <TableHead>Availability</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {goalDetails.map((detail) => (
                                    <TableRow key={detail.id}>
                                        <TableCell className="font-medium align-top">
                                            {isFromGoals ? detail.goal : (
                                                <Textarea
                                                    id="subjects"
                                                    name="subjects"
                                                    placeholder="e.g., Algebra, Chemistry"
                                                    rows={1}
                                                    value={detail.goal}
                                                    onChange={(e) => handleGoalChange(detail.id, e.target.value)}
                                                    disabled={isLoading}
                                                    required
                                                />
                                            )}
                                        </TableCell>
                                        <TableCell className="align-top">
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn(
                                                            "w-full justify-start text-left font-normal",
                                                            !detail.examDate && "text-muted-foreground"
                                                        )}
                                                        disabled={isLoading}
                                                    >
                                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                                        {detail.examDate ? format(detail.examDate, "LLL dd, yyyy") : <span>Pick a date</span>}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0">
                                                    <Calendar
                                                        mode="single"
                                                        selected={detail.examDate}
                                                        onSelect={(date) => handleDateChange(detail.id, date)}
                                                        initialFocus
                                                        disabled={(date) => date < new Date()}
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </TableCell>
                                        <TableCell className="align-top">
                                            <Textarea
                                                id={`availability-${detail.id}`}
                                                name={`availability-${detail.id}`}
                                                placeholder="e.g., 2 hrs weekdays"
                                                value={detail.availability}
                                                onChange={(e) => handleAvailabilityChange(detail.id, e.target.value)}
                                                disabled={isLoading}
                                                required
                                                className="h-full"
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                         <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                            {isLoading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                            <Sparkles className="mr-2 h-4 w-4" />
                            )}
                            Generate Monthly Schedule
                        </Button>
                    </form>
                </CardContent>
            </Card>
      
            {(isLoading || generatedSchedule) && (
                 <Card>
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center gap-2">
                            <ListChecks className="text-primary"/>
                            Monthly Study Plan: {generatedSchedule?.month}
                        </CardTitle>
                        <CardDescription>
                            Here is the high-level overview of your study plan for the month.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="min-h-[200px]">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-full">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                        ) : generatedSchedule && generatedSchedule.schedule.length > 0 ? (
                        <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Time</TableHead>
                                        <TableHead>Subject</TableHead>
                                        <TableHead>Week 1</TableHead>
                                        <TableHead>Week 2</TableHead>
                                        <TableHead>Week 3</TableHead>
                                        <TableHead>Week 4</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {generatedSchedule.schedule.map((item, index) => (
                                        <TableRow key={index}>
                                            <TableCell className="font-medium">{item.time}</TableCell>
                                            <TableCell>{item.subject}</TableCell>
                                            <TableCell>{item.week1}</TableCell>
                                            <TableCell>{item.week2}</TableCell>
                                            <TableCell>{item.week3}</TableCell>
                                            <TableCell>{item.week4}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="flex items-center justify-center h-full text-center text-muted-foreground">
                                <p>Your generated monthly schedule will appear here.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
