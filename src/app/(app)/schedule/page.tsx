
'use client';

import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { handleGenerateDailyStudyPlan, handleSaveGoals, handleGetGoals } from './actions';
import { type GenerateDailyStudyPlanOutput } from '@/ai/flows/generate-daily-study-plan';
import { useAuth } from '@/hooks/use-auth';
import { Loader2, PlusCircle, Trash2, CalendarDays, ExternalLink, Save, BookOpen, GanttChartSquare } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { addWeeks, format, getISOWeek } from 'date-fns';
import { type ClientGoal } from '@/services/goals-service';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

const initialGoals: ClientGoal[] = [
    { id: 1, courseName: 'Google Data Analytics Certificate', startDate: new Date(), numberOfWeeks: 4, resourceLink: 'https://www.coursera.org/professional-certificates/google-data-analytics', goal: '', resource: '' },
    { id: 2, courseName: 'Advanced SQL for Data Scientists', startDate: addWeeks(new Date(), 2), numberOfWeeks: 2, resourceLink: '', goal: '', resource: '' },
];


export default function SchedulePage() {
    const { toast } = useToast();
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isFetching, setIsFetching] = useState(true);

    const [goals, setGoals] = useState<ClientGoal[]>(initialGoals);
    const [dailyPlan, setDailyPlan] = useState<GenerateDailyStudyPlanOutput | null>(null);
    
    useEffect(() => {
        if (user) {
            setIsFetching(true);
            handleGetGoals(user.uid)
                .then(result => {
                    if ('error' in result) {
                        toast({
                            title: "Failed to load goals",
                            description: result.error,
                            variant: "destructive"
                        });
                    } else if (result.length > 0) {
                        setGoals(result);
                    }
                })
                .catch(err => {
                    console.error(err);
                    toast({
                        title: "Failed to load goals",
                        description: "Using default example goals.",
                        variant: "destructive"
                    });
                })
                .finally(() => setIsFetching(false));
        } else {
            setIsFetching(false);
        }
    }, [user, toast]);


    const handleGoalChange = (id: number | string, field: keyof ClientGoal, value: any) => {
        setGoals(goals.map(g => (g.id === id ? { ...g, [field]: value } : g)));
    };

    const addGoal = () => {
        setGoals([...goals, { id: Date.now(), courseName: '', startDate: new Date(), numberOfWeeks: 1, resourceLink: '', goal: '', resource: '' }]);
    };

    const removeGoal = (id: number | string) => {
        setGoals(goals.filter(g => g.id !== id));
    };

    const handleSave = async () => {
        if (!user) {
            toast({ title: 'You must be logged in to save.', variant: 'destructive' });
            return;
        }
        setIsSaving(true);
        try {
            const result = await handleSaveGoals(user.uid, goals);
            if (result.success) {
                toast({ title: 'Goals Saved!', description: 'Your course planner has been updated.' });
            } else {
                toast({ title: 'Save Failed', description: result.error, variant: 'destructive' });
            }
        } catch (error) {
            console.error(error);
            toast({ title: 'An Unexpected Error Occurred', description: 'Could not save goals.', variant: 'destructive' });
        } finally {
            setIsSaving(false);
        }
    }


    const generatePlanForWeek = async (subject: string, weeklyTopic: string, weekNumber: number) => {
        setIsLoading(true);
        setDailyPlan(null);
        try {
            const result = await handleGenerateDailyStudyPlan({ subject, weeklyTopic, weekNumber });
            if ('error' in result) {
                toast({
                    title: 'Generation Failed',
                    description: result.error,
                    variant: 'destructive',
                });
            } else {
                setDailyPlan(result);
            }
        } catch (error) {
            toast({
                title: 'An Unexpected Error Occurred',
                description: 'Could not generate the daily plan.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    const ganttData = useMemo(() => {
        const today = new Date();
        const startWeek = getISOWeek(today);
        const weeks: { week: number; courses: { name: string; start: number; duration: number }[] }[] = [];

        for (let i = 0; i < 8; i++) {
            weeks.push({ week: startWeek + i, courses: [] });
        }
        
        if (isFetching) return [];

        goals.forEach(goal => {
            const goalStartWeek = getISOWeek(goal.startDate);
            for (let i = 0; i < goal.numberOfWeeks; i++) {
                const currentWeek = goalStartWeek + i;
                const weekIndex = weeks.findIndex(w => w.week === currentWeek);
                if (weekIndex !== -1) {
                    weeks[weekIndex].courses.push({ name: goal.courseName, start: 0, duration: 1 });
                }
            }
        });

        return weeks;
    }, [goals, isFetching]);
    

    const currentWeekNumber = getISOWeek(new Date());

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                         <div>
                            <CardTitle className="font-headline text-xl flex items-center gap-2"><GanttChartSquare /> My Course Planner</CardTitle>
                            <CardDescription>Plan your courses and generate weekly study schedules.</CardDescription>
                        </div>
                        <Button onClick={handleSave} disabled={isSaving || isFetching}>
                            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4" />}
                            Save
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                     {isFetching ? (
                        <div className="flex items-center justify-center h-48">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            <p className="ml-4 text-muted-foreground">Loading your saved planner...</p>
                        </div>
                    ) : (
                    <div className="space-y-4">
                        {goals.map((goal, index) => (
                            <div key={goal.id} className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 items-end p-4 border rounded-lg">
                                <div>
                                    <Label htmlFor={`courseName-${index}`}>Course Name</Label>
                                    <Input id={`courseName-${index}`} value={goal.courseName} onChange={e => handleGoalChange(goal.id, 'courseName', e.target.value)} />
                                </div>
                                <div>
                                    <Label htmlFor={`startDate-${index}`}>Start Date</Label>
                                    <Input type="date" id={`startDate-${index}`} value={format(goal.startDate, 'yyyy-MM-dd')} onChange={e => handleGoalChange(goal.id, 'startDate', new Date(e.target.value))} />
                                </div>
                                <div>
                                    <Label htmlFor={`weeks-${index}`}>No. of Weeks</Label>
                                    <Input type="number" id={`weeks-${index}`} value={goal.numberOfWeeks} onChange={e => handleGoalChange(goal.id, 'numberOfWeeks', parseInt(e.target.value))} min="1" />
                                </div>
                                 <div>
                                    <Label htmlFor={`resource-${index}`}>Resource Link (Optional)</Label>
                                    <Input id={`resource-${index}`} value={goal.resourceLink} onChange={e => handleGoalChange(goal.id, 'resourceLink', e.target.value)} placeholder="https://coursera.org/..." />
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => removeGoal(goal.id)} className="text-muted-foreground hover:text-destructive">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                         <Button variant="outline" onClick={addGoal}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Add Course
                        </Button>
                    </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-xl flex items-center gap-2"><CalendarDays /> Weekly Study View</CardTitle>
                    <CardDescription>Visualize your study plan and generate a detailed daily schedule for any week.</CardDescription>
                </CardHeader>
                <CardContent>
                     {isFetching ? (
                         <div className="flex items-center justify-center h-96">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                     ) : (
                    <div className="overflow-x-auto">
                        <Table className="min-w-max">
                             <TableHeader>
                                <TableRow>
                                    <TableHead className="w-1/4">Course</TableHead>
                                    {ganttData.map(({ week }) => (
                                        <TableHead key={week} className={`text-center ${week === currentWeekNumber ? 'text-primary font-bold' : ''}`}>
                                            Week {week}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                             <TableBody>
                                {goals.map(goal => (
                                    <TableRow key={goal.id}>
                                        <TableCell className="font-medium flex items-center gap-2">
                                            {goal.courseName}
                                            {goal.resourceLink && (
                                                <a href={goal.resourceLink} target="_blank" rel="noopener noreferrer">
                                                    <ExternalLink className="h-3 w-3 text-muted-foreground" />
                                                </a>
                                            )}
                                        </TableCell>
                                        {ganttData.map(({ week }) => {
                                            const goalStartWeek = getISOWeek(goal.startDate);
                                            const goalEndWeek = goalStartWeek + goal.numberOfWeeks - 1;
                                            const isInWeek = week >= goalStartWeek && week <= goalEndWeek;
                                            
                                            if (!isInWeek) {
                                                return <TableCell key={week} />;
                                            }

                                            return (
                                                <TableCell key={week} className="p-1">
                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                             <div 
                                                                className="h-8 bg-primary/20 border border-primary/50 rounded-md flex items-center justify-center text-primary-foreground cursor-pointer hover:bg-primary/40"
                                                                onClick={() => generatePlanForWeek(goal.courseName, `Week ${week - goalStartWeek + 1} of ${goal.courseName}`, week - goalStartWeek + 1)}
                                                              >
                                                                 
                                                              </div>
                                                        </DialogTrigger>
                                                        <DialogContent className="max-w-4xl">
                                                             <DialogHeader>
                                                                <DialogTitle>Daily Plan: {goal.courseName}</DialogTitle>
                                                                <DialogDescription>
                                                                    Generated study plan for Week {week}.
                                                                </DialogDescription>
                                                            </DialogHeader>
                                                             <div>
                                                                {isLoading ? (
                                                                    <div className="flex items-center justify-center h-64">
                                                                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                                                        <p className="ml-4 text-muted-foreground">Generating daily plan...</p>
                                                                    </div>
                                                                ) : dailyPlan ? (
                                                                    <Table>
                                                                        <TableHeader>
                                                                            <TableRow>
                                                                                <TableHead>Time</TableHead>
                                                                                <TableHead>Monday</TableHead>
                                                                                <TableHead>Tuesday</TableHead>
                                                                                <TableHead>Wednesday</TableHead>
                                                                                <TableHead>Thursday</TableHead>
                                                                                <TableHead>Friday</TableHead>
                                                                                <TableHead>Saturday</TableHead>
                                                                                <TableHead>Sunday</TableHead>
                                                                            </TableRow>
                                                                        </TableHeader>
                                                                        <TableBody>
                                                                            {dailyPlan.weeklySchedule.map((item, index) => (
                                                                                <TableRow key={index}>
                                                                                    <TableCell>{item.time}</TableCell>
                                                                                    <TableCell>{item.monday}</TableCell>
                                                                                    <TableCell>{item.tuesday}</TableCell>
                                                                                    <TableCell>{item.wednesday}</TableCell>
                                                                                    <TableCell>{item.thursday}</TableCell>
                                                                                    <TableCell>{item.friday}</TableCell>
                                                                                    <TableCell>{item.saturday}</TableCell>
                                                                                    <TableCell>{item.sunday}</TableCell>
                                                                                </TableRow>
                                                                            ))}
                                                                        </TableBody>
                                                                    </Table>
                                                                ) : (
                                                                    <p>Click the button to generate a plan.</p>
                                                                )}
                                                            </div>
                                                        </DialogContent>
                                                    </Dialog>
                                                </TableCell>
                                            );
                                        })}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                     )}
                </CardContent>
            </Card>
        </div>
    );
}
