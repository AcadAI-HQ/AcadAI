"use client";

import { ReactNode, useEffect, useState } from "react";
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from "@/hooks/use-auth";
import { Navbar } from "@/components/shared/navbar";
import { Skeleton } from "@/components/ui/skeleton";
import { Sidebar, SidebarProvider, SidebarInset, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { LayoutDashboard, Route, BrainCircuit, User, BookOpen, MessageSquareHeart, Sparkles, LogOut, Bot } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getCatAvatar } from "@/lib/avatar";

function useSpotlightDots(uid: string | undefined) {
  const [dots, setDots] = useState({ mentor: false, resources: false });

  useEffect(() => {
    if (!uid) return;
    const mentorVisited    = localStorage.getItem("acadai_visited_mentor") === "1";
    const resourcesVisited = localStorage.getItem("acadai_visited_resources") === "1";
    setDots({ mentor: !mentorVisited, resources: !resourcesVisited });
  }, [uid]);

  return dots;
}

// Pages that should not show the sidebar
const NO_SIDEBAR_PAGES = ['/login', '/signup', '/pricing', '/terms', '/privacy', '/onboarding'];

const NAV_ITEMS = [
  { title: 'Dashboard',          icon: LayoutDashboard,    href: '/dashboard',                     matchFn: (p: string) => p === '/dashboard' },
  { title: 'My Roadmap',         icon: Route,              href: '/dashboard/my-roadmap',          matchFn: (p: string) => p.startsWith('/dashboard/my-roadmap') || p.startsWith('/roadmap/') },
  { title: 'Learning Resources', icon: BookOpen,           href: '/dashboard/learning-resources',  matchFn: (p: string) => p.startsWith('/dashboard/learning-resources'), badge: true },
  { title: 'AI Mentor',          icon: Bot,                href: '/dashboard/ai-mentor',           matchFn: (p: string) => p.startsWith('/dashboard/ai-mentor'), badge: true },
  { title: 'Profile',            icon: User,               href: '/dashboard/profile',             matchFn: (p: string) => p === '/dashboard/profile' },
  { title: 'Feedback',           icon: MessageSquareHeart, href: '/dashboard/feedback',            matchFn: (p: string) => p === '/dashboard/feedback' },
];

export function ConditionalLayout({ children }: { children: ReactNode }) {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  // Protected routes that require authentication
  const protectedRoutes = ['/dashboard', '/roadmap'];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  // Redirect unauthenticated users from protected routes
  useEffect(() => {
    if (!loading && !user && isProtectedRoute) {
      router.replace('/');
    }
  }, [user, loading, isProtectedRoute, router]);

  // Must be called unconditionally before any early returns
  const spotlightDots = useSpotlightDots(user?.uid);

  // Don't show sidebar on specific pages or when user is not authenticated
  // Show sidebar on authenticated pages except login/signup and landing page
  const shouldShowSidebar = user &&
    !NO_SIDEBAR_PAGES.includes(pathname) &&
    pathname !== '/' &&
    !pathname.startsWith('/blog');

  if (loading) {
    // Show loading state with sidebar structure if appropriate
    if (shouldShowSidebar) {
      return (
        <div className="flex flex-col h-screen">
          <header className="flex h-16 shrink-0 items-center gap-4 border-b bg-card px-4 md:px-6">
            <Skeleton className="h-8 w-32" />
            <div className="ml-auto">
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>
          </header>
          <div className="flex flex-1">
            <div className="w-64 border-r bg-card p-4">
              <Skeleton className="h-8 w-full mb-4" />
              <Skeleton className="h-8 w-full" />
            </div>
            <main className="flex-1 flex justify-center">
              <div className="w-full max-w-5xl px-4 sm:px-6 py-4">
                <Skeleton className="h-12 w-1/2 mb-4" />
                <Skeleton className="h-8 w-1/3 mb-8" />
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <Skeleton className="h-48 rounded-lg" />
                  <Skeleton className="h-48 rounded-lg" />
                  <Skeleton className="h-48 rounded-lg" />
                </div>
              </div>
            </main>
          </div>
        </div>
      );
    }
    
    // Loading state without sidebar
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Skeleton className="h-8 w-32" />
      </div>
    );
  }

  // If no sidebar should be shown, render children directly
  if (!shouldShowSidebar) {
    return <>{children}</>;
  }

  const initials = user?.displayName
    ? user.displayName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? 'U';

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-muted/30">

        {/* ── Sidebar ── */}
        <Sidebar className="border-r border-border/60">
          <div className="flex h-full flex-col">

            {/* Logo */}
            <div className="flex h-14 items-center border-b border-border/60 px-4">
              <Link href="/dashboard" className="flex items-center gap-2.5 group">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#3B82F6]/10 transition-colors group-hover:bg-[#3B82F6]/20">
                  <BrainCircuit className="h-4 w-4 text-[#3B82F6]" />
                </div>
                <span className="font-headline text-lg font-semibold tracking-tight">Acad AI</span>
              </Link>
            </div>

            {/* Nav items */}
            <nav className="flex-1 overflow-y-auto py-3 px-2">
              <SidebarMenu className="gap-0.5">
                {NAV_ITEMS.map((item) => {
                  const active = item.matchFn(pathname);
                  return (
                    <SidebarMenuItem key={item.title}>
                      <Link href={item.href} className="w-full">
                        <SidebarMenuButton
                          isActive={active}
                          className={`w-full justify-start gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150 ${
                            active
                              ? 'bg-[#3B82F6]/12 text-[#3B82F6] hover:bg-[#3B82F6]/18'
                              : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                          }`}
                        >
                          <span className="relative shrink-0">
                            <item.icon className={`h-4 w-4 ${active ? 'text-[#3B82F6]' : ''}`} />
                            {/* Spotlight dot for unvisited AI Mentor */}
                            {item.title === 'AI Mentor' && spotlightDots.mentor && !active && (
                              <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-[#3B82F6] animate-pulse" />
                            )}
                            {/* Spotlight dot for unvisited Learning Resources */}
                            {item.title === 'Learning Resources' && spotlightDots.resources && !active && (
                              <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-[#3B82F6] animate-pulse" />
                            )}
                          </span>
                          <span className="flex-1">{item.title}</span>
                          {item.badge && (
                            <Sparkles className="h-3 w-3 shrink-0 text-[#29ABE2]" />
                          )}
                        </SidebarMenuButton>
                      </Link>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </nav>

            {/* User footer */}
            <div className="border-t border-border/60 p-3">
              <div className="flex items-center gap-3 rounded-lg px-2 py-2">
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarImage
                    src={getCatAvatar(user?.email)}
                    alt={user?.displayName ?? 'User'}
                  />
                  <AvatarFallback className="text-xs bg-[#3B82F6]/10 text-[#3B82F6] font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold">{user?.displayName}</p>
                  <p className="truncate text-[10px] text-muted-foreground">{user?.email}</p>
                </div>
                <button
                  onClick={logout}
                  title="Log out"
                  className="shrink-0 rounded-md p-1.5 text-muted-foreground/50 transition-colors hover:bg-destructive/10 hover:text-destructive"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

          </div>
        </Sidebar>

        {/* ── Main area ── */}
        <SidebarInset className="flex flex-1 flex-col min-w-0">
          <Navbar />
          <main className="flex-1 overflow-auto isolate">
            <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 py-5">
              {children}
            </div>
          </main>
        </SidebarInset>

      </div>
    </SidebarProvider>
  );
}