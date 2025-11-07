"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ClientGoal } from "@/services/goals-service";
// --- CORRECTED IMPORTS FOR GenerateDailyStudyPlanOutput ---
import { handleGenerateDailyPlan } from "@/app/(app)/schedule/daily-actions";
import { type GenerateDailyStudyPlanOutput } from "@/ai/flows/generate-daily-study-plan";
// --- END CORRECTED IMPORTS ---
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Separator } from "./ui/separator";

const months = [
    { value: "0", label: "January" },
    { value: "1", label: "February" },
    { value: "2", label: "March" },
    { value: "3", label: "April" },
    { value: "4", label: "May" },
    { value: "5", label: "June" },
    { value: "6", label: "July" },
    { value: "7", label: "August" },
    { value: "8", label: "September" },
    { value: "9", label: "October" },
    { value: "10", label: "November" },
    { value: "11", label: "December" },
];

const getYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = 0; i < 5; i++) {
        years.push({ value: String(currentYear + i), label: String(currentYear + i) });
    }
    return years;
};

const weeks = [
    { value: "all", label: "All Weeks" },
    { value: "1", label: "Week 1" },
    { value: "2", label: "Week 2" },
    { value: "3", label: "Week 3" },
    { value: "4", label: "Week 4" },
];

type MonthlyPlannerProps = {
    goals: ClientGoal[];
};

type DailyPlanResult = {
    week: number;
    plan: GenerateDailyStudyPlanOutput;
};

export function MonthlyPlanner({ goals }: MonthlyPlannerProps) {
    const [date, setDate] = useState<Date>(new Date());
    const [selectedWeek, setSelectedWeek] = useState<string>("all");
    const years = getYears();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [dailyPlans, setDailyPlans] = useState<DailyPlanResult[]>([]);
    
    const handleMonthChange = (month: string) => {
        const newDate = new Date(date);
        newDate.setMonth(parseInt(month, 10));
        setDate(newDate);
    }

    const handleYearChange = (year: string) => {
        const newDate = new Date(date);
        newDate.setFullYear(parseInt(year, 10));
        setDate(newDate);
    }
    
    const handleSubmit = async () => {
        if (goals.length === 0) {
            toast({ title: 'Please add at least one course in the Master Plan tab.', variant: 'destructive' });
            return;
        }

        const allSubjects = goals.map(d => d.courseName).filter(Boolean).join(', ');
        const weeklyTopic = `Continue studies for the following courses: ${allSubjects}`;

        setIsLoading(true);
        setDailyPlans([]);

        try {
            const weeksToGenerate = selectedWeek === 'all' ? [1, 2, 3, 4] : [parseInt(selectedWeek, 10)];
            const results: DailyPlanResult[] = [];

            for (const week of weeksToGenerate) {
                const result = await handleGenerateDailyPlan({ 
                    subject: allSubjects, 
                    weeklyTopic: weeklyTopic, 
                    weekNumber: week
                });
                if (result.weeklySchedule) {
                    results.push({ week, plan: result });
                } else {
                    throw new Error(`AI failed to generate a daily plan for week ${week}.`);
                }
            }

            setDailyPlans(results);
            toast({ title: 'Daily Plan Generated!', description: `Your study plan is ready.` });

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
    
    const DailyPlanTable = ({ week, plan }: DailyPlanResult) => {
        const weeklySchedule = useMemo(() => {
            if (!plan?.weeklySchedule) return [];
            return plan.weeklySchedule;
        }, [plan]);

        return (
             <div className="mt-4">
                <h4 className="font-headline text-md mb-2">Week {week} Daily Plan</h4>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">Time</TableHead>
                            <TableHead className="w-[150px]">Course</TableHead>
                            <TableHead>MON</TableHead>
                            <TableHead>TUE</TableHead>
                            <TableHead>WED</TableHead>
                            <TableHead>THU</TableHead>
                            <TableHead>FRI</TableHead>
                            <TableHead>SAT</TableHead>
                            <TableHead>SUN</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {weeklySchedule.map((item, index) => (
                            <TableRow key={index}>
                                <TableCell className="font-medium">{item.time}</TableCell>
                                <TableCell>{item.course}</TableCell>
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
            </div>
        )
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <CardTitle className="font-headline">Monthly Planner</CardTitle>
                        <CardDescription>Generate a detailed daily breakdown for any week of the month.</CardDescription>
                    </div>
                </div>

            </CardHeader>
            <CardContent>
                <div className="mt-6">
                    <Separator className="my-4"/>
                    <div className="flex items-center justify-between">
                         <div>
                            <h3 className="font-headline text-lg">Generate Daily Plan</h3>
                            <p className="text-muted-foreground text-sm">Select a month and week to generate a daily task breakdown.</p>
                        </div>
                        <div className="flex items-center gap-2">
                             <Select
                                value={String(date.getMonth())}
                                onValueChange={handleMonthChange}
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Select month" />
                                </SelectTrigger>
                                <SelectContent>
                                    {months.map(m => (
                                        <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                             <Select
                                value={String(date.getFullYear())}
                                onValueChange={handleYearChange}
                            >
                                <SelectTrigger className="w-[120px]">
                                    <SelectValue placeholder="Select year" />
                                </SelectTrigger>
                                <SelectContent>
                                    {years.map(y => (
                                         <SelectItem key={y.value} value={y.value}>{y.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select
                                value={selectedWeek}
                                onValueChange={setSelectedWeek}
                            >
                                <SelectTrigger className="w-[120px]">
                                    <SelectValue placeholder="Select week" />
                                </SelectTrigger>
                                <SelectContent>
                                    {weeks.map(w => (
                                         <SelectItem key={w.value} value={w.value}>{w.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button onClick={handleSubmit} disabled={isLoading || goals.length === 0}>
                                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                                Generate
                            </Button>
                        </div>
                    </div>
                </div>

                {(isLoading || dailyPlans.length > 0) && (
                    <div className="mt-6">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-40">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                        ) : (
                            dailyPlans.map(result => <DailyPlanTable key={result.week} {...result} />)
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
