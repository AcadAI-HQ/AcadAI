
"use client";

import { ReactNode } from "react";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from "@/hooks/use-auth";
import { Navbar } from "@/components/shared/navbar";
import { Skeleton } from "@/components/ui/skeleton";
import { Sidebar, SidebarProvider, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { LayoutDashboard, Route, BrainCircuit } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  if (loading) {
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
          <main className="flex-1 p-6">
            <Skeleton className="h-12 w-1/2 mb-4" />
            <Skeleton className="h-8 w-1/3 mb-8" />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Skeleton className="h-48 rounded-lg" />
              <Skeleton className="h-48 rounded-lg" />
              <Skeleton className="h-48 rounded-lg" />
            </div>
          </main>
        </div>
      </div>
    );
  }

  const isRoadmapDisabled = !user?.lastGeneratedDomain;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <Sidebar>
          <div className="flex h-full max-h-screen flex-col gap-2">
            <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
                  <BrainCircuit className="h-6 w-6 text-primary" />
                  <span className="font-headline text-xl">Acad AI</span>
                </Link>
            </div>
            <div className="flex-1">
              <SidebarMenu className="p-2">
                <SidebarMenuItem>
                   <Link href="/dashboard" className="w-full">
                    <SidebarMenuButton isActive={pathname === '/dashboard'}>
                        <LayoutDashboard />
                        <span>Dashboard</span>
                    </SidebarMenuButton>
                   </Link>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                    <Link href="/dashboard/my-roadmap" className="w-full">
                      <SidebarMenuButton 
                        isActive={pathname.startsWith('/dashboard/my-roadmap') || pathname.startsWith('/roadmap/')}
                        tooltip={isRoadmapDisabled ? "Generate a roadmap first" : "View your roadmap"}
                      >
                          <Route />
                          <span>My Roadmap</span>
                      </SidebarMenuButton>
                    </Link>
                </SidebarMenuItem>
              </SidebarMenu>
            </div>
          </div>
        </Sidebar>
        <div className="flex flex-col sm:gap-4 sm:py-4 transition-all duration-300 ease-in-out sm:pl-[var(--sidebar-width-icon)] group-data-[state=expanded]/sidebar-wrapper:sm:pl-[var(--sidebar-width)]">
           <Navbar />
           <main className="flex-1 gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
              {children}
           </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

