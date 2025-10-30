'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Planner } from '@/components/planner';
import { WeeklyPlanner } from "@/components/schedule-generator";
import { MonthlyPlanner } from '@/components/monthly-planner';
import type { ClientGoal } from '@/services/goals-service';
import { getGoalsForUser } from '@/services/goals-service';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';


export default function SchedulePage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState('master-plan');
    
    // State for master planner (goals)
    const [goals, setGoals] = useState<ClientGoal[]>([]);
    const [isLoadingGoals, setIsLoadingGoals] = useState(true);


    useEffect(() => {
        if (user) {
            setIsLoadingGoals(true);
            getGoalsForUser(user.uid)
                .then(setGoals)
                .catch(err => {
                    console.error("Failed to load goals", err);
                    toast({
                        title: "Error",
                        description: "Could not load your saved goals.",
                        variant: "destructive"
                    });
                })
                .finally(() => setIsLoadingGoals(false));
        }
    }, [user, toast]);

    const handleGoalsSave = (savedGoals: ClientGoal[]) => {
        setGoals(savedGoals);
        // Maybe switch to another tab or just show a success message
        toast({
            title: "Master Plan Saved!",
            description: "Your courses have been updated.",
        });
    };

    const getTabTitle = () => {
        switch (activeTab) {
            case 'master-plan':
                return 'Master Planner';
            case 'monthly':
                return 'Monthly Schedule';
            case 'weekly':
                return 'Weekly Schedule';
            default:
                return 'Study Schedule';
        }
    }

    const memoizedGoals = useMemo(() => goals, [goals]);
    
    return (
        <div className="container mx-auto py-6">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">
                        {getTabTitle()}
                    </CardTitle>
                    <CardDescription>
                        Plan your courses and generate personalized schedules to stay on track.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="grid w-full grid-cols-3 max-w-2xl">
                            <TabsTrigger value="master-plan">Master Plan</TabsTrigger>
                            <TabsTrigger value="monthly">Monthly</TabsTrigger>
                            <TabsTrigger value="weekly">Weekly</TabsTrigger>
                        </TabsList>

                        <TabsContent value="master-plan" className="mt-4">
                             {isLoadingGoals ? (
                                <div className="flex items-center justify-center h-64">
                                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                </div>
                            ) : (
                               <Planner 
                                    initialGoals={memoizedGoals} 
                                    onGoalsSave={handleGoalsSave}
                                />
                            )}
                        </TabsContent>

                        <TabsContent value="monthly" className="mt-4">
                            <MonthlyPlanner goals={memoizedGoals} />
                        </TabsContent>
                        
                         <TabsContent value="weekly" className="mt-4">
                             <WeeklyPlanner
                                initialGoals={memoizedGoals}
                                key={`weekly-planner-${goals.map(g => g.id).join('-')}`}
                            />
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}
