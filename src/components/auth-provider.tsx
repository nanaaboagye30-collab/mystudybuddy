'use client';

import { createContext, useEffect, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export const AuthContext = createContext<{ user: User | null }>({ user: null });

const unauthenticatedRoutes = ['/login'];

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (loading) return;

        if (!user && !unauthenticatedRoutes.includes(pathname)) {
            router.push('/login');
        } else if (user && unauthenticatedRoutes.includes(pathname)) {
            router.push('/dashboard');
        }
    }, [user, loading, pathname, router]);

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (!user && !unauthenticatedRoutes.includes(pathname)) {
        return null;
    }

    if (user && unauthenticatedRoutes.includes(pathname)) {
        return null;
    }

    return <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>;
}
