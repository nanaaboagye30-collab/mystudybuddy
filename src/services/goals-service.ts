'use server';

import { db } from '@/lib/firebase-admin';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';

// Represents the data structure in Firestore
export type Goal = {
    id: string;
    courseName: string;
    startDate: Timestamp;
    numberOfWeeks: number;
    resourceLink?: string;
    // The fields below are kept for backwards compatibility but are no longer actively used in the new planner UI.
    goal: string;
    resource: string;
    date?: {
        from: Timestamp;
        to?: Timestamp;
    };
};

// This type is for the client-side representation, which uses JS Date objects
export type ClientGoal = {
    id: string | number;
    courseName: string;
    startDate: Date;
    numberOfWeeks: number;
    resourceLink?: string;
    // The fields below are kept for backwards compatibility but are no longer actively used in the new planner UI.
    goal: string;
    resource: string;
    date?: {
        from: Date;
        to?: Date;
    };
}

const goalsCollectionName = 'userGoals';

function getGoalsCollection() {
    if (!db) {
        return null;
    }
    return db.collection(goalsCollectionName);
}

export async function saveGoals(userId: string, goals: ClientGoal[]): Promise<void> {
    const goalsCollection = getGoalsCollection();
    if (!goalsCollection) {
        console.warn('Firebase Admin SDK is not initialized. Skipping save operation. Please configure server-side environment variables.');
        return;
    }

    const userGoalsRef = goalsCollection.doc(userId);
    
    // Map ClientGoal to Goal for Firestore serialization
    const goalsToSave = goals.map(g => ({
        courseName: g.courseName,
        startDate: Timestamp.fromDate(g.startDate),
        numberOfWeeks: g.numberOfWeeks,
        resourceLink: g.resourceLink || '',
        // Keep old fields for data model consistency, even if empty
        goal: g.courseName,
        resource: g.resourceLink || '',
        date: g.startDate ? { from: Timestamp.fromDate(g.startDate) } : undefined,
    }));
    
    await userGoalsRef.set({
        goals: goalsToSave,
        updatedAt: FieldValue.serverTimestamp(),
    });
}

export async function getGoalsForUser(userId: string): Promise<ClientGoal[]> {
    const goalsCollection = getGoalsCollection();
     if (!goalsCollection) {
        console.warn("Firebase Admin SDK is not initialized. Returning empty goals array.");
        return [];
    }

    const userGoalsRef = goalsCollection.doc(userId);
    const doc = await userGoalsRef.get();

    if (!doc.exists) {
        return [];
    }
    
    const data = doc.data();
    // Ensure the returned data matches the Goal structure
    const savedGoals: Goal[] = data?.goals || [];

    // Assign a temporary client-side ID if one doesn't exist from Firestore
    return savedGoals.map((g, index) => ({
        id: g.id || `fb-${index}`,
        courseName: g.courseName,
        startDate: g.startDate.toDate(),
        numberOfWeeks: g.numberOfWeeks,
        resourceLink: g.resourceLink || '',
        // back-compat
        goal: g.goal,
        resource: g.resource || '',
        date: g.date ? { from: g.date.from.toDate(), to: g.date.to?.toDate() } : undefined
    }));
}
