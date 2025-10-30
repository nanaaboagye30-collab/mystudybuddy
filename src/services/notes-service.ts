'use server';

import { db } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export type SavedNote = {
    id: string;
    userId: string;
    topic: string;
    type: 'study-notes' | 'article-analysis';
    content: any;
    createdAt: Date;
};

function getNotesCollection() {
    if (!db) {
        console.warn('Firebase Admin SDK is not initialized. Cannot get notes collection.');
        return null;
    }
    return db.collection('notes');
}


export async function saveNote(userId: string, topic: string, type: 'study-notes' | 'article-analysis', content: any): Promise<string> {
    const notesCollection = getNotesCollection();
    if (!notesCollection) {
        console.warn('Firebase Admin SDK is not initialized. Skipping save operation. Please configure server-side environment variables.');
        return '';
    }

    const noteRef = notesCollection.doc();
    await noteRef.set({
        userId,
        topic,
        type,
        content,
        createdAt: FieldValue.serverTimestamp(),
    });
    return noteRef.id;
}

export async function getNotesForUser(userId: string): Promise<SavedNote[]> {
    const notesCollection = getNotesCollection();
    if (!notesCollection) {
        console.warn("Firebase Admin SDK is not initialized. Skipping fetching notes from Firestore. Please configure server-side environment variables.");
        return [];
    }

    const snapshot = await notesCollection.where('userId', '==', userId).orderBy('createdAt', 'desc').get();
    if (snapshot.empty) {
        return [];
    }
    return snapshot.docs.map(doc => {
        const data = doc.data();
        const content = data.content;
        
        return {
            id: doc.id,
            userId: data.userId,
            topic: data.topic,
            type: data.type,
            content: content,
            createdAt: data.createdAt.toDate(),
        };
    });
}
