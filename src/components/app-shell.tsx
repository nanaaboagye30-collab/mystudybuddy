'use client';

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarTrigger,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
} from '@/components/ui/sidebar';
import { BrainCircuit, CalendarDays, Copy, FileQuestion, LayoutDashboard, PenLine, Settings, Newspaper, Bot, Library, LogOut } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { useAuth } from '@/hooks/use-auth';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/study-material', icon: PenLine, label: 'Study Material' },
  { href: '/article', icon: Newspaper, label: 'Article' },
  { href: '/writer', icon: Bot, label: 'Writer' },
  { href: '/flashcards', icon: Copy, label: 'Flashcards' },
  { href: '/quiz', icon: FileQuestion, label: 'Quizzes' },
  { href: '/schedule', icon: CalendarDays, label: 'Schedule' },
  { href: '/library', icon: Library, label: 'My Library' },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/login');
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarContent>
          <SidebarHeader>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="shrink-0" asChild>
                <Link href="/dashboard"><BrainCircuit className="size-5 text-primary" /></Link>
              </Button>
              <div className="flex-1 overflow-hidden">
                <p className="truncate font-headline text-lg font-semibold">StudyBuddy AI</p>
              </div>
            </div>
          </SidebarHeader>
          <SidebarMenu className="flex-1 p-2">
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname.startsWith(item.href)}
                  tooltip={{ children: item.label }}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
          <SidebarFooter>
             {user && (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="justify-start gap-2 p-2 h-auto w-full">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={user.photoURL || `https://picsum.photos/seed/user/100/100`} alt="User" />
                                <AvatarFallback>{user.email?.[0].toUpperCase() || 'U'}</AvatarFallback>
                            </Avatar>
                            <div className="text-left flex-1 overflow-hidden group-data-[collapsible=icon]:hidden">
                                <p className="truncate text-sm font-medium">{user.displayName || 'User'}</p>
                                <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                            </div>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="right" align="start" className="w-56">
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Settings</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleSignOut}>
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Log out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
             )}
          </SidebarFooter>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-4 border-b bg-background/50 backdrop-blur-sm px-6">
            <SidebarTrigger className="md:hidden" />
            <div className="flex-1">
                <h1 className="text-lg font-semibold font-headline">
                    {navItems.find(item => pathname.startsWith(item.href))?.label || 'Dashboard'}
                </h1>
            </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
