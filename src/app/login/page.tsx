
'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { auth } from '@/lib/firebase';
import { BrainCircuit, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { handleSignInWithEmail, handleSignInWithGoogle } from './actions';

export default function LoginPage() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const onGoogleSignIn = async () => {
        setIsLoading(true);
        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
            // Redirect will be handled by AuthProvider
        } catch (error) {
            toast({
                title: 'Sign In Failed',
                description: error instanceof Error ? error.message : 'An unexpected error occurred.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const onEmailSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsLoading(true);
        const formData = new FormData(event.currentTarget);
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;
        
        if (!email || !password) {
            toast({
                title: 'Sign In Failed',
                description: 'Email and password are required.',
                variant: 'destructive',
            });
            setIsLoading(false);
            return;
        }

        try {
            await signInWithEmailAndPassword(auth, email, password);
            // Redirect will be handled by AuthProvider
        } catch (error) {
            toast({
                title: 'Sign In Failed',
                description: error instanceof Error ? error.message : 'An unexpected error occurred.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <Card className="w-full max-w-sm">
                <CardHeader className="text-center">
                    <div className="mb-4 flex justify-center">
                        <BrainCircuit className="h-10 w-10 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-headline">Welcome to StudyBuddy AI</CardTitle>
                    <CardDescription>Sign in to continue to your dashboard</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={onEmailSignIn} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" name="email" type="email" placeholder="m@example.com" required disabled={isLoading} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" name="password" type="password" required disabled={isLoading} />
                        </div>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Sign In
                        </Button>
                    </form>
                    <div className="relative my-4">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                        </div>
                    </div>
                    <Button variant="outline" className="w-full" onClick={onGoogleSignIn} disabled={isLoading}>
                        {isLoading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                           <svg className="mr-2 h-4 w-4" viewBox="0 0 48 48" role="img" aria-label="Google logo">
                                <path fill="#4285F4" d="M24 9.5c3.23 0 5.45.98 6.94 2.31l4.9-4.9C32.13 3.98 28.53 2 24 2 15.6 2 8.64 6.78 6.55 13.84l5.88 4.57C13.6 14.54 18.33 9.5 24 9.5z"></path>
                                <path fill="#34A853" d="M46.5 24.81c0-1.63-.15-3.2-.42-4.72H24v9.09h12.62c-.54 2.94-2.14 5.45-4.63 7.17l5.88 4.57C42.4 36.32 46.5 31.25 46.5 24.81z"></path>
                                <path fill="#FBBC05" d="M12.43 28.41A13.9 13.9 0 0 1 12 24a13.9 13.9 0 0 1 .43-4.41l-5.88-4.57A22.01 22.01 0 0 0 2 24c0 3.73.93 7.22 2.55 10.24l5.88-4.83z"></path>
                                <path fill="#EA4335" d="M24 46c4.53 0 8.13-1.53 10.82-4.14l-5.88-4.57c-1.53 1.03-3.48 1.64-5.94 1.64-5.67 0-10.4-4.04-12.22-9.43L6.55 34.16C8.64 41.22 15.6 46 24 46z"></path>
                                <path fill="none" d="M2 2h44v44H2z"></path>
                           </svg>
                        )}
                        Google
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
