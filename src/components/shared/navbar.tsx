"use client";

import Link from "next/link";
import { BrainCircuit, User, LogOut, Settings, Star } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-card px-4 md:px-6">
      <nav className="flex-1">
        <Link href="/dashboard" className="flex items-center gap-2 text-lg font-semibold md:text-base">
          <BrainCircuit className="h-6 w-6 text-primary" />
          <span className="font-headline text-xl font-bold text-foreground sr-only sm:not-sr-only">Acad AI</span>
        </Link>
      </nav>
      <div className="flex items-center gap-4">
        {user?.subscriptionStatus === 'premium' && (
          <div className="flex items-center gap-2 text-yellow-400">
            <Star className="h-5 w-5 fill-current" />
            <span className="text-sm font-medium hidden sm:inline">Premium</span>
          </div>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar>
                <AvatarImage src={`https://api.dicebear.com/8.x/adventurer/svg?seed=${user?.email}`} alt={user?.displayName ?? 'User'} />
                <AvatarFallback>{user?.displayName?.charAt(0).toUpperCase() ?? 'U'}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.displayName}</p>
                <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}