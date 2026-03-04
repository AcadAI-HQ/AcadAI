"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, PanelLeft, User } from "lucide-react";
import { getCatAvatar } from "@/lib/avatar";
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
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import { useSidebar } from "../ui/sidebar";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard":                       "Dashboard",
  "/dashboard/my-roadmap":            "My Roadmap",
  "/dashboard/learning-resources":    "Learning Resources",
  "/dashboard/profile":               "Profile",
  "/dashboard/feedback":              "Feedback",
};

function getPageTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  if (pathname.startsWith("/roadmap/"))                           return "Roadmap";
  if (pathname.startsWith("/dashboard/learning-resources/"))      return "Learning Resources";
  return "Dashboard";
}

export function Navbar() {
  const { user, logout } = useAuth();
  const { toggleSidebar } = useSidebar();
  const pathname = usePathname();

  const pageTitle = getPageTitle(pathname);
  const initials  = user?.displayName
    ? user.displayName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? "U";

  return (
    <header className="sticky top-0 z-30 flex h-12 shrink-0 items-center gap-2 border-b border-border/60 bg-background/95 backdrop-blur-sm px-4 sm:px-5">
      {/* Mobile toggle */}
      <Button
        size="icon"
        variant="ghost"
        className="sm:hidden h-8 w-8 -ml-1"
        onClick={toggleSidebar}
      >
        <PanelLeft className="h-4 w-4" />
        <span className="sr-only">Toggle sidebar</span>
      </Button>

      <Separator orientation="vertical" className="sm:hidden h-4 mx-1" />

      {/* Page title */}
      <p className="text-sm font-medium text-foreground/80">{pageTitle}</p>

      {/* Right side */}
      <div className="ml-auto flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex h-8 w-8 items-center justify-center rounded-full overflow-hidden ring-1 ring-border/60 hover:ring-[#3B82F6]/40 transition-all">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={getCatAvatar(user?.email)}
                  alt={user?.displayName ?? "User"}
                />
                <AvatarFallback className="text-xs bg-[#3B82F6]/10 text-[#3B82F6] font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel className="pb-2">
              <p className="text-sm font-semibold leading-none">{user?.displayName}</p>
              <p className="mt-1 text-xs text-muted-foreground truncate">{user?.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/profile" className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
