"use client"

import * as React from "react"
import { format, addDays } from "date-fns"
import { Calendar as CalendarIcon, PlusCircle, Save, Trash2, Edit, Link as LinkIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Input } from "./ui/input";
import { useAuth } from "@/hooks/use-auth";
import { saveGoals, type ClientGoal as Goal } from "@/services/goals-service";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "./ui/dialog"
import { Label } from "./ui/label"


type Course = {
    id: string | number;
    courseName: string;
    startDate: Date;
    numberOfWeeks: number;
    resourceLink?: string;
}

type CalendarRow = {
    courseName: string;
    week: number;
    startDate: string;
    endDate: string;
    examDate: string;
    calendarEvent: string;
}

const CourseDialog = ({
    onSave,
    courseToEdit,
    onClose,
}: {
    onSave: (course: Omit<Course, 'id'>) => void;
    courseToEdit?: Course;
    onClose: () => void;
}) => {
    const [courseName, setCourseName] = React.useState(courseToEdit?.courseName || '');
    const [startDate, setStartDate] = React.useState<Date | undefined>(courseToEdit?.startDate);
    const [numberOfWeeks, setNumberOfWeeks] = React.useState(courseToEdit?.numberOfWeeks || 1);
    const [resourceLink, setResourceLink] = React.useState(courseToEdit?.resourceLink || '');

    const handleSave = () => {
        if (courseName && startDate) {
            onSave({ courseName, startDate, numberOfWeeks, resourceLink });
            onClose();
        }
    }

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{courseToEdit ? 'Edit Course' : 'Add Course'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="course-name">Course Name</Label>
                    <Input id="course-name" value={courseName} onChange={(e) => setCourseName(e.target.value)} placeholder="e.g., Google Data Analytics Certificate" />
                </div>
                <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className={cn(
                            "w-full justify-start text-left font-normal",
                            !startDate && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                        </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                        <Calendar
                            mode="single"
                            selected={startDate}
                            onSelect={setStartDate}
                            initialFocus
                        />
                        </PopoverContent>
                    </Popover>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="weeks">Number of Weeks</Label>
                    <Input id="weeks" type="number" value={numberOfWeeks} onChange={(e) => setNumberOfWeeks(Number(e.target.value))} min="1" />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="resource-link">Resource Link (Optional)</Label>
                    <Input id="resource-link" value={resourceLink} onChange={(e) => setResourceLink(e.target.value)} placeholder="https://example.com/course-page" />
                </div>
            </div>
            <DialogFooter>
                <Button onClick={handleSave}>Save Course</Button>
            </DialogFooter>
        </DialogContent>
    )
}


type PlannerProps = {
    initialGoals: Goal[];
    onGoalsSave: (goals: Goal[]) => void;
};

export function Planner({ initialGoals, onGoalsSave }: PlannerProps) {
    const { user } = useAuth();
    const { toast } = useToast();
    const [courses, setCourses] = React.useState<Course[]>(initialGoals);
    const [calendarRows, setCalendarRows] = React.useState<CalendarRow[]>([]);
    const [isSaving, setIsSaving] = React.useState(false);
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);
    const [editingCourse, setEditingCourse] = React.useState<Course | undefined>(undefined);


    React.useEffect(() => {
        setCourses(initialGoals);
    }, [initialGoals]);

    React.useEffect(() => {
        const rows: CalendarRow[] = [];
        courses.forEach(c => {
            for (let week = 1; week <= c.numberOfWeeks; week++) {
                const weekStart = addDays(c.startDate, (week - 1) * 7);
                const weekEnd = addDays(weekStart, 6);
                rows.push({
                    courseName: c.courseName,
                    week: week,
                    startDate: format(weekStart, 'yyyy-MM-dd'),
                    endDate: format(weekEnd, 'yyyy-MM-dd'),
                    examDate: format(weekEnd, 'yyyy-MM-dd'),
                    calendarEvent: `${c.courseName} – Week ${week} Module Deadline`
                });
            }
        });
        setCalendarRows(rows);
    }, [courses]);
    
    const handleSaveCourse = (newCourseData: Omit<Course, 'id'>) => {
        if (editingCourse) {
            setCourses(courses.map(c => c.id === editingCourse.id ? { ...c, ...newCourseData} : c));
        } else {
             setCourses([...courses, { ...newCourseData, id: `new-${Date.now()}` }]);
        }
        setEditingCourse(undefined);
    }
    
    const handleOpenDialog = (course?: Course) => {
        setEditingCourse(course);
        setIsDialogOpen(true);
    };

    const handleDeleteCourse = (courseId: string | number) => {
        setCourses(courses.filter(c => c.id !== courseId));
    }


    const handleSaveGoals = async () => {
        if (!user) {
            toast({ title: "You must be logged in to save goals.", variant: "destructive"});
            return;
        }

        setIsSaving(true);
        try {
            const goalsToSave: Goal[] = courses.map(c => ({
                id: typeof c.id === 'string' && c.id.startsWith('new-') ? '' : c.id,
                courseName: c.courseName,
                startDate: c.startDate,
                numberOfWeeks: c.numberOfWeeks,
                resourceLink: c.resourceLink || '',
                // These are no longer used but need to be here to satisfy the type
                goal: c.courseName,
                resource: c.resourceLink || '',
                date: { from: c.startDate }
            }));

            await saveGoals(user.uid, goalsToSave);
            onGoalsSave(goalsToSave);
        } catch(error) {
            console.error("Failed to save goals", error);
            toast({
                title: "Save Failed",
                description: "Could not save your goals. Please check your connection or try again later.",
                variant: "destructive"
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="font-headline">My Course Calendar</CardTitle>
                        <CardDescription>Plan your courses and automatically see your weekly schedule.</CardDescription>
                    </div>
                     <div className="flex gap-2">
                         <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button size="sm" onClick={() => handleOpenDialog()} disabled={isSaving}>
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Add Course
                                </Button>
                            </DialogTrigger>
                             <CourseDialog onSave={handleSaveCourse} courseToEdit={editingCourse} onClose={() => { setIsDialogOpen(false); setEditingCourse(undefined); }} />
                        </Dialog>
                        <Button size="sm" variant="outline" onClick={handleSaveGoals} disabled={isSaving || courses.length === 0}>
                            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            Save Planner
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Course</TableHead>
                            <TableHead>Week</TableHead>
                            <TableHead>Start Date</TableHead>
                            <TableHead>End Date</TableHead>
                            <TableHead>Exam Date</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {calendarRows.map((row, index) => (
                            <TableRow key={index}>
                                <TableCell className="font-medium">{row.courseName}</TableCell>
                                <TableCell>{row.week}</TableCell>
                                <TableCell>{row.startDate}</TableCell>
                                <TableCell>{row.endDate}</TableCell>
                                <TableCell>{row.examDate}</TableCell>
                            </TableRow>
                        ))}
                        {calendarRows.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    No courses added yet. Click "Add Course" to get started.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
                
                 {courses.length > 0 && (
                    <div className="mt-6">
                        <h3 className="text-lg font-headline mb-2">Enrolled Courses</h3>
                        <div className="space-y-2">
                        {courses.map(course => (
                            <Card key={course.id} className="flex items-center justify-between p-3">
                                <div>
                                    <p className="font-semibold">{course.courseName}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {course.numberOfWeeks} weeks starting {format(course.startDate, 'PPP')}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                     {course.resourceLink && (
                                        <Button asChild variant="outline" size="icon">
                                             <a href={course.resourceLink} target="_blank" rel="noopener noreferrer">
                                                <LinkIcon className="h-4 w-4" />
                                             </a>
                                        </Button>
                                     )}
                                     <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(course)}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => handleDeleteCourse(course.id)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            </Card>
                        ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
