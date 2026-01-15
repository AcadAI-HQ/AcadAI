"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrainCircuit, Home, Route, User, Settings, LogOut, Crown, MessageSquareHeart } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";

const navigationItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
    description: "Overview and domain selection"
  },
  {
    title: "My Roadmap",
    url: "/dashboard/my-roadmap",
    icon: Route,
    description: "Your generated learning path"
  },
  {
    title: "Profile",
    url: "/dashboard/profile",
    icon: User,
    description: "View and edit your profile"
  },
  {
    title: "Feedback",
    url: "/dashboard/feedback",
    icon: MessageSquareHeart,
    description: "Send feedback or request features"
  },
  {
    title: "Upgrade to Premium",
    url: "/subscription",
    icon: Crown,
    description: "Unlock premium features",
    isPremium: true
  }
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const isPremium = user?.subscription?.tier === 'premium' && user?.subscription?.status === 'active';

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-2">
          <BrainCircuit className="h-6 w-6 text-primary" />
          <span className="font-headline text-xl font-bold">Acad AI</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => {
                const isActive = pathname === item.url ||
                  (item.url !== "/dashboard" && pathname.startsWith(item.url));

                // Hide premium upgrade link if user is already premium
                if (item.isPremium && isPremium) {
                  return null;
                }

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.description}
                      className={item.isPremium ? "bg-gradient-to-r from-[#29ABE2]/10 to-[#8E2DE2]/10 hover:from-[#29ABE2]/20 hover:to-[#8E2DE2]/20" : ""}
                    >
                      <Link href={item.url}>
                        <item.icon className={`h-4 w-4 ${item.isPremium ? 'text-[#29ABE2]' : ''}`} />
                        <span className={item.isPremium ? 'bg-gradient-to-r from-[#29ABE2] to-[#8E2DE2] bg-clip-text text-transparent font-medium' : ''}>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        {user && (
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {/* User Profile Display */}
                <SidebarMenuItem>
                  <div className="flex items-center gap-3 px-2 py-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={`https://api.dicebear.com/8.x/adventurer/svg?seed=${user.email}`}
                        alt={user.displayName ?? 'User'}
                      />
                      <AvatarFallback>
                        {user.displayName?.charAt(0).toUpperCase() ?? 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0 flex-1">
                      <p className="text-sm font-medium leading-none truncate">
                        {user.displayName}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </SidebarMenuItem>

                <SidebarSeparator />

                {/* Settings */}
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Account settings">
                    <Link href="/dashboard/profile">
                      <Settings className="h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {/* Logout */}
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={logout} tooltip="Sign out">
                    <LogOut className="h-4 w-4" />
                    <span>Log out</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}